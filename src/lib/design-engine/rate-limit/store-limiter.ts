/** Rate limiting en memoria por storeId — sustituir por Redis en producción multi-instancia. */

const WINDOW_MS = 60 * 60 * 1000; // 1 hora
const MAX_GENERATIONS_PER_WINDOW = 20;

interface WindowState {
  timestamps: number[];
}

const storeWindows = new Map<string, WindowState>();

export class StoreRateLimitError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(
      `Límite de generaciones alcanzado (${MAX_GENERATIONS_PER_WINDOW}/hora). Intenta en ${Math.ceil(retryAfterSeconds / 60)} min.`
    );
    this.name = "StoreRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function assertStoreRateLimit(storeId: string): void {
  const now = Date.now();
  const state = storeWindows.get(storeId) ?? { timestamps: [] };

  state.timestamps = state.timestamps.filter((t) => now - t < WINDOW_MS);

  if (state.timestamps.length >= MAX_GENERATIONS_PER_WINDOW) {
    const oldest = state.timestamps[0]!;
    const retryAfterMs = WINDOW_MS - (now - oldest);
    throw new StoreRateLimitError(Math.ceil(retryAfterMs / 1000));
  }

  state.timestamps.push(now);
  storeWindows.set(storeId, state);
}
