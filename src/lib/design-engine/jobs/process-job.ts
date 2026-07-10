import { createDesignJob, updateJobPhase, getDesignJobRecord } from "./job-store";
import type { DesignGenerationResult } from "../schemas";

export type JobPhase = "queued" | "brief" | "composition" | "render" | "persist" | "done" | "failed";

export interface JobPollResult {
  jobId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  phase: JobPhase;
  error?: string;
  result?: DesignGenerationResult & { layout: unknown };
}

export { createDesignJob } from "./job-store";

/** Evita procesar el mismo job dos veces en paralelo */
const activeProcessors = new Set<string>();

export async function processDesignJob(jobId: string): Promise<void> {
  if (activeProcessors.has(jobId)) return;
  activeProcessors.add(jobId);

  try {
    const { prisma } = await import("@/lib/db");
    const fullJob = await prisma.designGenerationJob.findUnique({ where: { id: jobId } });
    if (!fullJob || fullJob.status === "COMPLETED" || fullJob.status === "FAILED") return;

    const { runDesignEngine, resolveCompositionLayout } = await import("../generate/orchestrator");
    const { DesignEngineError } = await import("../errors");

    try {
      await updateJobPhase(jobId, "brief", "PROCESSING");

      const result = await runDesignEngine(
        { brief: fullJob.brief },
        {
          storeId: fullJob.storeId,
          jobId,
          onPhase: async (phase) => {
            await updateJobPhase(jobId, phase, "PROCESSING");
          },
        }
      );

      const layout = resolveCompositionLayout(result.design);

      await prisma.designGenerationJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          phase: "done",
          resultJson: JSON.stringify({ ...result, layout }),
          costUsd: result.costoEstimado,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      const message =
        error instanceof DesignEngineError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Error desconocido";

      await prisma.designGenerationJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          phase: "failed",
          errorMessage: message,
          completedAt: new Date(),
        },
      });
    }
  } finally {
    activeProcessors.delete(jobId);
  }
}

/** Si el job sigue en cola, dispara el procesamiento (fallback para Next.js dev) */
export function ensureJobProcessing(jobId: string): void {
  void processDesignJob(jobId);
}

export async function getDesignJob(jobId: string, storeId: string): Promise<JobPollResult | null> {
  let job = await getDesignJobRecord(jobId, storeId);
  if (!job) return null;

  if (job.status === "QUEUED") {
    ensureJobProcessing(jobId);
    // Releer tras disparar procesamiento
    job = (await getDesignJobRecord(jobId, storeId)) ?? job;
  }

  const base: JobPollResult = {
    jobId: job.id,
    status: job.status,
    phase: job.phase as JobPhase,
    error: job.errorMessage ?? undefined,
  };

  if (job.status === "COMPLETED" && job.resultJson) {
    try {
      base.result = JSON.parse(job.resultJson);
    } catch {
      base.error = "Resultado corrupto";
      base.status = "FAILED";
    }
  }

  return base;
}

export function enqueueDesignJob(jobId: string): void {
  ensureJobProcessing(jobId);
}
