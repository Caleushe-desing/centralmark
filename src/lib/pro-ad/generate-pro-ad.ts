import { APIError } from "openai";
import { getOpenAIClient, getCampaignModel, OpenAIConfigError } from "@/lib/openai/client";
import { generateAdImage } from "@/lib/ai/ad-image";
import {
  buildProAdUserPrompt,
  PRO_AD_DESIGNER_SYSTEM,
} from "./prompts";
import { clampImageConcept } from "./clamp-concept";
import {
  proAdCopySchema,
  proAdInputSchema,
  PRO_AD_JSON_SCHEMA,
  type LayoutElement,
  type ProAdInput,
  type ProAdResult,
} from "./schemas";
import { normalizeBackgroundColor, normalizeRawProAdCopy, normalizeTextColor } from "./normalize-colors";

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

function trimHookElement(el: LayoutElement): LayoutElement {
  if (el.id !== "main-hook") return el;
  const words = el.text.trim().split(/\s+/);
  if (words.length <= 4) return el;
  return { ...el, text: words.slice(0, 4).join(" ") };
}

function sanitizeLayoutElements(elements: LayoutElement[]): LayoutElement[] {
  return elements.map((el) =>
    trimHookElement({
      ...el,
      id: el.id.trim(),
      text: el.text.trim(),
      color: normalizeTextColor(el.color),
      backgroundColor: normalizeBackgroundColor(el.backgroundColor),
      position: {
        top: el.position.top.trim() || "auto",
        left: el.position.left.trim() || "auto",
        right: el.position.right.trim() || "auto",
        bottom: el.position.bottom.trim() || "auto",
      },
    })
  );
}

function sanitizeCopy(raw: ReturnType<typeof proAdCopySchema.parse>) {
  return {
    imagePrompt: clampImageConcept(raw.imagePrompt.trim()),
    caption: raw.caption.trim(),
    layoutElements: sanitizeLayoutElements(raw.layoutElements),
  };
}

async function generateDesign(brief: string) {
  const client = getOpenAIClient();
  const model = getCampaignModel();

  const response = await client.chat.completions.create({
    model,
    temperature: 0.82,
    messages: [
      { role: "system", content: PRO_AD_DESIGNER_SYSTEM },
      { role: "user", content: buildProAdUserPrompt(brief) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pro_ad_parametric",
        strict: true,
        schema: PRO_AD_JSON_SCHEMA,
      },
    },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new ProAdGenerationError("OpenAI no devolvió diseño", "EMPTY_DESIGN", 502);
  }

  const parsed = proAdCopySchema.parse(normalizeRawProAdCopy(JSON.parse(raw)));

  const hook = parsed.layoutElements.find((el) => el.id === "main-hook");
  if (hook && countWords(hook.text) > 4) {
    const idx = parsed.layoutElements.findIndex((el) => el.id === "main-hook");
    parsed.layoutElements[idx] = trimHookElement(hook);
  }

  return { copy: sanitizeCopy(parsed), model };
}

/**
 * Flujo unificado: brief → diseño paramétrico (gpt-4o) → imagen (gpt-image-1) → compositor DOM dinámico.
 */
export async function generateProAd(input: ProAdInput): Promise<ProAdResult> {
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
    const { copy, model } = await generateDesign(brief);

    const imageConcept = clampImageConcept(copy.imagePrompt);
    const productLabel = brief.split(/[.!?\n]/)[0]?.trim().slice(0, 80) || "Producto";

    const imageResult = await generateAdImage({
      concept: imageConcept,
      product: productLabel,
      size: "1024x1024",
      lighting: "auto",
    });

    return {
      copy,
      imageUrl: imageResult.imageUrl,
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
