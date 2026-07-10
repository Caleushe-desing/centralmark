import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adCampaignInputSchema,
  CampaignGenerationError,
  generateAdCampaign,
} from "@/lib/ai/campaign";
import { assertStoreAiRateLimit, StoreAiRateLimitError } from "@/lib/ai/rate-limit/store-ai-limiter";
import { aiRateLimitResponse } from "@/lib/ai/rate-limit/http";
import { requireStoreSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const requestBodySchema = adCampaignInputSchema.extend({
  storeName: z.string().optional(),
  category: z.string().optional(),
});

/**
 * POST /api/campaigns/generate
 *
 * Genera una campaña publicitaria AIDA con Structured Outputs (gpt-4o).
 *
 * Body:
 * {
 *   "product": "Diseño web responsive",
 *   "targetAudience": "PYMEs en Santiago que necesitan presencia digital",
 *   "brandTone": "profesional, moderno, confiable",
 *   "campaignGoals": "Generar leads y cotizaciones",
 *   "platform": "instagram"
 * }
 */
export async function POST(request: Request) {
  try {
    const session = await requireStoreSession();
    const body = await request.json();

    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      select: { name: true, category: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }

    assertStoreAiRateLimit(session.storeId, "standard");

    const parsed = requestBodySchema.safeParse({
      ...body,
      storeName: body.storeName ?? store.name,
      category: body.category ?? store.category,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos de campaña inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const campaign = await generateAdCampaign(parsed.data);

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    if (error instanceof StoreAiRateLimitError) {
      return aiRateLimitResponse(error);
    }
    if (error instanceof CampaignGenerationError) {
      const headers: HeadersInit = {};
      if (error.retryAfterSeconds) {
        headers["Retry-After"] = String(error.retryAfterSeconds);
      }
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode, headers }
      );
    }

    const message = error instanceof Error ? error.message : "Error interno";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
