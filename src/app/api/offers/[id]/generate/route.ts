import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runOfferGenerationPipeline } from "@/lib/ai/pipeline";
import { getStoreSession, getAdminSession } from "@/lib/auth/session";
import { assertStoreAiRateLimit, StoreAiRateLimitError } from "@/lib/ai/rate-limit/store-ai-limiter";
import { aiRateLimitResponse } from "@/lib/ai/rate-limit/http";

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

    const offer = await prisma.offer.findUnique({
      where: { id },
      select: { id: true, storeId: true, status: true, productImageUrl: true },
    });

    if (!offer) {
      return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
    }

    if (!adminSession) {
      if (!storeSession) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      }
      if (offer.storeId !== storeSession.storeId) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    }

    if (offer.status === "GENERATING") {
      return NextResponse.json(
        { error: "Esta oferta ya se está regenerando. Espera a que termine." },
        { status: 409 }
      );
    }

    if (!offer.productImageUrl) {
      assertStoreAiRateLimit(offer.storeId, "premium");
    } else {
      assertStoreAiRateLimit(offer.storeId, "standard");
    }

    const result = await runOfferGenerationPipeline(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StoreAiRateLimitError) {
      return aiRateLimitResponse(error);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error regenerando" },
      { status: 500 }
    );
  }
}
