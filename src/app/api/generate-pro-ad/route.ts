import { NextResponse } from "next/server";
import {
  generateProAd,
  proAdInputSchema,
  ProAdGenerationError,
} from "@/lib/pro-ad";
import { requireStoreSession } from "@/lib/auth/session";

/**
 * POST /api/generate-pro-ad
 * Brief único → diseño paramétrico (gpt-4o Structured Outputs) + imagen HD automática.
 */
export async function POST(request: Request) {
  try {
    await requireStoreSession();
    const body = await request.json();
    const parsed = proAdInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Brief inválido", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await generateProAd(parsed.data);

    return NextResponse.json({
      success: true,
      copy: result.copy,
      imageUrl: result.imageUrl,
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
