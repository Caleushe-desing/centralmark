import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publishOfferToSocial } from "@/lib/meta/publisher";
import { getMetaCredentialsForStore } from "@/lib/meta/credentials";
import { ensurePublicImageUrl } from "@/lib/ftp/upload";
import { requireAdminSession } from "@/lib/auth/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { content: true, store: { include: { mall: true, socialAccount: true } } },
  });

  if (!offer || !offer.content) {
    return NextResponse.json({ error: "Oferta sin contenido generado" }, { status: 400 });
  }

  if (offer.status !== "APPROVED" && offer.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "La oferta debe estar aprobada antes de publicar" },
      { status: 400 }
    );
  }

  let imagePath = offer.content.imagePath;
  try {
    imagePath = await ensurePublicImageUrl(imagePath);
    if (imagePath !== offer.content.imagePath) {
      await prisma.generatedContent.update({
        where: { offerId: id },
        data: { imagePath },
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Error subiendo imagen al hosting: ${error.message}`
            : "Error subiendo imagen al hosting",
      },
      { status: 500 }
    );
  }

  const metaCreds = await getMetaCredentialsForStore(offer.storeId);
  if (!metaCreds) {
    return NextResponse.json(
      {
        error:
          "La tienda no tiene Facebook/Instagram conectados. Pide a la tienda que vaya a Configuración → Conectar redes.",
      },
      { status: 400 }
    );
  }

  const results = await publishOfferToSocial({
    imagePath,
    captionInstagram: offer.content.captionInstagram,
    captionFacebook: offer.content.captionFacebook,
    hashtags: offer.content.hashtags,
    meta: metaCreds,
  });

  for (const result of results) {
    await prisma.publication.upsert({
      where: {
        id: `${offer.id}-${result.platform}`,
      },
      create: {
        id: `${offer.id}-${result.platform}`,
        offerId: offer.id,
        platform: result.platform,
        status: result.success ? "SUCCESS" : "FAILED",
        externalPostId: result.externalPostId,
        errorMessage: result.errorMessage,
        publishedAt: result.success ? new Date() : null,
      },
      update: {
        status: result.success ? "SUCCESS" : "FAILED",
        externalPostId: result.externalPostId,
        errorMessage: result.errorMessage,
        publishedAt: result.success ? new Date() : null,
      },
    });
  }

  const allSuccess = results.every((r) => r.success);
  const anySuccess = results.some((r) => r.success);

  await prisma.offer.update({
    where: { id },
    data: { status: anySuccess ? "PUBLISHED" : offer.status },
  });

  await prisma.publication.upsert({
    where: { id: `${offer.id}-VITRINA` },
    create: {
      id: `${offer.id}-VITRINA`,
      offerId: offer.id,
      platform: "VITRINA",
      status: "SUCCESS",
      publishedAt: new Date(),
    },
    update: {
      status: "SUCCESS",
      publishedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: anySuccess,
    allSuccess,
    results,
  });
}
