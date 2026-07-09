import { prisma } from "@/lib/db";
import type { ProAdDesign } from "./schemas";
import type { GenerationCostBreakdown } from "./schemas";
import { formatCostUsd } from "./financial-engine";

export interface PersistProAdGenerationInput {
  storeId: string;
  brief: string;
  design: ProAdDesign;
  styleName: string;
  imageUrl: string;
  costBreakdown: GenerationCostBreakdown;
  textModel: string;
  imageModel: string;
}

export async function persistProAdGeneration(
  input: PersistProAdGenerationInput
): Promise<string | undefined> {
  try {
    const record = await prisma.proAdGeneration.create({
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

    console.info(
      `[pro-ad] Costo operativo ${formatCostUsd(input.costBreakdown.totalUsd)} | ` +
        `texto ${formatCostUsd(input.costBreakdown.textCostUsd)} + imagen ${formatCostUsd(input.costBreakdown.imageCostUsd)} | ` +
        `store=${input.storeId} id=${record.id}`
    );

    return record.id;
  } catch (error) {
    console.error("[pro-ad] No se pudo guardar historial de costos:", error);
    return undefined;
  }
}
