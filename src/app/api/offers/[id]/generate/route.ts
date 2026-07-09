import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runOfferGenerationPipeline } from "@/lib/ai/pipeline";
import { getStoreSession, getAdminSession } from "@/lib/auth/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [storeSession, adminSession] = await Promise.all([
      getStoreSession(),
      getAdminSession(),
    ]);

    if (!adminSession) {
      if (!storeSession) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      }
      const offer = await prisma.offer.findUnique({ where: { id } });
      if (!offer || offer.storeId !== storeSession.storeId) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    }

    const result = await runOfferGenerationPipeline(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error regenerando" },
      { status: 500 }
    );
  }
}
