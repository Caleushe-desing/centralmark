import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStoreSession } from "@/lib/auth/session";
import { getStoreSocialStatus } from "@/lib/meta/credentials";
import { getMetaAppConfig } from "@/lib/meta/oauth";

export async function GET() {
  try {
    const session = await requireStoreSession();
    const status = await getStoreSocialStatus(session.storeId);
    const metaApp = getMetaAppConfig();

    return NextResponse.json({
      ...status,
      oauthAvailable: Boolean(metaApp),
      redirectHint: metaApp
        ? "Usa Conectar con Facebook para autorizar tu página e Instagram"
        : "El administrador del mall debe configurar META_APP_ID en el servidor",
    });
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const session = await requireStoreSession();

    await prisma.storeSocialAccount.updateMany({
      where: { storeId: session.storeId },
      data: {
        metaPageId: null,
        metaPageName: null,
        metaIgAccountId: null,
        metaIgUsername: null,
        metaAccessToken: null,
        metaTokenExpiresAt: null,
        connectedAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
}
