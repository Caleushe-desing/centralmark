import { NextResponse } from "next/server";
import {
  generateProAd,
  proAdInputSchema,
  ProAdGenerationError,
  resolveCompositionLayout,
} from "@/lib/pro-ad";
import { requireStoreSession } from "@/lib/auth/session";

/**
 * POST /api/generate-pro-ad
 * Brief → Composition Engine (categoría + layout) + imagen + costo operativo.
 */
export async function POST(request: Request) {
  try {
    const session = await requireStoreSession();
    const body = await request.json();
    const parsed = proAdInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Brief inválido", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await generateProAd(parsed.data, { storeId: session.storeId });

    const layout = resolveCompositionLayout(result.design);

    return NextResponse.json({
      success: true,
      design: result.design,
      layout,
      styleName: result.styleName,
      imageUrl: result.imageUrl,
      costoEstimado: result.costoEstimado,
      costBreakdown: result.costBreakdown,
      generationId: result.generationId,
      metadata: result.metadata,
    });
  } catch (error) {
    if (error instanceof ProAdGenerationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    const message = error instanceof Error ? error.message : "Error interno";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
