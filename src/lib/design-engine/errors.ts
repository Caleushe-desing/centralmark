export class DesignEngineError extends Error {
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
    this.name = "DesignEngineError";
    this.code = code;
    this.statusCode = statusCode;
    this.retryAfterSeconds = options?.retryAfterSeconds;
  }
}

/** @deprecated */
export const ProAdGenerationError = DesignEngineError;
