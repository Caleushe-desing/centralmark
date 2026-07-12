import type { VisualArchetype } from "./archetypes";
import { getArchetypeSampleLayout } from "./archetypes";
import type { DesignDocument } from "./schemas";
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
  /** Foto subida en configuración — prioridad sobre la del rubro */
  previewImageUrl?: string | null;
}

function resolveRubro(ctx: StoreSampleContext): StoreRubro {
  if (ctx.rubro) return parseStoreRubro(ctx.rubro);
  if (ctx.category) return inferRubroFromCategory(ctx.category);
  return "fashion";
}

function shortStoreLabel(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 14) return trimmed.toUpperCase();
  return trimmed.split(/\s+/).slice(0, 2).join(" ").toUpperCase();
}

/** Imagen de muestra — custom de la tienda o foto del rubro. Cero OpenAI. */
export function resolveArchetypeSampleImage(
  _archetype: VisualArchetype,
  ctx: StoreSampleContext
): string {
  if (ctx.previewImageUrl?.trim()) return ctx.previewImageUrl.trim();
  return getStoreRubroDefinition(resolveRubro(ctx)).defaultSampleImageUrl;
}

/** Copy corto y legible en mini-preview — adaptado al rubro y nombre de tienda */
export function buildArchetypeSampleCopyForStore(
  archetype: VisualArchetype,
  ctx: StoreSampleContext
): Pick<DesignDocument, "hook" | "badge" | "subtext" | "cta"> {
  const rubro = getStoreRubroDefinition(resolveRubro(ctx));
  const store = shortStoreLabel(ctx.storeName || "TU TIENDA");

  switch (archetype) {
    case "drop":
      return {
        badge: rubro.offerKeyword,
        hook: rubro.productKeyword,
        subtext: "30% OFF",
        cta: store,
      };
    case "spotlight":
      return {
        badge: store,
        hook: rubro.productKeyword,
        subtext: "Edición limitada",
        cta: "VER MÁS",
      };
    case "editorial":
      return {
        badge: "NUEVA EDICIÓN",
        hook: rubro.productKeyword,
        subtext: `Curado por ${ctx.storeName.trim() || "tu tienda"}`,
        cta: "DESCUBRIR",
      };
    case "promo":
      return {
        badge: "SOLO HOY",
        hook: "40% OFF",
        subtext: rubro.productKeyword,
        cta: "COMPRAR",
      };
  }
}

export { getArchetypeSampleLayout };
