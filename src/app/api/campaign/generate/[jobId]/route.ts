import { NextResponse } from "next/server";
import { getDesignJob } from "@/lib/design-engine/jobs/process-job";
import { requireStoreSession } from "@/lib/auth/session";

const PHASE_LABELS: Record<string, string> = {
  queued: "En cola…",
  brief: "Analizando brief con IA…",
  composition: "Componiendo layout editorial…",
  render: "Generando imagen premium…",
  persist: "Guardando resultado…",
  done: "Completado",
  failed: "Error",
};

/**
 * GET /api/campaign/generate/[jobId]
 * Polling de generación en progreso.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireStoreSession();
    const { jobId } = await context.params;

    const job = await getDesignJob(jobId, session.storeId);
    if (!job) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: job.status !== "FAILED",
      ...job,
      phaseLabel: PHASE_LABELS[job.phase] ?? job.phase,
      done: job.status === "COMPLETED" || job.status === "FAILED",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
