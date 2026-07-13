import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStoreSession } from "@/lib/auth/session";
import { runOfferGenerationPipeline } from "@/lib/ai/pipeline";
import { moderateUserContent } from "@/lib/ai/moderation";
import { parseOfferBrief } from "@/lib/ai/parse-brief";
import { saveCustomOfferImage } from "@/lib/image/save-custom";

export async function GET() {
  try {
    const session = await requireStoreSession();
    const offers = await prisma.offer.findMany({
      where: { storeId: session.storeId },
      include: { content: true, publications: true, store: { include: { mall: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(offers);
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStoreSession();
    const formData = await request.formData();

    const aiBrief = (formData.get("aiBrief") as string)?.trim() || null;
    const caption = (formData.get("caption") as string)?.trim() || null;
    const offerHashtags = (formData.get("offerHashtags") as string)?.trim() || null;

    if (!aiBrief) {
      return NextResponse.json(
        { error: "Describe tu publicación — la IA creará el resto" },
        { status: 400 }
      );
    }

    if (!caption) {
      return NextResponse.json({ error: "El texto de la publicación es requerido" }, { status: 400 });
    }

    if (!offerHashtags) {
      return NextResponse.json({ error: "Los hashtags son requeridos" }, { status: 400 });
    }

    const parsed = await parseOfferBrief(aiBrief);
    const productName = parsed.productName;
    const discountPercent = parsed.discountPercent ?? 0;
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (parsed.validityDays ?? 7));

    const moderation = await moderateUserContent({
      productName,
      aiBrief,
      description: caption,
      offerHashtags,
    });

    if (!moderation.approved) {
      return NextResponse.json({ error: moderation.issues.join("\n") }, { status: 422 });
    }

    const safe = moderation.fields;

    const offer = await prisma.offer.create({
      data: {
        storeId: session.storeId,
        productName: safe.productName ?? productName,
        discountPercent,
        description: safe.description ?? caption,
        offerHashtags: offerHashtags,
        aiBrief: safe.aiBrief ?? aiBrief,
        startDate,
        endDate,
        status: "DRAFT",
      },
    });

    const finalImage = formData.get("finalImage");
    if (finalImage instanceof File && finalImage.size > 0) {
      const buffer = Buffer.from(await finalImage.arrayBuffer());
      const imagePath = await saveCustomOfferImage(offer.id, buffer);
      await prisma.offer.update({
        where: { id: offer.id },
        data: { productImageUrl: imagePath },
      });
    }

    const generated = await runOfferGenerationPipeline(offer.id, { skipModeration: true });
    return NextResponse.json(generated, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error creando oferta";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
