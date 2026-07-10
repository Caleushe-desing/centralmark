import { APIError } from "openai";
import { getOpenAIClient, getCampaignModel, OpenAIConfigError } from "@/lib/openai/client";
import { generateAdImage } from "@/lib/ai/ad-image";
import {
  getLayoutById,
  resolveLayout,
  type CompositionLayout,
} from "../composition/rules";
import { buildProAdUserPrompt, PRO_AD_DESIGNER_SYSTEM } from "./prompts";
import { clampImageConcept } from "./clamp-concept";
import {
  proAdDesignSchema,
  proAdInputSchema,
  PRO_AD_JSON_SCHEMA,
  type DesignDocument,
  type DesignGenerationResult,
  type ProAdInput,
} from "../schemas";
import { calculateGenerationCost } from "../financial/pricing";
import { persistDesignGenerationAtomic } from "../persist/generation";
import { DesignEngineError } from "../errors";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimHook(hook: string): string {
  const words = hook.trim().split(/\s+/);
  return words.length > 4 ? words.slice(0, 4).join(" ") : hook.trim();
}

/** Dirección de arte premium — sin UPPERCASE forzado */
function sanitizeDesign(raw: DesignDocument): DesignDocument {
  return {
    ...raw,
    imagePrompt: clampImageConcept(raw.imagePrompt.trim()),
    caption: raw.caption.trim(),
    hook: trimHook(raw.hook),
    badge: raw.badge.trim(),
    subtext: raw.subtext.trim(),
    cta: raw.cta.trim(),
  };
}

async function generateDesignFromBrief(brief: string) {
  const client = getOpenAIClient();
  const model = getCampaignModel();

  const response = await client.chat.completions.create({
    model,
    temperature: 0.78,
    messages: [
      { role: "system", content: PRO_AD_DESIGNER_SYSTEM },
      { role: "user", content: buildProAdUserPrompt(brief) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "design_engine_composition",
        strict: true,
        schema: PRO_AD_JSON_SCHEMA,
      },
    },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new DesignEngineError("OpenAI no devolvió diseño", "EMPTY_DESIGN", 502);
  }

  const parsed = proAdDesignSchema.parse(JSON.parse(raw));
  const design = sanitizeDesign(parsed);

  if (countWords(design.hook) > 4) {
    design.hook = trimHook(design.hook);
  }

  const usage = response.usage ?? { prompt_tokens: 0, completion_tokens: 0 };

  return {
    design,
    model,
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
  };
}

export function resolveCompositionLayout(design: DesignDocument): CompositionLayout {
  return resolveLayout(design.compositionCategory, design.compositionLayoutId);
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

/**
 * Brief → Composición (IA) → Imagen → Persistencia atómica.
 * Aborta si la persistencia falla.
 */
export async function runDesignEngine(
  input: ProAdInput,
  options: RunDesignEngineOptions
): Promise<DesignGenerationResult> {
  const startedAt = Date.now();
  const { brief } = proAdInputSchema.parse(input);
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
    const { design, model, promptTokens, completionTokens } = await generateDesignFromBrief(brief);

    await onPhase?.("composition");
    const layout = resolveCompositionLayout(design);
    const styleName = layout.name;

    const imageConcept = clampImageConcept(design.imagePrompt);
    const productLabel = brief.split(/[.!?\n]/)[0]?.trim().slice(0, 80) || "Producto";

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
