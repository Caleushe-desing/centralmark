// Design Engine — API pública (importar submódulos en rutas API para evitar ciclos)
export { DesignEngineError, ProAdGenerationError } from "./errors";
export {
  runDesignEngine,
  resolveCompositionLayout,
  getStyleName,
} from "./generate/orchestrator";
export type { OrchestratorPhase, RunDesignEngineOptions } from "./generate/orchestrator";

export {
  proAdInputSchema,
  campaignBriefSchema,
  proAdDesignSchema,
  designDocumentV2Schema,
  flattenToLegacyDesign,
  elevateToDesignV2,
} from "./schemas";
export type {
  DesignDocument,
  DesignDocumentV2,
  TextOnImage,
  TextExternal,
  VisualConcept,
  CompositionBlock,
  DesignGenerationResult,
  ProAdDesign,
  ProAdInput,
  ProAdResult,
  CampaignBriefInput,
  CompositionCategory,
  GenerationCostBreakdown,
} from "./schemas";

export { parseBriefFacts, extractDiscountPercent, briefFactsSchema } from "./brief-facts";
export type { BriefFacts } from "./brief-facts";

export {
  validateDesignOutput,
  assertSpanishOnly,
  FORBIDDEN_ANGLICISMS,
} from "./design-output-validator";
export type {
  DesignValidationResult,
  DesignValidationError,
  DesignValidationErrorCode,
  ValidateDesignOutputOptions,
} from "./design-output-validator";

export {
  CATEGORY_MASTERS,
  ALL_LAYOUTS,
  resolveLayout,
  getLayoutById,
  buildLayoutCatalogForPrompt,
} from "./composition/rules";
export type { CompositionLayout, AdCopySlots, SlotKey } from "./composition/rules";

export { calculateGenerationCost, formatCostUsd, AI_PRICING } from "./financial/pricing";
export { assertStoreRateLimit, StoreRateLimitError } from "./rate-limit/store-limiter";
export { persistDesignGenerationAtomic } from "./persist/generation";

export { computeFitFontSizePx, parseFontSizePx, ellipsisEditorial } from "./fit-text/measure";
export { zoneScrimStylePlain, localZoneScrimClass } from "./scrims/local-scrim";
