import { getLayoutById, type CompositionLayout } from "./composition/rules";
import type { DesignDocument } from "./schemas";

export const COPY_MODE_IDS = ["retail", "editorial"] as const;
export type CopyMode = (typeof COPY_MODE_IDS)[number];

export const DEFAULT_COPY_MODE: CopyMode = "retail";

export interface CopyModeDefinition {
  id: CopyMode;
  label: string;
  shortLabel: string;
  description: string;
  /** Imagen de ejemplo fija para la tarjeta de selección */
  sampleImageUrl: string;
  sampleLayoutId: string;
  sampleCopy: {
    hook: string;
    badge: string;
    subtext: string;
    cta: string;
  };
  maxHookWords: number;
}

export const COPY_MODES: CopyModeDefinition[] = [
  {
    id: "retail",
    label: "Marketing digital",
    shortLabel: "Retail",
    description: "Ofertas, urgencia y CTA de compra. Ideal para outlets y promociones.",
    sampleImageUrl: "/design-modes/retail-sample.png",
    sampleLayoutId: "retail-impact-banner",
    sampleCopy: {
      badge: "-50% SOLO ESTE FINDE",
      hook: "HASTA 50% OFF",
      subtext: "Nueva colección invierno urbano. Stock limitado en tienda.",
      cta: "COMPRA AHORA",
    },
    maxHookWords: 6,
  },
  {
    id: "editorial",
    label: "Editorial premium",
    shortLabel: "Editorial",
    description: "Estética revista de moda. Titulares cortos y tono aspiracional.",
    sampleImageUrl: "/design-modes/editorial-sample.png",
    sampleLayoutId: "editorial-serif-frame",
    sampleCopy: {
      badge: "EDICIÓN INVIERNO",
      hook: "INVIERNO URBANO",
      subtext: "Moda que desafía el frío con elegancia.",
      cta: "VER COLECCIÓN",
    },
    maxHookWords: 4,
  },
];

export function getCopyModeDefinition(mode: string | undefined | null): CopyModeDefinition {
  const found = COPY_MODES.find((m) => m.id === mode);
  return found ?? COPY_MODES[0]!;
}

export function getSampleLayout(mode: CopyMode): CompositionLayout {
  const def = getCopyModeDefinition(mode);
  return getLayoutById(def.sampleLayoutId) ?? getLayoutById("retail-impact-banner")!;
}

export function parseCopyMode(value: unknown): CopyMode {
  if (value === "editorial" || value === "retail") return value;
  return DEFAULT_COPY_MODE;
}

/** Documento de muestra solo para previews estáticas en el selector */
export function buildSampleDesignDocument(mode: CopyMode): Pick<
  DesignDocument,
  "hook" | "badge" | "subtext" | "cta"
> {
  return getCopyModeDefinition(mode).sampleCopy;
}
