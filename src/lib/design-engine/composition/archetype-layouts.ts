import type { VisualArchetype } from "../archetypes";

export type { VisualArchetype };

export type SlotKey = "hook" | "badge" | "subtext" | "cta";
export type ZoneAnchor = "top" | "bottom";
export type TextAlignment = "left" | "center" | "right";

export interface TypographyToken {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  color?: string;
  letterSpacing?: string;
  uppercase?: boolean;
  fontStyle?: string;
}

export type SlotAccent =
  | "none"
  | "vertical-line"
  | "color-dot"
  | "hairline-above"
  | "typographic-cta"
  | "grid-break-box"
  | "impact-italic"
  | "mega-discount"
  | "glass-urgency"
  | "ultra-light"
  | "hairline-frame"
  | "serif-masthead"
  | "italic-deck"
  | "promo-numeral"
  | "color-curated-block";

export interface SlotRule {
  slotKey: SlotKey;
  zone: ZoneAnchor;
  align: TextAlignment;
  className: string;
  accent?: SlotAccent;
  wrapperClassName?: string;
}

export interface DecorativeRule {
  type: "hairline-rule" | "masthead-rule" | "frame-hairline" | "light-streaks" | "spotlight-cross";
  className: string;
}

export interface CompositionLayout {
  id: string;
  name: string;
  archetype: VisualArchetype;
  description: string;
  containerClass: string;
  clipPath?: string;
  overlayClass: string;
  topZoneClass: string;
  bottomZoneClass: string;
  slots: SlotRule[];
  typography: Record<SlotKey, TypographyToken>;
  palette: {
    accent: string;
    contrast: string;
    surface: string;
    muted: string;
  };
  decorative?: DecorativeRule;
}

export interface ArchetypeMaster {
  id: VisualArchetype;
  label: string;
  description: string;
  compositionRules: string;
  keywords: string[];
  layouts: CompositionLayout[];
}

export interface AdCopySlots {
  hook: string;
  badge: string;
  subtext: string;
  cta: string;
}

const OVERLAY = "absolute inset-0 flex flex-col pointer-events-none";

/** DROP — Urbano/Hype: sans ultra-bold, cajas que rompen grilla (micro-maqueta SVG) */
function layoutDropGridBreak(): CompositionLayout {
  return {
    id: "drop-grid-break",
    name: "Grid Break",
    archetype: "drop",
    description: "Titular arriba-izquierda, producto visible centro-derecha, CTA abajo-derecha",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass:
      "relative z-10 flex flex-col justify-start items-start gap-1.5 px-8 pt-9 max-w-[50%] min-w-0 shrink-0",
    bottomZoneClass:
      "absolute bottom-7 right-6 z-20 flex flex-col items-end justify-end gap-1 min-w-0 w-[52%] max-w-[52%] overflow-hidden box-border px-4 py-3 border-l-[3px] border-[var(--ad-accent)] bg-black/72",
    slots: [
      { slotKey: "badge", zone: "top", align: "left", className: "w-full min-w-0 max-w-full leading-tight", accent: "grid-break-box" },
      {
        slotKey: "hook",
        zone: "top",
        align: "left",
        className: "w-full min-w-0 max-w-full leading-[0.92]",
        accent: "impact-italic",
      },
      {
        slotKey: "subtext",
        zone: "bottom",
        align: "right",
        className: "w-full min-w-0 max-w-full leading-none",
        accent: "mega-discount",
      },
      {
        slotKey: "cta",
        zone: "bottom",
        align: "right",
        className: "w-full min-w-0 max-w-full text-right mt-0.5",
        accent: "glass-urgency",
      },
    ],
    typography: {
      badge: { fontFamily: "'Montserrat', sans-serif", fontWeight: "900", fontSize: "1.35rem", letterSpacing: "0.06em", uppercase: true, color: "#C8FF00" },
      hook: { fontFamily: "'Montserrat', sans-serif", fontWeight: "900", fontSize: "4.25rem", letterSpacing: "-0.03em", uppercase: true, color: "#FFFFFF" },
      subtext: { fontFamily: "'Montserrat', sans-serif", fontWeight: "900", fontSize: "4.75rem", uppercase: true, color: "#FF2332" },
      cta: { fontFamily: "'Montserrat', sans-serif", fontWeight: "700", fontSize: "0.9rem", letterSpacing: "0.12em", uppercase: true, color: "#FFFFFF" },
    },
    palette: { accent: "#C8FF00", contrast: "#FF2332", surface: "#050505", muted: "#94A3B8" },
    decorative: { type: "light-streaks", className: "pointer-events-none" },
  };
}

function layoutDropEdgeCut(): CompositionLayout {
  return {
    id: "drop-edge-cut",
    name: "Edge Cut",
    archetype: "drop",
    description: "Titular encimado cortando borde inferior",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "flex flex-col justify-end px-10 pb-4 gap-2 items-start min-h-[52%] z-10",
    bottomZoneClass: "flex flex-col px-6 pb-8 gap-2 items-start z-10",
    slots: [
      { slotKey: "badge", zone: "top", align: "left", accent: "grid-break-box", className: "" },
      { slotKey: "hook", zone: "top", align: "left", className: "max-w-[105%] leading-[0.88] -ml-3", accent: "impact-italic" },
      { slotKey: "subtext", zone: "bottom", align: "left", className: "leading-none", accent: "mega-discount" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "max-w-[80%]", accent: "glass-urgency" },
    ],
    typography: {
      badge: { fontFamily: "'Montserrat', sans-serif", fontWeight: "800", fontSize: "1.35rem", letterSpacing: "0.1em", uppercase: true, color: "#00E5FF" },
      hook: { fontFamily: "'Montserrat', sans-serif", fontWeight: "900", fontSize: "5.75rem", uppercase: true, color: "#FFFFFF" },
      subtext: { fontFamily: "'Montserrat', sans-serif", fontWeight: "900", fontSize: "6.25rem", color: "#FF2332" },
      cta: { fontFamily: "'Montserrat', sans-serif", fontWeight: "700", fontSize: "0.95rem", letterSpacing: "0.2em", uppercase: true, color: "#F8FAFC" },
    },
    palette: { accent: "#00E5FF", contrast: "#FF2332", surface: "#0A0A0A", muted: "#64748B" },
    decorative: { type: "light-streaks", className: "pointer-events-none" },
  };
}

/** SPOTLIGHT — Producto héroe, espacio negativo, hairlines */
function layoutSpotlightHeroVoid(): CompositionLayout {
  return {
    id: "spotlight-hero-void",
    name: "Hero Void",
    archetype: "spotlight",
    description: "Espacio negativo central, tipografía ultraligera y hairlines",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "flex flex-col justify-start px-16 pt-20 gap-4 items-center text-center z-10",
    bottomZoneClass: "flex flex-col justify-end px-16 pb-20 gap-5 items-center text-center z-10 min-h-[22%]",
    slots: [
      { slotKey: "badge", zone: "top", align: "center", className: "", accent: "hairline-frame" },
      { slotKey: "hook", zone: "top", align: "center", className: "max-w-[70%]", accent: "ultra-light" },
      { slotKey: "subtext", zone: "bottom", align: "center", className: "max-w-[55%]", accent: "ultra-light" },
      { slotKey: "cta", zone: "bottom", align: "center", className: "", accent: "hairline-above" },
    ],
    typography: {
      badge: { fontFamily: "'Montserrat', sans-serif", fontWeight: "300", fontSize: "0.65rem", letterSpacing: "0.45em", uppercase: true, color: "#A1A1AA" },
      hook: { fontFamily: "'Montserrat', sans-serif", fontWeight: "200", fontSize: "2.75rem", letterSpacing: "0.2em", uppercase: true, color: "#FAFAFA" },
      subtext: { fontFamily: "'Montserrat', sans-serif", fontWeight: "300", fontSize: "1rem", letterSpacing: "0.08em", color: "#D4D4D8" },
      cta: { fontFamily: "'Montserrat', sans-serif", fontWeight: "400", fontSize: "0.65rem", letterSpacing: "0.38em", uppercase: true, color: "#E4E4E7" },
    },
    palette: { accent: "#E4E4E7", contrast: "#FAFAFA", surface: "#09090B", muted: "#71717A" },
    decorative: { type: "spotlight-cross", className: "pointer-events-none" },
  };
}

/** EDITORIAL — Serif + itálicas, portada revista */
function layoutEditorialSerifCover(): CompositionLayout {
  return {
    id: "editorial-serif-cover",
    name: "Serif Cover",
    archetype: "editorial",
    description: "Portada revista alta costura con serif e itálicas",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "flex-1 flex flex-col justify-center px-16 gap-5 items-center text-center",
    bottomZoneClass: "px-16 pb-16 flex flex-col gap-4 items-center",
    slots: [
      { slotKey: "badge", zone: "top", align: "center", className: "", accent: "serif-masthead" },
      { slotKey: "hook", zone: "top", align: "center", className: "text-center max-w-[92%]", accent: "italic-deck" },
      { slotKey: "subtext", zone: "bottom", align: "center", className: "text-center max-w-[78%] leading-relaxed", accent: "hairline-above" },
      { slotKey: "cta", zone: "bottom", align: "center", className: "", accent: "typographic-cta" },
    ],
    typography: {
      badge: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: "500", fontSize: "0.75rem", letterSpacing: "0.32em", uppercase: true, color: "#D4AF37" },
      hook: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: "700", fontSize: "4.25rem", letterSpacing: "-0.02em", color: "#FFFFFF" },
      subtext: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: "400", fontSize: "1.15rem", fontStyle: "italic", color: "#E8E8E8" },
      cta: { fontFamily: "'Montserrat', sans-serif", fontWeight: "500", fontSize: "0.7rem", letterSpacing: "0.28em", color: "#D4AF37" },
    },
    palette: { accent: "#D4AF37", contrast: "#FFFFFF", surface: "#1A1A1A", muted: "#666666" },
    decorative: { type: "frame-hairline", className: "absolute inset-12 border border-white/18 pointer-events-none" },
  };
}

function layoutEditorialMagazineSplit(): CompositionLayout {
  return {
    id: "editorial-magazine-split",
    name: "Magazine Split",
    archetype: "editorial",
    description: "Split editorial asimétrico",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "flex-1 flex flex-col justify-end px-14 pb-6 gap-4",
    bottomZoneClass: "px-14 pb-14 flex flex-col gap-4 border-t border-white/12 pt-8",
    slots: [
      { slotKey: "hook", zone: "top", align: "left", className: "max-w-[88%]", accent: "italic-deck" },
      { slotKey: "badge", zone: "top", align: "left", className: "", accent: "serif-masthead" },
      { slotKey: "subtext", zone: "bottom", align: "left", className: "max-w-[75%]", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "", accent: "typographic-cta" },
    ],
    typography: {
      badge: { fontFamily: "'Playfair Display', serif", fontWeight: "500", fontSize: "0.7rem", letterSpacing: "0.3em", color: "#C9A962" },
      hook: { fontFamily: "'Playfair Display', serif", fontWeight: "700", fontSize: "3.85rem", color: "#FFFFFF" },
      subtext: { fontFamily: "'Playfair Display', serif", fontWeight: "400", fontSize: "1.1rem", color: "#D4D4D4" },
      cta: { fontFamily: "'Montserrat', sans-serif", fontWeight: "500", fontSize: "0.68rem", letterSpacing: "0.3em", color: "#FFFFFF" },
    },
    palette: { accent: "#C9A962", contrast: "#FFFFFF", surface: "#111111", muted: "#555555" },
  };
}

/** PROMO — Liquidación premium, % integrado, bloques curados */
function layoutPromoHarmonicBlock(): CompositionLayout {
  return {
    id: "promo-harmonic-block",
    name: "Harmonic Block",
    archetype: "promo",
    description: "Bloque curado con porcentaje integrado armónicamente",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "absolute left-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 max-w-[42%]",
    bottomZoneClass: "absolute bottom-10 left-8 z-20",
    slots: [
      { slotKey: "subtext", zone: "top", align: "left", className: "leading-none", accent: "promo-numeral" },
      { slotKey: "hook", zone: "top", align: "left", className: "leading-tight max-w-full", accent: "color-curated-block" },
      { slotKey: "badge", zone: "top", align: "left", className: "mt-1", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "", accent: "color-curated-block" },
    ],
    typography: {
      subtext: { fontFamily: "'Montserrat', sans-serif", fontWeight: "800", fontSize: "6.5rem", letterSpacing: "-0.05em", color: "#E8C4A0" },
      hook: { fontFamily: "'Montserrat', sans-serif", fontWeight: "600", fontSize: "1.35rem", letterSpacing: "0.04em", uppercase: true, color: "#FAFAFA" },
      badge: { fontFamily: "'Montserrat', sans-serif", fontWeight: "400", fontSize: "0.85rem", letterSpacing: "0.12em", color: "#A1A1AA" },
      cta: { fontFamily: "'Montserrat', sans-serif", fontWeight: "700", fontSize: "0.75rem", letterSpacing: "0.22em", uppercase: true, color: "#1A1A1A" },
    },
    palette: { accent: "#E8C4A0", contrast: "#E8C4A0", surface: "#1C1C24", muted: "#71717A" },
    decorative: { type: "frame-hairline", className: "absolute inset-8 border border-white/8 pointer-events-none" },
  };
}

export const ARCHETYPE_MASTERS: ArchetypeMaster[] = [
  {
    id: "drop",
    label: "Drop",
    description: "Urbano / Hype — tipografía masiva que rompe la grilla",
    compositionRules:
      "Titular y badge arriba-izquierda (≤50% ancho), producto visible centro-derecha sin scrim global, bloque inferior-derecha (≤52% ancho) con descuento masivo y CTA contenidos.",
    keywords: ["drop", "hype", "streetwear", "urbano", "lanzamiento", "flash"],
    layouts: [layoutDropGridBreak(), layoutDropEdgeCut()],
  },
  {
    id: "spotlight",
    label: "Spotlight",
    description: "Producto héroe con espacio negativo",
    compositionRules:
      "Mucho espacio negativo, tipografías ultraligeras y limpias, acentos en hairlines milimétricas.",
    keywords: ["producto", "héroe", "catálogo", "minimal", "foco"],
    layouts: [layoutSpotlightHeroVoid()],
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Storytelling moda / lifestyle",
    compositionRules:
      "Tipografías Serif elegantes combinadas con itálicas, composición tipo portada de revista.",
    keywords: ["editorial", "moda", "lujo", "storytelling", "revista"],
    layouts: [layoutEditorialSerifCover(), layoutEditorialMagazineSplit()],
  },
  {
    id: "promo",
    label: "Promo",
    description: "Liquidación premium comercial",
    compositionRules:
      "Enfoque comercial limpio, porcentaje destacado integrado armónicamente, bloques de color curados.",
    keywords: ["promo", "oferta", "descuento", "liquidación", "outlet", "%"],
    layouts: [layoutPromoHarmonicBlock()],
  },
];

export const ALL_LAYOUTS: CompositionLayout[] = ARCHETYPE_MASTERS.flatMap((a) => a.layouts);

export const ALL_LAYOUT_IDS = ALL_LAYOUTS.map((l) => l.id) as [string, ...string[]];

export const ALL_ARCHETYPES = ARCHETYPE_MASTERS.map((a) => a.id) as [VisualArchetype, ...VisualArchetype[]];

export function getArchetypeMaster(archetype: VisualArchetype): ArchetypeMaster {
  return ARCHETYPE_MASTERS.find((a) => a.id === archetype)!;
}

export function getLayoutById(layoutId: string): CompositionLayout | undefined {
  return ALL_LAYOUTS.find((l) => l.id === layoutId);
}

export function resolveLayout(archetype: VisualArchetype, layoutId: string): CompositionLayout {
  const layout = getLayoutById(layoutId);
  if (layout && layout.archetype === archetype) return layout;

  const fallback = ARCHETYPE_MASTERS.find((a) => a.id === archetype)?.layouts[0];
  if (!fallback) throw new Error(`Arquetipo desconocido: ${archetype}`);
  return fallback;
}

export function getArchetypeLabel(archetype: VisualArchetype): string {
  return getArchetypeMaster(archetype).label;
}

export function buildLayoutCatalogForPrompt(): string {
  return ARCHETYPE_MASTERS.map((master) => {
    const layoutLines = master.layouts
      .map((l) => `  - ${l.id}: ${l.description}`)
      .join("\n");
    return `[${master.id}] ${master.label}\nReglas: ${master.compositionRules}\nLayouts:\n${layoutLines}`;
  }).join("\n\n");
}

/** @deprecated Use archetype */
export type CompositionCategory = VisualArchetype;
/** @deprecated Use ARCHETYPE_MASTERS */
export const CATEGORY_MASTERS = ARCHETYPE_MASTERS;
/** @deprecated Use ALL_ARCHETYPES */
export const ALL_CATEGORIES = ALL_ARCHETYPES;
/** @deprecated */
export function getCategoryMaster(category: VisualArchetype): ArchetypeMaster {
  return getArchetypeMaster(category);
}
/** @deprecated */
export function getCategoryLabel(category: VisualArchetype): string {
  return getArchetypeLabel(category);
}
