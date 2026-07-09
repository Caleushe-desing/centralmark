import { APIError } from "openai";

export class CampaignGenerationError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly retryAfterSeconds?: number;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    options?: { cause?: unknown; retryAfterSeconds?: number }
  ) {
    super(message, { cause: options?.cause });
    this.name = "CampaignGenerationError";
    this.code = code;
    this.statusCode = statusCode;
    this.retryAfterSeconds = options?.retryAfterSeconds;
  }
}

function parseRetryAfter(err: APIError): number | undefined {
  const header = err.headers?.get?.("retry-after") ?? null;
  if (!header) return undefined;
  const seconds = Number(header);
  return Number.isFinite(seconds) ? seconds : undefined;
}

export function mapOpenAIError(error: unknown): CampaignGenerationError {
  if (error instanceof CampaignGenerationError) return error;

  if (error instanceof APIError) {
    if (error.status === 429) {
      return new CampaignGenerationError(
        "Límite de solicitudes de OpenAI alcanzado. Intenta de nuevo en unos segundos.",
        "RATE_LIMIT",
        429,
        { cause: error, retryAfterSeconds: parseRetryAfter(error) }
      );
    }
    if (error.status === 401 || error.status === 403) {
      return new CampaignGenerationError(
        "Credenciales de OpenAI inválidas. Revisa OPENAI_API_KEY.",
        "AUTH_ERROR",
        503,
        { cause: error }
      );
    }
    if (error.status === 400) {
      return new CampaignGenerationError(
        "Solicitud inválida al modelo de OpenAI.",
        "BAD_REQUEST",
        400,
        { cause: error }
      );
    }
    if (error.status && error.status >= 500) {
      return new CampaignGenerationError(
        "OpenAI no está disponible temporalmente.",
        "UPSTREAM_ERROR",
        503,
        { cause: error }
      );
    }
    return new CampaignGenerationError(
      error.message || "Error en la API de OpenAI",
      "OPENAI_API_ERROR",
      502,
      { cause: error }
    );
  }

  if (error instanceof SyntaxError) {
    return new CampaignGenerationError(
      "La respuesta del modelo no es JSON válido.",
      "INVALID_JSON",
      502,
      { cause: error }
    );
  }

  if (error instanceof Error) {
    return new CampaignGenerationError(error.message, "UNKNOWN_ERROR", 500, {
      cause: error,
    });
  }

  return new CampaignGenerationError("Error desconocido al generar campaña", "UNKNOWN_ERROR", 500, {
    cause: error,
  });
}
