import { z } from "zod";
import { ALL_CATEGORIES, ALL_LAYOUT_IDS } from "./composition/rules";

export {
  campaignBriefSchema,
  proAdInputSchema,
  type CampaignBriefInput,
  type ProAdInput,
} from "./schemas/brief";

export const compositionCategorySchema = z.enum(ALL_CATEGORIES);

export type CompositionCategory = z.infer<typeof compositionCategorySchema>;

export const compositionLayoutIdSchema = z.enum(ALL_LAYOUT_IDS);

export const proAdDesignSchema = z.object({
  imagePrompt: z.string().min(20).max(500),
  caption: z.string().min(20).max(2200),
  compositionCategory: compositionCategorySchema,
  compositionLayoutId: compositionLayoutIdSchema,
  hook: z.string().min(2).max(48),
  badge: z.string().min(2).max(32),
  subtext: z.string().min(4).max(120),
  cta: z.string().min(2).max(48),
});

export type DesignDocument = z.infer<typeof proAdDesignSchema>;
/** @deprecated Use DesignDocument */
export type ProAdDesign = DesignDocument;

export type GenerationCostBreakdown = {
  textCostUsd: number;
  imageCostUsd: number;
  totalUsd: number;
  promptTokens: number;
  completionTokens: number;
};

export type DesignGenerationResult = {
  design: DesignDocument;
  styleName: string;
  imageUrl: string;
  costoEstimado: number;
  costBreakdown: GenerationCostBreakdown;
  generationId?: string;
  metadata: {
    model: string;
    imageModel: string;
    generatedAt: string;
    durationMs: number;
  };
};

/** @deprecated Use DesignGenerationResult */
export type ProAdResult = DesignGenerationResult;

export const PRO_AD_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "imagePrompt",
    "caption",
    "compositionCategory",
    "compositionLayoutId",
    "hook",
    "badge",
    "subtext",
    "cta",
  ],
  properties: {
    imagePrompt: { type: "string" },
    caption: { type: "string" },
    compositionCategory: {
      type: "string",
      enum: ["drop", "spotlight", "editorial", "promo"],
    },
    compositionLayoutId: { type: "string", enum: [...ALL_LAYOUT_IDS] },
    hook: { type: "string" },
    badge: { type: "string" },
    subtext: { type: "string" },
    cta: { type: "string" },
  },
} as const;
