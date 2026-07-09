import { APIError } from "openai";
import { getOpenAIClient, getCampaignModel, OpenAIConfigError } from "@/lib/openai/client";
import { generateAdImage } from "@/lib/ai/ad-image";
import {
  getLayoutById,
  resolveLayout,
  type CompositionLayout,
} from "@/components/gestor-publicaciones/engine/compositionRules";
import {
  buildProAdUserPrompt,
  PRO_AD_DESIGNER_SYSTEM,
} from "./prompts";
import { clampImageConcept } from "./clamp-concept";
import {
  proAdDesignSchema,
  proAdInputSchema,
  PRO_AD_JSON_SCHEMA,
  type ProAdDesign,
  type ProAdInput,
  type ProAdResult,
} from "./schemas";
import { calculateGenerationCost } from "./financial-engine";
import { persistProAdGeneration } from "./persist-generation";

export class ProAdGenerationError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number, options?: { cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "ProAdGenerationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimHook(hook: string): string {
  const words = hook.trim().split(/\s+/);
  return words.length > 4 ? words.slice(0, 4).join(" ") : hook.trim();
}

function sanitizeDesign(raw: ProAdDesign): ProAdDesign {
  return {
    ...raw,
    imagePrompt: clampImageConcept(raw.imagePrompt.trim()),
    caption: raw.caption.trim(),
    hook: trimHook(raw.hook),
    badge: raw.badge.trim().toUpperCase(),
    subtext: raw.subtext.trim(),
    cta: raw.cta.trim().toUpperCase(),
  };
}

async function generateDesign(brief: string) {
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
        name: "pro_ad_composition_engine",
        strict: true,
        schema: PRO_AD_JSON_SCHEMA,
      },
    },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new ProAdGenerationError("OpenAI no devolvió diseño", "EMPTY_DESIGN", 502);
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

export function resolveCompositionLayout(design: ProAdDesign): CompositionLayout {
  return resolveLayout(design.compositionCategory, design.compositionLayoutId);
}

export function getStyleName(design: ProAdDesign): string {
  const layout = getLayoutById(design.compositionLayoutId);
  return layout?.name ?? design.compositionLayoutId;
}

/**
 * Brief → IA elige categoría/layout + copy → imagen → costo → historial DB.
 */
export async function generateProAd(
  input: ProAdInput,
  options?: { storeId?: string }
): Promise<ProAdResult> {
  const startedAt = Date.now();
  const { brief } = proAdInputSchema.parse(input);

  try {
    getOpenAIClient();
  } catch (error) {
    if (error instanceof OpenAIConfigError) {
      throw new ProAdGenerationError(error.message, error.code, 503, { cause: error });
    }
    throw error;
  }

  try {
    const { design, model, promptTokens, completionTokens } = await generateDesign(brief);
    const layout = resolveCompositionLayout(design);
    const styleName = layout.name;

    const imageConcept = clampImageConcept(design.imagePrompt);
    const productLabel = brief.split(/[.!?\n]/)[0]?.trim().slice(0, 80) || "Producto";

    const imageResult = await generateAdImage({
      concept: imageConcept,
      product: productLabel,
      size: "1024x1024",
      lighting: "auto",
    });

    const costBreakdown = calculateGenerationCost({ promptTokens, completionTokens }, 1);

    console.info(
      `[pro-ad] Generación completada | estilo=${styleName} | costo=${costBreakdown.totalUsd} USD | ` +
        `tokens in=${promptTokens} out=${completionTokens}`
    );

    let generationId: string | undefined;
    if (options?.storeId) {
      generationId = await persistProAdGeneration({
        storeId: options.storeId,
        brief,
        design,
        styleName,
        imageUrl: imageResult.imageUrl,
        costBreakdown,
        textModel: model,
        imageModel: imageResult.metadata.model,
      });
    }

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
    if (error instanceof ProAdGenerationError) throw error;

    if (error instanceof APIError) {
      if (error.status === 429) {
        throw new ProAdGenerationError(
          "Límite de API alcanzado. Intenta en unos segundos.",
          "RATE_LIMIT",
          429,
          { cause: error }
        );
      }
      if (error.status === 400) {
        throw new ProAdGenerationError(
          "Contenido rechazado por políticas de OpenAI. Reformula el brief.",
          "CONTENT_POLICY",
          400,
          { cause: error }
        );
      }
    }

    const message = error instanceof Error ? error.message : "Error al generar anuncio";
    throw new ProAdGenerationError(message, "GENERATION_FAILED", 502, { cause: error });
  }
}
