/** Precios operativos reales (USD) — actualizar según tarifas OpenAI. */
export const AI_PRICING = {
  gpt4o: {
    inputPer1M: 5.0,
    outputPer1M: 15.0,
  },
  image: {
    /** gpt-image-1 high quality ~$0.17 por imagen 1024×1024 */
    fixedPerImage: 0.17,
  },
} as const;

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export function calculateTextCostUsd(usage: TokenUsage): number {
  const inputCost = (usage.promptTokens / 1_000_000) * AI_PRICING.gpt4o.inputPer1M;
  const outputCost = (usage.completionTokens / 1_000_000) * AI_PRICING.gpt4o.outputPer1M;
  return inputCost + outputCost;
}

export function calculateImageCostUsd(imageCount = 1): number {
  return imageCount * AI_PRICING.image.fixedPerImage;
}

export function calculateGenerationCost(usage: TokenUsage, imageCount = 1) {
  const textCostUsd = calculateTextCostUsd(usage);
  const imageCostUsd = calculateImageCostUsd(imageCount);
  const totalUsd = textCostUsd + imageCostUsd;

  return {
    textCostUsd: roundUsd(textCostUsd),
    imageCostUsd: roundUsd(imageCostUsd),
    totalUsd: roundUsd(totalUsd),
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
  };
}

function roundUsd(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function formatCostUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}
