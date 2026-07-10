import { prisma } from "@/lib/db";
import { DesignEngineError } from "../errors";

export async function assertNoInflightDesignJob(storeId: string): Promise<void> {
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

export async function createDesignJob(storeId: string, brief: string): Promise<string> {
  await assertNoInflightDesignJob(storeId);

  const job = await prisma.designGenerationJob.create({
    data: {
      storeId,
      brief,
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
