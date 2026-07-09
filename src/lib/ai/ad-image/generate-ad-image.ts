import type OpenAI from "openai";
import { getOpenAIClient, OpenAIConfigError } from "@/lib/openai/client";
import {
  detectLightingStyle,
  enhanceAdImagePrompt,
  getLightingLabel,
} from "./art-direction-filter";
import { AdImageGenerationError, mapAdImageError } from "./errors";
import {
  getAdImageModel,
  getFallbackAdImageModel,
  getQualityForModel,
  isGptImageModel,
  isModelNotFoundError,
  mapSizeForModel,
  type AdImageModelId,
} from "./image-model-adapter";
import { adImageLogger } from "./logger";
import { persistAdImageBase64 } from "./persist-image";
import {
  adImageInputSchema,
  type AdImageInput,
  type AdImageResult,
  type AdImageSize,
} from "./schemas";

export type { AdImageInput, AdImageResult };
export { adImageInputSchema };
export { enhanceAdImagePrompt, detectLightingStyle };

type ImageGenerateResult = Awaited<
  ReturnType<OpenAI["images"]["generate"]>
>;

async function requestImage(
  client: OpenAI,
  model: AdImageModelId,
  prompt: string,
  size: AdImageSize
): Promise<{ result: ImageGenerateResult; modelUsed: AdImageModelId }> {
  const apiSize = mapSizeForModel(size, model);
  const quality = getQualityForModel(model);

  const params = {
    model,
    prompt,
    n: 1 as const,
    size: apiSize as "1024x1024" | "1024x1536" | "1024x1792",
    quality: quality as "hd" | "high" | "medium" | "standard",
  };

  try {
    const result = await client.images.generate(params);
    return { result, modelUsed: model };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const fallback = getFallbackAdImageModel();

    if (model !== fallback && isModelNotFoundError(message)) {
      adImageLogger.warn("ad_image.model_fallback", { from: model, to: fallback });
      const fallbackSize = mapSizeForModel(size, fallback);
      const fallbackQuality = getQualityForModel(fallback);
      const result = await client.images.generate({
        model: fallback,
        prompt,
        n: 1,
        size: fallbackSize as "1024x1024" | "1024x1536",
        quality: fallbackQuality as "high" | "medium",
      });
      return { result, modelUsed: fallback };
    }

    throw error;
  }
}

async function resolveImageUrl(image: {
  url?: string | null;
  b64_json?: string | null;
}): Promise<string> {
  if (image.url) return image.url;

  if (image.b64_json) {
    const { publicUrl } = await persistAdImageBase64(image.b64_json);
    return publicUrl;
  }

  throw new AdImageGenerationError(
    "La API no devolvió imagen (sin URL ni base64)",
    "EMPTY_RESPONSE",
    502
  );
}

/**
 * Genera imagen publicitaria premium con filtro de dirección de arte.
 * Usa DALL-E 3 si está disponible; si no, gpt-image-1 en calidad alta.
 * Estilo natural se aplica en el prompt (sin parámetro style — deprecado en API).
 */
export async function generateAdImage(input: AdImageInput): Promise<AdImageResult> {
  const startedAt = Date.now();
  const validated = adImageInputSchema.parse(input);

  const lighting =
    validated.lighting === "auto"
      ? detectLightingStyle(validated.product, validated.concept)
      : validated.lighting;

  const enhancedPrompt = enhanceAdImagePrompt({
    concept: validated.concept,
    product: validated.product,
    lighting,
  });

  const primaryModel = getAdImageModel();

  adImageLogger.info("ad_image.generation.start", {
    product: validated.product,
    size: validated.size,
    model: primaryModel,
    lighting: getLightingLabel(lighting),
  });

  let client;
  try {
    client = getOpenAIClient();
  } catch (error) {
    if (error instanceof OpenAIConfigError) {
      throw new AdImageGenerationError(error.message, error.code, 503, { cause: error });
    }
    throw error;
  }

  try {
    const { result, modelUsed } = await requestImage(
      client,
      primaryModel,
      enhancedPrompt,
      validated.size
    );

    const image = "data" in result ? result.data?.[0] : undefined;
    if (!image) {
      throw new AdImageGenerationError("Respuesta vacía de generación de imagen", "EMPTY_RESPONSE", 502);
    }

    const imageUrl = await resolveImageUrl(image);

    const openaiRevised =
      "revised_prompt" in image && typeof image.revised_prompt === "string"
        ? image.revised_prompt
        : null;

    const revisedPrompt = openaiRevised ?? enhancedPrompt;
    const durationMs = Date.now() - startedAt;

    const output: AdImageResult = {
      imageUrl,
      revisedPrompt,
      enhancedPrompt,
      size: validated.size,
      metadata: {
        model: modelUsed,
        quality: getQualityForModel(modelUsed),
        style: "natural",
        revisedPromptSource: openaiRevised ? "openai" : "enhanced",
        generatedAt: new Date().toISOString(),
        durationMs,
      },
    };

    adImageLogger.info("ad_image.generation.success", {
      durationMs,
      model: modelUsed,
      isGptImage: isGptImageModel(modelUsed),
      revisedPromptSource: output.metadata.revisedPromptSource,
    });

    return output;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const mapped = mapAdImageError(error);

    adImageLogger.error("ad_image.generation.failed", {
      code: mapped.code,
      statusCode: mapped.statusCode,
      durationMs,
      message: mapped.message,
    });

    throw mapped;
  }
}
