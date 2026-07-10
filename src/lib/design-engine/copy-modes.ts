import { getLayoutById, type CompositionLayout } from "./composition/rules";
import type { DesignDocument } from "./schemas";

export const COPY_MODE_IDS = ["impact", "retail", "editorial"] as const;
export type CopyMode = (typeof COPY_MODE_IDS)[number];

export const DEFAULT_COPY_MODE: CopyMode = "impact";

export interface CopyModeDefinition {
  id: CopyMode;
  label: string;
  shortLabel: string;
  description: string;
  sampleImageUrl: string;
  sampleLayoutId: string;
  sampleCopy: {
    hook: string;
    badge: string;
    subtext: string;
    cta: string;
  };
  maxHookWords: number;
  preferredCategory: "ImpactBold" | "RetailAggressive" | "EditorialPremium";
}

export const COPY_MODES: CopyModeDefinition[] = [
  {
    id: "impact",
    label: "Impacto urbano",
    shortLabel: "Impacto",
    description:
      "Tipografías gigantes, % en rojo, energía de calle. El estilo que vende en Instagram.",
    sampleImageUrl: "/design-modes/impact-sample.png",
    sampleLayoutId: "impact-urban-blast",
    sampleCopy: {
      badge: "NUEVA COLECCIÓN INVIERNO",
      hook: "REDEFINIENDO LA MODA URBANA",
      subtext: "-50% DTO",
      cta: "EXCLUSIVO · FIN DE SEMANA · SOLO EN TIENDA",
    },
    maxHookWords: 8,
    preferredCategory: "ImpactBold",
  },
  {
    id: "retail",
    label: "Marketing digital",
    shortLabel: "Retail",
    description: "Ofertas claras y CTA directo. Menos dramático que Impacto.",
    sampleImageUrl: "/design-modes/retail-sample.png",
    sampleLayoutId: "retail-impact-banner",
    sampleCopy: {
      badge: "-50% SOLO ESTE FINDE",
      hook: "HASTA 50% OFF",
      subtext: "Nueva colección invierno urbano.",
      cta: "COMPRA AHORA",
    },
    maxHookWords: 6,
    preferredCategory: "RetailAggressive",
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
    preferredCategory: "EditorialPremium",
  },
];

export function getCopyModeDefinition(mode: string | undefined | null): CopyModeDefinition {
  const found = COPY_MODES.find((m) => m.id === mode);
  return found ?? COPY_MODES[0]!;
}

export function getSampleLayout(mode: CopyMode): CompositionLayout {
  const def = getCopyModeDefinition(mode);
  return getLayoutById(def.sampleLayoutId) ?? getLayoutById("impact-urban-blast")!;
}

export function parseCopyMode(value: unknown): CopyMode {
  if (value === "impact" || value === "editorial" || value === "retail") return value;
  return DEFAULT_COPY_MODE;
}

export function buildSampleDesignDocument(mode: CopyMode): Pick<
  DesignDocument,
  "hook" | "badge" | "subtext" | "cta"
> {
  return getCopyModeDefinition(mode).sampleCopy;
}
