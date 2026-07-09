import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStoreSession } from "@/lib/auth/session";
import type { MetaPageOption } from "@/lib/meta/oauth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireStoreSession();
    const body = await request.json();
    const pendingId = body.pendingId as string;
    const pageId = body.pageId as string;

    if (!pendingId || !pageId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const pending = await prisma.metaOAuthPending.findUnique({
      where: { id: pendingId },
    });

    if (!pending || pending.storeId !== session.storeId) {
      return NextResponse.json({ error: "Sesión no válida" }, { status: 400 });
    }

    if (pending.expiresAt < new Date()) {
      await prisma.metaOAuthPending.delete({ where: { id: pendingId } });
      return NextResponse.json({ error: "La sesión expiró, conecta de nuevo" }, { status: 400 });
    }

    const pages = JSON.parse(pending.pagesJson) as MetaPageOption[];
    const selected = pages.find((p) => p.pageId === pageId);

    if (!selected) {
      return NextResponse.json({ error: "Página no encontrada" }, { status: 400 });
    }

    await prisma.storeSocialAccount.upsert({
      where: { storeId: session.storeId },
      create: {
        storeId: session.storeId,
        metaPageId: selected.pageId,
        metaPageName: selected.pageName,
        metaIgAccountId: selected.igAccountId,
        metaIgUsername: selected.igUsername,
        metaAccessToken: selected.pageAccessToken,
        connectedAt: new Date(),
      },
      update: {
        metaPageId: selected.pageId,
        metaPageName: selected.pageName,
        metaIgAccountId: selected.igAccountId,
        metaIgUsername: selected.igUsername,
        metaAccessToken: selected.pageAccessToken,
        connectedAt: new Date(),
      },
    });

    await prisma.metaOAuthPending.delete({ where: { id: pendingId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireStoreSession();
    const pendingId = request.nextUrl.searchParams.get("pendingId");

    if (!pendingId) {
      return NextResponse.json({ error: "pendingId requerido" }, { status: 400 });
    }

    const pending = await prisma.metaOAuthPending.findUnique({
      where: { id: pendingId },
    });

    if (!pending || pending.storeId !== session.storeId || pending.expiresAt < new Date()) {
      return NextResponse.json({ error: "Sesión expirada" }, { status: 400 });
    }

    const pages = JSON.parse(pending.pagesJson) as MetaPageOption[];
    return NextResponse.json({
      pages: pages.map((p) => ({
        pageId: p.pageId,
        pageName: p.pageName,
        igUsername: p.igUsername,
        hasInstagram: Boolean(p.igAccountId),
      })),
    });
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
}
