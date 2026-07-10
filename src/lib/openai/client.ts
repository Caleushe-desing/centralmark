import OpenAI from "openai";

const PLACEHOLDER_KEY = "sk-...";

export class OpenAIConfigError extends Error {
  readonly code = "OPENAI_CONFIG_ERROR";

  constructor(message = "OPENAI_API_KEY no está configurada o es inválida") {
    super(message);
    this.name = "OpenAIConfigError";
  }
}

let cachedClient: OpenAI | null = null;

/**
 * Inicialización segura del cliente OpenAI.
 * Lee la API key desde process.env.OPENAI_API_KEY (nunca hardcodeada).
 */
export function getOpenAIClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || apiKey === PLACEHOLDER_KEY) {
    throw new OpenAIConfigError();
  }

  cachedClient = new OpenAI({
    apiKey,
    maxRetries: 0,
    timeout: 90_000,
  });

  return cachedClient;
}

/** Útil en tests o hot-reload para forzar nueva instancia */
export function resetOpenAIClient(): void {
  cachedClient = null;
}

export function getCampaignModel(): string {
  return process.env.OPENAI_CAMPAIGN_MODEL?.trim() || "gpt-4o";
}
