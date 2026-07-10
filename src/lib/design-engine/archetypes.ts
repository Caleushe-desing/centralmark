/**
 * Arquetipos visuales del Design Engine — intención de marketing + layout por defecto.
 */

export const ARCHETYPE_IDS = ["drop", "spotlight", "editorial", "promo"] as const;
export type VisualArchetype = (typeof ARCHETYPE_IDS)[number];

export const DEFAULT_ARCHETYPE: VisualArchetype = "drop";

export interface ArchetypeDefinition {
  id: VisualArchetype;
  label: string;
  marketingPurpose: string;
  defaultLayoutId: string;
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
    maxHookWords: 8,
    compositionRules:
      "Sans-serif ultra-bold masivo, alto contraste, cajas tipográficas que rompen la grilla de la imagen.",
  },
  {
    id: "spotlight",
    label: "Spotlight",
    marketingPurpose: "Producto héroe con foco en el artículo y mínima distracción.",
    defaultLayoutId: "spotlight-hero-void",
    maxHookWords: 5,
    compositionRules:
      "Mucho espacio negativo, tipografías ultraligeras, acentos en hairlines milimétricas.",
  },
  {
    id: "editorial",
    label: "Editorial",
    marketingPurpose: "Storytelling de moda y estilo de vida aspiracional.",
    defaultLayoutId: "editorial-serif-cover",
    maxHookWords: 4,
    compositionRules:
      "Serif elegante + itálicas, composición tipo portada de revista de alta costura.",
  },
  {
    id: "promo",
    label: "Promo",
    marketingPurpose: "Liquidación premium con oferta clara y diseño comercial curado.",
    defaultLayoutId: "promo-harmonic-block",
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
