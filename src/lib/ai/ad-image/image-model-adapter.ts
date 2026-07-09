import type { AdImageSize } from "./schemas";

export type AdImageModelId = "dall-e-3" | "gpt-image-1" | "gpt-image-1-mini";

export function getAdImageModel(): AdImageModelId {
  const env = process.env.OPENAI_AD_IMAGE_MODEL?.trim();
  if (env === "dall-e-3" || env === "gpt-image-1" || env === "gpt-image-1-mini") {
    return env;
  }
  return "gpt-image-1";
}

export function getFallbackAdImageModel(): AdImageModelId {
  return "gpt-image-1";
}

export function isGptImageModel(model: string): boolean {
  return model.startsWith("gpt-image");
}

/** gpt-image usa 1024x1536 para vertical; dall-e-3 usa 1024x1792 */
export function mapSizeForModel(size: AdImageSize, model: string): string {
  if (size === "1024x1792" && isGptImageModel(model)) {
    return "1024x1536";
  }
  return size;
}

export function getQualityForModel(model: string): "hd" | "high" | "medium" {
  if (model === "dall-e-3") return "hd";
  if (model === "gpt-image-1-mini") return "medium";
  return "high";
}

export function isModelNotFoundError(message: string): boolean {
  return /does not exist|model.*not found|invalid model/i.test(message);
}

export function isUnknownParamError(message: string, param: string): boolean {
  return new RegExp(`Unknown parameter.*['"]?${param}['"]?`, "i").test(message);
}
