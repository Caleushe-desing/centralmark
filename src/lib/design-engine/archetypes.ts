/**
 * Arquetipos visuales del Design Engine — intención de marketing + layout por defecto.
 */

import { getLayoutById, type CompositionLayout } from "./composition/rules";
import type { DesignDocument } from "./schemas";

export const ARCHETYPE_IDS = ["drop", "spotlight", "editorial", "promo"] as const;
export type VisualArchetype = (typeof ARCHETYPE_IDS)[number];

export const DEFAULT_ARCHETYPE: VisualArchetype = "drop";

export interface ArchetypeSampleCopy {
  hook: string;
  badge: string;
  subtext: string;
  cta: string;
}

export interface ArchetypeDefinition {
  id: VisualArchetype;
  label: string;
  marketingPurpose: string;
  defaultLayoutId: string;
  /** Layout usado en la tarjeta de muestra (preview estática, sin OpenAI) */
  sampleLayoutId: string;
  /** Foto real precargada — misma que en la rama anterior de modos */
  sampleImageUrl: string;
  sampleCopy: ArchetypeSampleCopy;
  maxHookWords: number;
  /** Reglas explícitas para prompts y composición */
  compositionRules: string;
}

export const ARCHETYPE_DEFINITIONS: ArchetypeDefinition[] = [
  {
    id: "drop",
    label: "Drop",
    marketingPurpose: "Lanzamientos urbanos, hype y streetwear de alto impacto.",
    defaultLayoutId: "drop-grid-break",
    sampleLayoutId: "drop-grid-break",
    sampleImageUrl: "/design-modes/impact-sample.png",
    sampleCopy: {
      badge: "NUEVA COLECCIÓN INVIERNO",
      hook: "REDEFINIENDO LA MODA URBANA",
      subtext: "-50% DTO",
      cta: "EXCLUSIVO · FIN DE SEMANA",
    },
    maxHookWords: 5,
    compositionRules:
      "Sans-serif ultra-bold masivo, alto contraste, cajas tipográficas que rompen la grilla de la imagen.",
  },
  {
    id: "spotlight",
    label: "Spotlight",
    marketingPurpose: "Producto héroe con foco en el artículo y mínima distracción.",
    defaultLayoutId: "spotlight-hero-void",
    sampleLayoutId: "spotlight-hero-void",
    sampleImageUrl: "/design-modes/editorial-sample.png",
    sampleCopy: {
      badge: "COLECCIÓN",
      hook: "CHAQUETA DENIM",
      subtext: "Edición limitada",
      cta: "VER MÁS",
    },
    maxHookWords: 5,
    compositionRules:
      "Mucho espacio negativo, tipografías ultraligeras, acentos en hairlines milimétricas.",
  },
  {
    id: "editorial",
    label: "Editorial",
    marketingPurpose: "Storytelling de moda y estilo de vida aspiracional.",
    defaultLayoutId: "editorial-serif-cover",
    sampleLayoutId: "editorial-serif-cover",
    sampleImageUrl: "/design-modes/editorial-sample.png",
    sampleCopy: {
      badge: "EDICIÓN INVIERNO",
      hook: "INVIERNO URBANO",
      subtext: "Moda que desafía el frío con elegancia.",
      cta: "VER COLECCIÓN",
    },
    maxHookWords: 4,
    compositionRules:
      "Serif elegante + itálicas, composición tipo portada de revista de alta costura.",
  },
  {
    id: "promo",
    label: "Promo",
    marketingPurpose: "Liquidación premium con oferta clara y diseño comercial curado.",
    defaultLayoutId: "promo-harmonic-block",
    sampleLayoutId: "promo-harmonic-block",
    sampleImageUrl: "/design-modes/retail-sample.png",
    sampleCopy: {
      badge: "-50% SOLO ESTE FINDE",
      hook: "HASTA 50% OFF",
      subtext: "Nueva colección invierno urbano. Stock limitado.",
      cta: "COMPRA AHORA",
    },
    maxHookWords: 6,
    compositionRules:
      "Enfoque comercial limpio, porcentaje destacado integrado armónicamente, bloques de color curados.",
  },
];

export function getArchetypeDefinition(id: string | undefined | null): ArchetypeDefinition {
  return ARCHETYPE_DEFINITIONS.find((a) => a.id === id) ?? ARCHETYPE_DEFINITIONS[0]!;
}

export function parseArchetype(value: unknown): VisualArchetype {
  if (value === "drop" || value === "spotlight" || value === "editorial" || value === "promo") {
    return value;
  }
  return DEFAULT_ARCHETYPE;
}

/** Layout + copy de muestra — solo render cliente, cero llamadas a OpenAI */
export function getArchetypeSampleLayout(archetype: VisualArchetype): CompositionLayout {
  const def = getArchetypeDefinition(archetype);
  return getLayoutById(def.sampleLayoutId) ?? getLayoutById(def.defaultLayoutId)!;
}

export function buildArchetypeSampleCopy(
  archetype: VisualArchetype
): Pick<DesignDocument, "hook" | "badge" | "subtext" | "cta"> {
  return getArchetypeDefinition(archetype).sampleCopy;
}
