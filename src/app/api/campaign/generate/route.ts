import { NextResponse } from "next/server";
import { after } from "next/server";
import { campaignBriefSchema } from "@/lib/design-engine/schemas/brief";
import { createDesignJob, processDesignJob } from "@/lib/design-engine/jobs/process-job";
import { DesignEngineError } from "@/lib/design-engine/errors";
import { requireStoreSession } from "@/lib/auth/session";

/**
 * POST /api/campaign/generate
 * Inicia generación asíncrona: Brief → Composición → Render → Persist.
 * Retorna jobId para polling en GET /api/campaign/generate/[jobId]
 */
export async function POST(request: Request) {
  try {
    const session = await requireStoreSession();
    const body = await request.json();
    const parsed = campaignBriefSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Brief inválido", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const jobId = await createDesignJob(session.storeId, parsed.data.brief);
    after(() => {
      void processDesignJob(jobId);
    });

    return NextResponse.json(
      {
        success: true,
        jobId,
        status: "QUEUED",
        pollUrl: `/api/campaign/generate/${jobId}`,
      },
      { status: 202 }
    );
  } catch (error) {
    if (error instanceof DesignEngineError) {
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
