/**
 * Rate limiting en memoria por tienda — sustituir por Redis en producción multi-instancia.
 *
 * premium: generación de imágenes / Design Engine (~$0.17+ por llamada)
 * standard: chat, moderación, sugerencias de texto
 */

const WINDOW_MS = 60 * 60 * 1000;

export type StoreAiTier = "premium" | "standard";

const TIER_LIMITS: Record<StoreAiTier, number> = {
  premium: 10,
  standard: 40,
};

interface TierState {
  timestamps: number[];
}

const storeWindows = new Map<string, Map<StoreAiTier, TierState>>();

export class StoreAiRateLimitError extends Error {
  readonly tier: StoreAiTier;
  readonly retryAfterSeconds: number;

  constructor(tier: StoreAiTier, retryAfterSeconds: number) {
    const limit = TIER_LIMITS[tier];
    super(
      tier === "premium"
        ? `Límite de generaciones con imagen alcanzado (${limit}/hora). Intenta en ${Math.ceil(retryAfterSeconds / 60)} min.`
        : `Límite de solicitudes IA alcanzado (${limit}/hora). Intenta en ${Math.ceil(retryAfterSeconds / 60)} min.`
    );
    this.name = "StoreAiRateLimitError";
    this.tier = tier;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function assertStoreAiRateLimit(storeId: string, tier: StoreAiTier): void {
  const now = Date.now();
  let tierMap = storeWindows.get(storeId);
  if (!tierMap) {
    tierMap = new Map();
    storeWindows.set(storeId, tierMap);
  }

  const state = tierMap.get(tier) ?? { timestamps: [] };
  state.timestamps = state.timestamps.filter((t) => now - t < WINDOW_MS);

  const max = TIER_LIMITS[tier];
  if (state.timestamps.length >= max) {
    const oldest = state.timestamps[0]!;
    throw new StoreAiRateLimitError(tier, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
  }

  state.timestamps.push(now);
  tierMap.set(tier, state);
}
