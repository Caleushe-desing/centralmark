import { NextResponse } from "next/server";
import { after } from "next/server";
import { campaignBriefSchema } from "@/lib/design-engine/schemas/brief";
import { createDesignJob, enqueueDesignJob } from "@/lib/design-engine/jobs/process-job";
import { DesignEngineError } from "@/lib/design-engine/errors";
import { requireStoreSession } from "@/lib/auth/session";

/** @deprecated Usa POST /api/campaign/generate */
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

    const jobId = await createDesignJob(session.storeId, parsed.data);
    after(() => {
      enqueueDesignJob(jobId);
    });

    return NextResponse.json(
      {
        success: true,
        jobId,
        status: "QUEUED",
        pollUrl: `/api/campaign/generate/${jobId}`,
        deprecated: true,
        message: "Usa /api/campaign/generate para nuevas integraciones",
      },
      { status: 202 }
    );
  } catch (error) {
    if (error instanceof DesignEngineError) {
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
