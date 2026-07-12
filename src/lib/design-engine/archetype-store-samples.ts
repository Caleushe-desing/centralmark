import type { VisualArchetype } from "./archetypes";
import { getArchetypeSampleLayout } from "./archetypes";
import type { DesignDocument } from "./schemas";
import { pickArchetypeSampleCopy } from "./archetype-copy-presets";
import {
  getStoreRubroDefinition,
  inferRubroFromCategory,
  parseStoreRubro,
  type StoreRubro,
} from "@/lib/store/rubros";

export interface StoreSampleContext {
  storeName: string;
  rubro?: string | null;
  category?: string | null;
  previewImageUrl?: string | null;
}

function resolveRubro(ctx: StoreSampleContext): StoreRubro {
  if (ctx.rubro) return parseStoreRubro(ctx.rubro);
  if (ctx.category) return inferRubroFromCategory(ctx.category);
  return "other";
}

/** Foto del rubro o subida en configuración. Cero OpenAI. */
export function resolveArchetypeSampleImage(_archetype: VisualArchetype, ctx: StoreSampleContext): string {
  const rubro = resolveRubro(ctx);
  if (ctx.previewImageUrl?.trim()) {
    const url = ctx.previewImageUrl.trim();
    return url.includes("?") ? url : `${url}?rubro=${rubro}`;
  }
  const base = getStoreRubroDefinition(rubro).defaultSampleImageUrl;
  return `${base}?rubro=${rubro}`;
}

/** Copy desde presets por arquetipo × rubro (múltiples variantes disponibles) */
export function buildArchetypeSampleCopyForStore(
  archetype: VisualArchetype,
  ctx: StoreSampleContext,
  variant = 0
): Pick<DesignDocument, "hook" | "badge" | "subtext" | "cta"> {
  return pickArchetypeSampleCopy(archetype, resolveRubro(ctx), variant);
}

export { getArchetypeSampleLayout };
