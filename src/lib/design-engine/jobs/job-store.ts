import { prisma } from "@/lib/db";

export async function createDesignJob(storeId: string, brief: string): Promise<string> {
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
