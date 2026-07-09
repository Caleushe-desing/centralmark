import { APIError } from "openai";

export class AdImageGenerationError extends Error {
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
    this.name = "AdImageGenerationError";
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

function isContentPolicyError(err: APIError): boolean {
  const msg = err.message.toLowerCase();
  return (
    err.status === 400 &&
    (msg.includes("content policy") ||
      msg.includes("safety system") ||
      msg.includes("content filters") ||
      msg.includes("policy violation") ||
      msg.includes("not allowed"))
  );
}

export function mapAdImageError(error: unknown): AdImageGenerationError {
  if (error instanceof AdImageGenerationError) return error;

  if (error instanceof APIError) {
    if (isContentPolicyError(error)) {
      return new AdImageGenerationError(
        "OpenAI rechazó el prompt por políticas de contenido. Ajusta el concepto o el producto e intenta de nuevo.",
        "CONTENT_POLICY",
        400,
        { cause: error }
      );
    }
    if (error.status === 429) {
      return new AdImageGenerationError(
        "Límite de generación de imágenes alcanzado. Espera unos segundos.",
        "RATE_LIMIT",
        429,
        { cause: error, retryAfterSeconds: parseRetryAfter(error) }
      );
    }
    if (error.status === 401 || error.status === 403) {
      return new AdImageGenerationError(
        "Credenciales de OpenAI inválidas.",
        "AUTH_ERROR",
        503,
        { cause: error }
      );
    }
    if (error.status && error.status >= 500) {
      return new AdImageGenerationError(
        "DALL-E 3 no está disponible temporalmente.",
        "UPSTREAM_ERROR",
        503,
        { cause: error }
      );
    }
    return new AdImageGenerationError(
      error.message || "Error al generar imagen con DALL-E 3",
      "OPENAI_IMAGE_ERROR",
      502,
      { cause: error }
    );
  }

  if (error instanceof Error) {
    if (error.name === "OpenAIConfigError") {
      return new AdImageGenerationError(error.message, "OPENAI_CONFIG_ERROR", 503, {
        cause: error,
      });
    }
    return new AdImageGenerationError(error.message, "UNKNOWN_ERROR", 500, {
      cause: error,
    });
  }

  return new AdImageGenerationError(
    "Error desconocido al generar imagen publicitaria",
    "UNKNOWN_ERROR",
    500,
    { cause: error }
  );
}
