import { z } from "zod";
import { ALL_CATEGORIES, ALL_LAYOUT_IDS } from "@/components/gestor-publicaciones/engine/compositionRules";

export const compositionCategorySchema = z.enum(ALL_CATEGORIES);

export type CompositionCategory = z.infer<typeof compositionCategorySchema>;

export const compositionLayoutIdSchema = z.enum(ALL_LAYOUT_IDS);

export const proAdInputSchema = z.object({
  brief: z.string().min(3, "Escribe qué quieres promocionar").max(500),
});

export type ProAdInput = z.infer<typeof proAdInputSchema>;

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

export type ProAdDesign = z.infer<typeof proAdDesignSchema>;

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
      enum: ["RetailAggressive", "EditorialPremium", "TechModern"],
    },
    compositionLayoutId: { type: "string", enum: [...ALL_LAYOUT_IDS] },
    hook: { type: "string" },
    badge: { type: "string" },
    subtext: { type: "string" },
    cta: { type: "string" },
  },
} as const;

export type GenerationCostBreakdown = {
  textCostUsd: number;
  imageCostUsd: number;
  totalUsd: number;
  promptTokens: number;
  completionTokens: number;
};

export type ProAdResult = {
  design: ProAdDesign;
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
