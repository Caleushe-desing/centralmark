import { APIError } from "openai";
import { getOpenAIClient, getCampaignModel, OpenAIConfigError } from "@/lib/openai/client";
import { generateAdImage } from "@/lib/ai/ad-image";
import { prisma } from "@/lib/db";
import {
  getLayoutById,
  resolveLayout,
  type CompositionLayout,
  type VisualArchetype,
} from "../composition/rules";
import { buildProAdUserPrompt, getDesignerSystemPrompt } from "./prompts";
import { clampImageConcept } from "./clamp-concept";
import { sanitizeSpanishCopy } from "../copy/sanitize-spanish";
import { getArchetypeDefinition, parseArchetype } from "../archetypes";
import { applyStoreBrandToLayout, type StoreBrandContext } from "../store-branding";
import {
  campaignBriefSchema,
  proAdDesignSchema,
  PRO_AD_JSON_SCHEMA,
  type DesignDocument,
  type DesignGenerationResult,
  type CampaignBriefInput,
} from "../schemas";
import { calculateGenerationCost } from "../financial/pricing";
import { persistDesignGenerationAtomic } from "../persist/generation";
import { DesignEngineError } from "../errors";

const MODEL_TEMPERATURE = 0.62;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimHook(hook: string, maxWords: number): string {
  const words = hook.trim().split(/\s+/);
  return words.length > maxWords ? words.slice(0, maxWords).join(" ") : hook.trim();
}

function sanitizeDesign(raw: DesignDocument, archetype: VisualArchetype): DesignDocument {
  const maxHookWords = getArchetypeDefinition(archetype).maxHookWords;
  return {
    ...raw,
    imagePrompt: clampImageConcept(raw.imagePrompt.trim()),
    caption: sanitizeSpanishCopy(raw.caption.trim()),
    hook: sanitizeSpanishCopy(trimHook(raw.hook, maxHookWords)),
    badge: sanitizeSpanishCopy(raw.badge.trim()),
    subtext: sanitizeSpanishCopy(raw.subtext.trim()),
    cta: sanitizeSpanishCopy(raw.cta.trim()),
  };
}

function normalizeArchetype(design: DesignDocument): VisualArchetype {
  return parseArchetype(design.compositionCategory);
}

function enforceValidLayout(design: DesignDocument, archetype: VisualArchetype): DesignDocument {
  const def = getArchetypeDefinition(archetype);
  const layout = getLayoutById(design.compositionLayoutId);
  const layoutId =
    layout && layout.archetype === archetype ? design.compositionLayoutId : def.defaultLayoutId;

  return {
    ...design,
    compositionCategory: archetype,
    compositionLayoutId: layoutId,
  };
}

async function loadStoreBrand(storeId: string): Promise<StoreBrandContext> {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    throw new DesignEngineError("Tienda no encontrada", "STORE_NOT_FOUND", 404);
  }
  return {
    name: store.name,
    primaryColor: store.primaryColor,
    secondaryColor: store.secondaryColor,
    logoUrl: store.logoUrl,
    rubro: store.rubro,
    category: store.category,
  };
}

async function generateDesignFromBrief(
  brief: string,
  brand: StoreBrandContext,
  imageSource: "ai" | "upload"
) {
  const client = getOpenAIClient();
  const model = getCampaignModel();

  const response = await client.chat.completions.create({
    model,
    temperature: MODEL_TEMPERATURE,
    messages: [
      { role: "system", content: getDesignerSystemPrompt() },
      {
        role: "user",
        content: buildProAdUserPrompt({ brief, brand, imageSource }),
      },
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
  const archetype = normalizeArchetype(parsed);
  let design = sanitizeDesign(parsed, archetype);
  design = enforceValidLayout(design, archetype);

  const usage = response.usage ?? { prompt_tokens: 0, completion_tokens: 0 };

  return {
    design,
    archetype,
    model,
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
  };
}

export function resolveCompositionLayout(
  design: DesignDocument,
  brand?: Pick<StoreBrandContext, "primaryColor" | "secondaryColor">
): CompositionLayout {
  const base = resolveLayout(
    design.compositionCategory as VisualArchetype,
    design.compositionLayoutId
  );
  if (!brand) return base;
  return applyStoreBrandToLayout(base, brand);
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
  input: CampaignBriefInput,
  options: RunDesignEngineOptions
): Promise<DesignGenerationResult & { layout: CompositionLayout }> {
  const startedAt = Date.now();
  const parsed = campaignBriefSchema.parse(input);
  const { brief, imageSource, userImageUrl } = parsed;
  const { storeId, jobId, onPhase } = options;

  if (imageSource === "upload" && !userImageUrl?.trim()) {
    throw new DesignEngineError(
      "Falta la imagen subida para crear la publicación.",
      "MISSING_UPLOAD",
      400
    );
  }

  try {
    getOpenAIClient();
  } catch (error) {
    if (error instanceof OpenAIConfigError) {
      throw new DesignEngineError(error.message, error.code, 503, { cause: error });
    }
    throw error;
  }

  try {
    const brand = await loadStoreBrand(storeId);

    await onPhase?.("brief");
    const { design, archetype, model, promptTokens, completionTokens } =
      await generateDesignFromBrief(brief, brand, imageSource);

    await onPhase?.("composition");
    const layout = resolveCompositionLayout(design, brand);
    const styleName = layout.name;

    let imageUrl: string;
    let imageModel: string;
    let imageCount = 0;

    if (imageSource === "upload" && userImageUrl) {
      await onPhase?.("render");
      imageUrl = userImageUrl.startsWith("http")
        ? userImageUrl
        : userImageUrl.startsWith("/")
          ? userImageUrl
          : `/${userImageUrl}`;
      imageModel = "user-upload";
    } else {
      const imageConcept = clampImageConcept(design.imagePrompt);
      const productLabel = brief.split(/[.!?\n]/)[0]?.trim().slice(0, 80) || brand.name;

      await onPhase?.("render");
      const imageResult = await generateAdImage({
        concept: imageConcept,
        product: productLabel,
        size: "1024x1024",
        lighting: "auto",
      });
      imageUrl = imageResult.imageUrl;
      imageModel = imageResult.metadata.model;
      imageCount = 1;
    }

    const costBreakdown = calculateGenerationCost({ promptTokens, completionTokens }, imageCount);

    await onPhase?.("persist");
    const generationId = await persistDesignGenerationAtomic({
      storeId,
      brief,
      design,
      styleName,
      imageUrl,
      costBreakdown,
      textModel: model,
      imageModel,
      jobId,
    });

    return {
      design,
      layout,
      styleName,
      imageUrl,
      costoEstimado: costBreakdown.totalUsd,
      costBreakdown,
      generationId,
      metadata: {
        model,
        imageModel,
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
          "Contenido rechazado por políticas de OpenAI. Reformula tu instrucción.",
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
