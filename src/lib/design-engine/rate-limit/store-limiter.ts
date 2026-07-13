/** @deprecated Usa assertStoreAiRateLimit(storeId, "premium") */
import { assertStoreAiRateLimit, StoreAiRateLimitError } from "@/lib/ai/rate-limit/store-ai-limiter";

export { StoreAiRateLimitError as StoreRateLimitError };

const WINDOW_MS = 60 * 60 * 1000;
const MAX_GENERATIONS_PER_WINDOW = 10;

export function assertStoreRateLimit(storeId: string): void {
  assertStoreAiRateLimit(storeId, "premium");
}

/** @deprecated Solo para tests/documentación */
export const _DESIGN_RATE_LIMIT = {
  windowMs: WINDOW_MS,
  maxPerWindow: MAX_GENERATIONS_PER_WINDOW,
};
