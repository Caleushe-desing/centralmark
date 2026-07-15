import { prisma } from "@/lib/db";
import { assertStoreAiRateLimit, StoreAiRateLimitError } from "@/lib/ai/rate-limit/store-ai-limiter";
import { parseArchetype } from "../archetypes";
import type { CampaignBriefInput } from "../schemas/brief";
import { DesignEngineError } from "../errors";

const STALE_PROCESSING_MS = 8 * 60 * 1000;
const STALE_QUEUED_MS = 3 * 60 * 1000;
const DUPLICATE_REQUEST_MS = 5 * 60 * 1000;

/** Jobs huérfanos en cola o procesamiento bloquean nuevas generaciones — se marcan como fallidos. */
export async function reconcileStaleDesignJobsForStore(storeId: string): Promise<void> {
  const staleQueuedBefore = new Date(Date.now() - STALE_QUEUED_MS);
  const staleProcessingBefore = new Date(Date.now() - STALE_PROCESSING_MS);

  await prisma.designGenerationJob.updateMany({
    where: {
      storeId,
      status: "QUEUED",
      createdAt: { lt: staleQueuedBefore },
    },
    data: {
      status: "FAILED",
      phase: "failed",
      errorMessage: "La generación quedó en cola demasiado tiempo. Presiona Generar de nuevo.",
      completedAt: new Date(),
    },
  });

  await prisma.designGenerationJob.updateMany({
    where: {
      storeId,
      status: "PROCESSING",
      updatedAt: { lt: staleProcessingBefore },
    },
    data: {
      status: "FAILED",
      phase: "failed",
      errorMessage: "La generación expiró. Presiona Generar de nuevo.",
      completedAt: new Date(),
    },
  });
}

export async function assertNoInflightDesignJob(storeId: string): Promise<void> {
  await reconcileStaleDesignJobsForStore(storeId);

  const inflight = await prisma.designGenerationJob.findFirst({
    where: {
      storeId,
      status: { in: ["QUEUED", "PROCESSING"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (inflight) {
    throw new DesignEngineError(
      "Ya hay una generación en curso. Espera a que termine antes de pedir otra.",
      "GENERATION_IN_PROGRESS",
      409,
      { retryAfterSeconds: 5 }
    );
  }
}

/** Evita cobrar dos veces por doble clic con el mismo clientRequestId */
export async function findDuplicateDesignJob(
  storeId: string,
  clientRequestId: string | undefined
): Promise<string | null> {
  if (!clientRequestId) return null;

  const since = new Date(Date.now() - DUPLICATE_REQUEST_MS);
  const existing = await prisma.designGenerationJob.findFirst({
    where: {
      storeId,
      clientRequestId,
      createdAt: { gte: since },
      status: { in: ["QUEUED", "PROCESSING", "COMPLETED"] },
    },
    orderBy: { createdAt: "desc" },
  });

  return existing?.id ?? null;
}

/** Marca jobs colgados en PROCESSING como fallidos (evita re-ejecutar y cobrar dos veces). */
export async function failStaleProcessingJobs(jobId: string): Promise<void> {
  const staleBefore = new Date(Date.now() - STALE_PROCESSING_MS);
  await prisma.designGenerationJob.updateMany({
    where: {
      id: jobId,
      status: "PROCESSING",
      updatedAt: { lt: staleBefore },
    },
    data: {
      status: "FAILED",
      phase: "failed",
      errorMessage: "La generación expiró. Presiona Generar de nuevo.",
      completedAt: new Date(),
    },
  });
}

/**
 * Reclama un job QUEUED de forma atómica. Solo un procesador puede ganar.
 */
export async function tryClaimDesignJob(jobId: string): Promise<boolean> {
  await failStaleProcessingJobs(jobId);

  const result = await prisma.designGenerationJob.updateMany({
    where: { id: jobId, status: "QUEUED" },
    data: { status: "PROCESSING", phase: "queued" },
  });
  return result.count > 0;
}

export async function createDesignJob(
  storeId: string,
  input: CampaignBriefInput
): Promise<string> {
  const imageSource = input.imageSource ?? "ai";

  if (imageSource === "ai") {
    try {
      assertStoreAiRateLimit(storeId, "premium");
    } catch (error) {
      if (error instanceof StoreAiRateLimitError) {
        throw new DesignEngineError(error.message, "STORE_RATE_LIMIT", 429, {
          cause: error,
          retryAfterSeconds: error.retryAfterSeconds,
        });
      }
      throw error;
    }
  } else {
    try {
      assertStoreAiRateLimit(storeId, "standard");
    } catch (error) {
      if (error instanceof StoreAiRateLimitError) {
        throw new DesignEngineError(error.message, "STORE_RATE_LIMIT", 429, {
          cause: error,
          retryAfterSeconds: error.retryAfterSeconds,
        });
      }
      throw error;
    }
  }

  const duplicateId = await findDuplicateDesignJob(storeId, input.clientRequestId);
  if (duplicateId) return duplicateId;

  await assertNoInflightDesignJob(storeId);

  const job = await prisma.designGenerationJob.create({
    data: {
      storeId,
      brief: input.brief,
      archetype: input.archetype ? parseArchetype(input.archetype) : "drop",
      imageSource,
      userImageUrl: input.userImageUrl ?? null,
      clientRequestId: input.clientRequestId ?? null,
      status: "QUEUED",
      phase: "queued",
    },
  });
  return job.id;
}

export async function updateJobPhase(
  jobId: string,
  phase: string,
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" = "PROCESSING"
) {
  await prisma.designGenerationJob.update({
    where: { id: jobId },
    data: { phase, status },
  });
}

export async function getDesignJobRecord(jobId: string, storeId: string) {
  return prisma.designGenerationJob.findFirst({
    where: { id: jobId, storeId },
  });
}
