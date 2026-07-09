import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStoreSession } from "@/lib/auth/session";

const GRAPH = "https://graph.facebook.com/v21.0";

async function validatePageToken(
  pageId: string,
  accessToken: string
): Promise<{
  pageName: string;
  igAccountId: string | null;
  igUsername: string | null;
}> {
  const url = new URL(`${GRAPH}/${pageId}`);
  url.searchParams.set(
    "fields",
    "id,name,access_token,instagram_business_account{id,username}"
  );
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message ?? "Token o página no válidos");
  }

  if (data.id !== pageId) {
    throw new Error("El token no corresponde a esa página");
  }

  return {
    pageName: data.name ?? `Página ${pageId}`,
    igAccountId: data.instagram_business_account?.id ?? null,
    igUsername: data.instagram_business_account?.username ?? null,
  };
}

export async function POST(request: Request) {
  try {
    const session = await requireStoreSession();
    const body = await request.json();

    const pageId = String(body.pageId ?? "").trim();
    const accessToken = String(body.accessToken ?? "").trim();
    const igAccountId = String(body.igAccountId ?? "").trim() || null;

    if (!pageId || !accessToken) {
      return NextResponse.json(
        { error: "ID de página y token de acceso son obligatorios" },
        { status: 400 }
      );
    }

    const validated = await validatePageToken(pageId, accessToken);
    const finalIgId = igAccountId ?? validated.igAccountId;

    if (!finalIgId) {
      return NextResponse.json(
        {
          error:
            "No se detectó Instagram Business en esta página. Vincula Instagram a la página en Meta o ingresa el ID de cuenta IG manualmente.",
        },
        { status: 400 }
      );
    }

    await prisma.storeSocialAccount.upsert({
      where: { storeId: session.storeId },
      create: {
        storeId: session.storeId,
        metaPageId: pageId,
        metaPageName: validated.pageName,
        metaIgAccountId: finalIgId,
        metaIgUsername: validated.igUsername,
        metaAccessToken: accessToken,
        connectedAt: new Date(),
      },
      update: {
        metaPageId: pageId,
        metaPageName: validated.pageName,
        metaIgAccountId: finalIgId,
        metaIgUsername: validated.igUsername,
        metaAccessToken: accessToken,
        connectedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      pageName: validated.pageName,
      igUsername: validated.igUsername,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("autenticado")) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const msg = error instanceof Error ? error.message : "Error al conectar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
