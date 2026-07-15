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

// ─── Legacy (plano) — compatibilidad AdEngine / orquestador actual ───────────

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

// ─── V2 (anidado) — textOnImage / textExternal / visualConcept ─────────────

export const compositionBlockSchema = z.object({
  category: compositionCategorySchema,
  layoutId: compositionLayoutIdSchema,
});

export const visualConceptSchema = z.object({
  imagePrompt: z.string().min(20).max(500),
});

export const textOnImageSchema = z.object({
  productName: z.string().min(2).max(80),
  badge: z.string().min(2).max(32),
  hook: z.string().min(2).max(48),
  subtext: z.string().min(4).max(120),
  cta: z.string().min(2).max(48),
});

export const textExternalSchema = z.object({
  caption: z.string().min(20).max(2200),
});

export const designDocumentV2Schema = z.object({
  composition: compositionBlockSchema,
  visualConcept: visualConceptSchema,
  textOnImage: textOnImageSchema,
  textExternal: textExternalSchema,
});

export type CompositionBlock = z.infer<typeof compositionBlockSchema>;
export type VisualConcept = z.infer<typeof visualConceptSchema>;
export type TextOnImage = z.infer<typeof textOnImageSchema>;
export type TextExternal = z.infer<typeof textExternalSchema>;
export type DesignDocumentV2 = z.infer<typeof designDocumentV2Schema>;

/** Adapta V2 al contrato plano consumido por AdEngine y persistencia actual */
export function flattenToLegacyDesign(design: DesignDocumentV2): DesignDocument {
  return {
    imagePrompt: design.visualConcept.imagePrompt,
    caption: design.textExternal.caption,
    compositionCategory: design.composition.category,
    compositionLayoutId: design.composition.layoutId,
    hook: design.textOnImage.hook,
    badge: design.textOnImage.badge,
    subtext: design.textOnImage.subtext,
    cta: design.textOnImage.cta,
  };
}

/** Eleva un documento legacy a V2 (productName tomado del hook si falta) */
export function elevateToDesignV2(
  design: DesignDocument,
  productName?: string
): DesignDocumentV2 {
  return designDocumentV2Schema.parse({
    composition: {
      category: design.compositionCategory,
      layoutId: design.compositionLayoutId,
    },
    visualConcept: {
      imagePrompt: design.imagePrompt,
    },
    textOnImage: {
      productName: productName?.trim() || design.hook.trim().slice(0, 80),
      badge: design.badge,
      hook: design.hook,
      subtext: design.subtext,
      cta: design.cta,
    },
    textExternal: {
      caption: design.caption,
    },
  });
}

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

/** JSON Schema strict — respuesta legacy del orquestador (sin cambios) */
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

/** JSON Schema strict — Design Engine V2 (fase 2: orquestador) */
export const DESIGN_DOCUMENT_V2_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["composition", "visualConcept", "textOnImage", "textExternal"],
  properties: {
    composition: {
      type: "object",
      additionalProperties: false,
      required: ["category", "layoutId"],
      properties: {
        category: {
          type: "string",
          enum: ["drop", "spotlight", "editorial", "promo"],
        },
        layoutId: { type: "string", enum: [...ALL_LAYOUT_IDS] },
      },
    },
    visualConcept: {
      type: "object",
      additionalProperties: false,
      required: ["imagePrompt"],
      properties: {
        imagePrompt: { type: "string" },
      },
    },
    textOnImage: {
      type: "object",
      additionalProperties: false,
      required: ["productName", "badge", "hook", "subtext", "cta"],
      properties: {
        productName: { type: "string" },
        badge: { type: "string" },
        hook: { type: "string" },
        subtext: { type: "string" },
        cta: { type: "string" },
      },
    },
    textExternal: {
      type: "object",
      additionalProperties: false,
      required: ["caption"],
      properties: {
        caption: { type: "string" },
      },
    },
  },
} as const;
