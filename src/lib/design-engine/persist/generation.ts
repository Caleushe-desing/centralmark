import { prisma } from "@/lib/db";
import type { DesignDocument } from "../schemas";
import type { GenerationCostBreakdown } from "../schemas";
import { formatCostUsd } from "../financial/pricing";

export interface PersistDesignGenerationInput {
  storeId: string;
  brief: string;
  design: DesignDocument;
  styleName: string;
  imageUrl: string;
  costBreakdown: GenerationCostBreakdown;
  textModel: string;
  imageModel: string;
  jobId?: string;
}

/**
 * Persistencia atómica — si falla, lanza error y la operación debe abortarse.
 */
export async function persistDesignGenerationAtomic(
  input: PersistDesignGenerationInput
): Promise<string> {
  const record = await prisma.$transaction(async (tx) => {
    const generation = await tx.proAdGeneration.create({
      data: {
        storeId: input.storeId,
        brief: input.brief,
        compositionCategory: input.design.compositionCategory,
        compositionLayoutId: input.design.compositionLayoutId,
        styleName: input.styleName,
        hook: input.design.hook,
        badge: input.design.badge,
        subtext: input.design.subtext,
        cta: input.design.cta,
        caption: input.design.caption,
        imageUrl: input.imageUrl,
        costUsd: input.costBreakdown.totalUsd,
        promptTokens: input.costBreakdown.promptTokens,
        completionTokens: input.costBreakdown.completionTokens,
        textModel: input.textModel,
        imageModel: input.imageModel,
      },
    });

    if (input.jobId) {
      await tx.designGenerationJob.update({
        where: { id: input.jobId },
        data: { generationId: generation.id },
      });
    }

    return generation;
  });

  console.info(
    `[design-engine] Costo ${formatCostUsd(input.costBreakdown.totalUsd)} | ` +
      `store=${input.storeId} generation=${record.id}`
  );

  return record.id;
}
