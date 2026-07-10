import { NextResponse } from "next/server";
import { requireStoreSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { suggestOfferCaption } from "@/lib/ai/suggest-caption";
import { assertStoreAiRateLimit, StoreAiRateLimitError } from "@/lib/ai/rate-limit/store-ai-limiter";
import { aiRateLimitResponse } from "@/lib/ai/rate-limit/http";

export async function POST(request: Request) {
  try {
    const session = await requireStoreSession();
    const body = await request.json();

    const aiBrief = (body.aiBrief as string)?.trim();
    if (!aiBrief) {
      return NextResponse.json({ error: "Falta el brief" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      include: { mall: true },
    });
    if (!store) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }

    assertStoreAiRateLimit(session.storeId, "standard");

    const caption = await suggestOfferCaption({
      aiBrief,
      productName: body.productName as string | undefined,
      discountPercent: body.discountPercent as number | null | undefined,
      priceText: body.priceText as string | null | undefined,
      storeName: store.name,
      mallName: store.mall.name,
      storeCategory: store.category,
    });

    if (!caption) {
      return NextResponse.json(
        { error: "No se pudo generar una sugerencia. Revisa OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    return NextResponse.json({ caption });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (e instanceof StoreAiRateLimitError) {
      return aiRateLimitResponse(e);
    }
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
