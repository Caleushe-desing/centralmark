import { APIError } from "openai";
import { getOpenAIClient, getCampaignModel, OpenAIConfigError } from "@/lib/openai/client";
import { generateAdImage } from "@/lib/ai/ad-image";
import {
  getLayoutById,
  resolveLayout,
  type CompositionLayout,
  type VisualArchetype,
} from "../composition/rules";
import {
  buildDesignCorrectionPrompt,
  buildProAdUserPrompt,
  getDesignerSystemPrompt,
} from "./prompts";
import { buildDeterministicDesignV2 } from "./design-fallback";
import { clampImageConcept } from "./clamp-concept";
import { parseBriefFacts, type BriefFacts } from "../brief-facts";
import { validateDesignOutput, type DesignValidationError } from "../design-output-validator";
import { getArchetypeDefinition, parseArchetype } from "../archetypes";
import {
  designDocumentV2Schema,
  flattenToLegacyDesign,
  proAdInputSchema,
  DESIGN_DOCUMENT_V2_JSON_SCHEMA,
  type DesignDocument,
  type DesignDocumentV2,
  type DesignGenerationResult,
  type ProAdInput,
} from "../schemas";
import { calculateGenerationCost } from "../financial/pricing";
import { persistDesignGenerationAtomic } from "../persist/generation";
import { DesignEngineError } from "../errors";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimHook(hook: string, maxWords: number): string {
  const words = hook.trim().split(/\s+/);
  return words.length > maxWords ? words.slice(0, maxWords).join(" ") : hook.trim();
}

function getModelTemperature(archetype: VisualArchetype): number {
  const temperatures: Record<VisualArchetype, number> = {
    drop: 0.65,
    promo: 0.6,
    spotlight: 0.55,
    editorial: 0.6,
  };
  return temperatures[archetype];
}

function enforceArchetypeV2(design: DesignDocumentV2, archetype: VisualArchetype): DesignDocumentV2 {
  const def = getArchetypeDefinition(archetype);
  const layout = getLayoutById(design.composition.layoutId);
  const layoutId =
    layout && layout.archetype === archetype ? design.composition.layoutId : def.defaultLayoutId;

  return {
    ...design,
    composition: {
      category: archetype,
      layoutId,
    },
  };
}

function sanitizeDesignV2(raw: DesignDocumentV2, archetype: VisualArchetype): DesignDocumentV2 {
  const maxHookWords = getArchetypeDefinition(archetype).maxHookWords;
  let hook = raw.textOnImage.hook.trim();
  if (countWords(hook) > maxHookWords) {
    hook = trimHook(hook, maxHookWords);
  }

  return enforceArchetypeV2(
    {
      ...raw,
      visualConcept: {
        imagePrompt: clampImageConcept(raw.visualConcept.imagePrompt.trim()),
      },
      textOnImage: {
        productName: raw.textOnImage.productName.trim(),
        badge: raw.textOnImage.badge.trim(),
        hook,
        subtext: raw.textOnImage.subtext.trim(),
        cta: raw.textOnImage.cta.trim(),
      },
      textExternal: {
        caption: raw.textExternal.caption.trim(),
      },
    },
    archetype
  );
}

function sanitizeLegacyDesign(raw: DesignDocument, archetype: VisualArchetype): DesignDocument {
  const maxHookWords = getArchetypeDefinition(archetype).maxHookWords;
  const def = getArchetypeDefinition(archetype);
  const layout = getLayoutById(raw.compositionLayoutId);
  const layoutId =
    layout && layout.archetype === archetype ? raw.compositionLayoutId : def.defaultLayoutId;

  return {
    ...raw,
    imagePrompt: clampImageConcept(raw.imagePrompt.trim()),
    caption: raw.caption.trim(),
    hook: trimHook(raw.hook, maxHookWords),
    badge: raw.badge.trim(),
    subtext: raw.subtext.trim(),
    cta: raw.cta.trim(),
    compositionCategory: archetype,
    compositionLayoutId: layoutId,
  };
}

interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
}

interface LlmDesignResult {
  designV2: DesignDocumentV2;
  model: string;
  usage: LlmUsage;
}

async function invokeDesignLlm(
  brief: string,
  facts: BriefFacts,
  archetype: VisualArchetype,
  options?: { correctionErrors?: DesignValidationError[] }
): Promise<LlmDesignResult> {
  const client = getOpenAIClient();
  const model = getCampaignModel();
  const temperature = getModelTemperature(archetype);

  const userContent = options?.correctionErrors?.length
    ? buildDesignCorrectionPrompt(brief, archetype, facts, options.correctionErrors)
    : buildProAdUserPrompt(brief, archetype, facts);

  const response = await client.chat.completions.create({
    model,
    temperature,
    messages: [
      { role: "system", content: getDesignerSystemPrompt(archetype) },
      { role: "user", content: userContent },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "design_engine_v2",
        strict: true,
        schema: DESIGN_DOCUMENT_V2_JSON_SCHEMA,
      },
    },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new DesignEngineError("OpenAI no devolvió diseño", "EMPTY_DESIGN", 502);
  }

  const parsed = designDocumentV2Schema.parse(JSON.parse(raw));
  const usage = response.usage ?? { prompt_tokens: 0, completion_tokens: 0 };

  return {
    designV2: parsed,
    model,
    usage: {
      promptTokens: usage.prompt_tokens ?? 0,
      completionTokens: usage.completion_tokens ?? 0,
    },
  };
}

/**
 * Pipeline de 3 capas: parse → LLM V2 → validar → reintento → fallback → legacy.
 */
async function generateDesignPipeline(brief: string, archetype: VisualArchetype) {
  const facts = parseBriefFacts(brief);

  let promptTokens = 0;
  let completionTokens = 0;
  let model = getCampaignModel();
  let usedFallback = false;

  const first = await invokeDesignLlm(brief, facts, archetype);
  promptTokens += first.usage.promptTokens;
  completionTokens += first.usage.completionTokens;
  model = first.model;

  let designV2 = sanitizeDesignV2(first.designV2, archetype);
  let validation = validateDesignOutput(designV2, { facts, archetype });

  if (!validation.valid) {
    const retry = await invokeDesignLlm(brief, facts, archetype, {
      correctionErrors: validation.errors,
    });
    promptTokens += retry.usage.promptTokens;
    completionTokens += retry.usage.completionTokens;

    designV2 = sanitizeDesignV2(retry.designV2, archetype);
    validation = validateDesignOutput(designV2, { facts, archetype });

    if (!validation.valid) {
      designV2 = sanitizeDesignV2(buildDeterministicDesignV2(facts, archetype), archetype);
      usedFallback = true;
    }
  }

  const design = sanitizeLegacyDesign(flattenToLegacyDesign(designV2), archetype);

  return {
    design,
    model,
    promptTokens,
    completionTokens,
    usedFallback,
    facts,
  };
}

export function resolveCompositionLayout(design: DesignDocument): CompositionLayout {
  return resolveLayout(design.compositionCategory as VisualArchetype, design.compositionLayoutId);
}

export function getStyleName(design: DesignDocument): string {
  const layout = getLayoutById(design.compositionLayoutId);
  return layout?.name ?? design.compositionLayoutId;
}

export type OrchestratorPhase = "brief" | "composition" | "render" | "persist";

export interface RunDesignEngineOptions {
  storeId: string;
  jobId?: string;
  onPhase?: (phase: OrchestratorPhase) => Promise<void>;
}

export async function runDesignEngine(
  input: ProAdInput,
  options: RunDesignEngineOptions
): Promise<DesignGenerationResult> {
  const startedAt = Date.now();
  const parsed = proAdInputSchema.parse(input);
  const { brief, archetype: rawArchetype } = parsed;
  const archetype = parseArchetype(rawArchetype);
  const { storeId, jobId, onPhase } = options;

  try {
    getOpenAIClient();
  } catch (error) {
    if (error instanceof OpenAIConfigError) {
      throw new DesignEngineError(error.message, error.code, 503, { cause: error });
    }
    throw error;
  }

  try {
    await onPhase?.("brief");
    const { design, model, promptTokens, completionTokens, facts } = await generateDesignPipeline(
      brief,
      archetype
    );

    await onPhase?.("composition");
    const layout = resolveCompositionLayout(design);
    const styleName = layout.name;

    const imageConcept = clampImageConcept(design.imagePrompt);
    const productLabel = facts.productName.slice(0, 80) || "Producto";

    await onPhase?.("render");
    const imageResult = await generateAdImage({
      concept: imageConcept,
      product: productLabel,
      size: "1024x1024",
      lighting: "auto",
    });

    const costBreakdown = calculateGenerationCost({ promptTokens, completionTokens }, 1);

    await onPhase?.("persist");
    const generationId = await persistDesignGenerationAtomic({
      storeId,
      brief,
      design,
      styleName,
      imageUrl: imageResult.imageUrl,
      costBreakdown,
      textModel: model,
      imageModel: imageResult.metadata.model,
      jobId,
    });

    return {
      design,
      styleName,
      imageUrl: imageResult.imageUrl,
      costoEstimado: costBreakdown.totalUsd,
      costBreakdown,
      generationId,
      metadata: {
        model,
        imageModel: imageResult.metadata.model,
        generatedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
      },
    };
  } catch (error) {
    if (error instanceof DesignEngineError) throw error;

    if (error instanceof APIError) {
      if (error.status === 429) {
        throw new DesignEngineError(
          "Límite de API alcanzado. Intenta en unos segundos.",
          "RATE_LIMIT",
          429,
          { cause: error }
        );
      }
      if (error.status === 400) {
        throw new DesignEngineError(
          "Contenido rechazado por políticas de OpenAI. Reformula el brief.",
          "CONTENT_POLICY",
          400,
          { cause: error }
        );
      }
    }

    const message = error instanceof Error ? error.message : "Error al generar diseño";
    throw new DesignEngineError(message, "GENERATION_FAILED", 502, { cause: error });
  }
}
