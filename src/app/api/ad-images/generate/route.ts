import { NextResponse } from "next/server";
import {
  adImageInputSchema,
  AdImageGenerationError,
  generateAdImage,
} from "@/lib/ai/ad-image";
import { requireStoreSession } from "@/lib/auth/session";

/**
 * POST /api/ad-images/generate
 *
 * Genera imagen publicitaria premium con DALL-E 3 (HD, natural).
 *
 * Body:
 * {
 *   "concept": "Laptop en escritorio minimalista con luz lateral",
 *   "product": "Diseño web para empresas",
 *   "size": "1024x1024",
 *   "lighting": "auto"
 * }
 */
export async function POST(request: Request) {
  try {
    await requireStoreSession();
    const body = await request.json();

    const parsed = adImageInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await generateAdImage(parsed.data);

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      revisedPrompt: result.revisedPrompt,
      enhancedPrompt: result.enhancedPrompt,
      size: result.size,
      metadata: result.metadata,
    });
  } catch (error) {
    if (error instanceof AdImageGenerationError) {
      const headers: HeadersInit = {};
      if (error.retryAfterSeconds) {
        headers["Retry-After"] = String(error.retryAfterSeconds);
      }
      return NextResponse.json(
        { error: error.message, code: error.code },
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
