export type CompositionCategory =
  | "RetailAggressive"
  | "EditorialPremium"
  | "TechModern";

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
}

export type SlotAccent = "none" | "vertical-line" | "color-dot" | "hairline-above" | "ghost-cta";

export interface SlotRule {
  slotKey: SlotKey;
  zone: ZoneAnchor;
  align: TextAlignment;
  className: string;
  accent?: SlotAccent;
  wrapperClassName?: string;
}

export interface DecorativeRule {
  type: "hairline-rule" | "masthead-rule" | "frame-hairline";
  className: string;
}

export interface CompositionLayout {
  id: string;
  name: string;
  category: CompositionCategory;
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

export interface CategoryMaster {
  id: CompositionCategory;
  label: string;
  description: string;
  keywords: string[];
  layouts: CompositionLayout[];
}

export interface AdCopySlots {
  hook: string;
  badge: string;
  subtext: string;
  cta: string;
}

export const CATEGORY_MASTERS: CategoryMaster[] = [
  {
    id: "RetailAggressive",
    label: "Fashion Retail Editorial",
    description: "Streetwear y retail con tratamiento de revista, no banner",
    keywords: ["descuento", "oferta", "zapatillas", "ropa", "deporte", "flash", "sale"],
    layouts: [
      layoutRetailFlashDiagonal(),
      layoutRetailBoldStripe(),
      layoutRetailStickerStack(),
      layoutRetailImpactBanner(),
      layoutRetailCornerPunch(),
    ],
  },
  {
    id: "EditorialPremium",
    label: "Editorial Premium",
    description: "Moda, lujo y marcas con estética editorial",
    keywords: ["premium", "lujo", "moda", "elegante", "colección", "exclusivo"],
    layouts: [
      layoutEditorialSerifFrame(),
      layoutEditorialLuxuryBar(),
      layoutEditorialMinimalRule(),
      layoutEditorialMagazineSplit(),
      layoutEditorialGoldAccent(),
    ],
  },
  {
    id: "TechModern",
    label: "Tech Moderno",
    description: "SaaS, tecnología y servicios digitales",
    keywords: ["tech", "app", "software", "digital", "servicio", "startup"],
    layouts: [
      layoutTechGlassPanel(),
      layoutTechGridLines(),
      layoutTechNeonEdge(),
      layoutTechDataCard(),
      layoutTechCleanStack(),
    ],
  },
];

function baseTypography(
  hook: Partial<TypographyToken>,
  badge: Partial<TypographyToken>,
  subtext: Partial<TypographyToken>,
  cta: Partial<TypographyToken>
): Record<SlotKey, TypographyToken> {
  return {
    hook: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: "700",
      fontSize: "3.75rem",
      letterSpacing: "-0.02em",
      uppercase: false,
      color: "#FFFFFF",
      ...hook,
    },
    badge: {
      fontFamily: "'Montserrat', system-ui, sans-serif",
      fontWeight: "500",
      fontSize: "0.7rem",
      letterSpacing: "0.35em",
      uppercase: true,
      color: "#D4AF37",
      ...badge,
    },
    subtext: {
      fontFamily: "'Montserrat', system-ui, sans-serif",
      fontWeight: "300",
      fontSize: "1.2rem",
      letterSpacing: "0.02em",
      color: "#F0F0F0",
      ...subtext,
    },
    cta: {
      fontFamily: "'Montserrat', system-ui, sans-serif",
      fontWeight: "500",
      fontSize: "0.7rem",
      letterSpacing: "0.32em",
      uppercase: true,
      color: "#FFFFFF",
      ...cta,
    },
  };
}

const OVERLAY = "absolute inset-0 flex flex-col pointer-events-none";
const TOP_ZONE = "flex-1 flex flex-col justify-start px-14 pt-16 gap-6";
const BOTTOM_ZONE = "flex flex-col justify-end px-14 pb-16 gap-6 min-h-[30%]";

function layoutRetailFlashDiagonal(): CompositionLayout {
  return {
    id: "retail-flash-diagonal",
    name: "Cover Left Rule",
    category: "RetailAggressive",
    description: "Portada con línea vertical editorial",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: TOP_ZONE,
    bottomZoneClass: BOTTOM_ZONE,
    slots: [
      { slotKey: "badge", zone: "top", align: "left", className: "", accent: "color-dot" },
      { slotKey: "hook", zone: "top", align: "left", className: "leading-[1.05]", accent: "vertical-line" },
      { slotKey: "subtext", zone: "bottom", align: "left", className: "leading-relaxed max-w-[85%]", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography({}, { color: "#E8C872" }, {}, { color: "#FFFFFF" }),
    palette: { accent: "#E8C872", contrast: "#FFFFFF", surface: "#0A0A0A", muted: "#888888" },
    decorative: { type: "hairline-rule", className: "absolute top-14 left-14 right-14 h-px bg-white/20" },
  };
}

function layoutRetailBoldStripe(): CompositionLayout {
  return {
    id: "retail-bold-stripe",
    name: "Masthead Stripe",
    category: "RetailAggressive",
    description: "Regla horizontal tipo masthead de revista",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "flex-1 flex flex-col justify-center px-14 gap-6",
    bottomZoneClass: BOTTOM_ZONE,
    slots: [
      { slotKey: "badge", zone: "top", align: "center", className: "", accent: "color-dot" },
      { slotKey: "hook", zone: "top", align: "center", className: "text-center leading-tight", accent: "none" },
      { slotKey: "subtext", zone: "bottom", align: "center", className: "text-center max-w-[80%]", accent: "hairline-above" },
      { slotKey: "cta", zone: "bottom", align: "center", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography({ fontSize: "4.25rem" }, {}, {}, {}),
    palette: { accent: "#C9A962", contrast: "#FFFFFF", surface: "#0A0A0A", muted: "#777777" },
    decorative: { type: "masthead-rule", className: "absolute top-20 left-1/2 -translate-x-1/2 w-24 h-px bg-[var(--ad-accent)]" },
  };
}

function layoutRetailStickerStack(): CompositionLayout {
  return {
    id: "retail-sticker-stack",
    name: "Editorial Stack",
    category: "RetailAggressive",
    description: "Apilamiento editorial con aire",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: TOP_ZONE,
    bottomZoneClass: BOTTOM_ZONE,
    slots: [
      { slotKey: "hook", zone: "top", align: "left", className: "", accent: "vertical-line" },
      { slotKey: "badge", zone: "top", align: "left", className: "mt-2", accent: "color-dot" },
      { slotKey: "subtext", zone: "bottom", align: "left", className: "max-w-[88%] leading-relaxed", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography({ fontSize: "3.5rem" }, { letterSpacing: "0.28em" }, {}, {}),
    palette: { accent: "#D4AF37", contrast: "#FFFFFF", surface: "#111111", muted: "#666666" },
  };
}

function layoutRetailImpactBanner(): CompositionLayout {
  return {
    id: "retail-impact-banner",
    name: "Cover Center",
    category: "RetailAggressive",
    description: "Titular centrado estilo portada",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "flex-1 flex flex-col justify-end px-14 pb-8 gap-5 items-center text-center",
    bottomZoneClass: "px-14 pb-16 flex flex-col gap-5 items-center",
    slots: [
      { slotKey: "badge", zone: "top", align: "center", className: "", accent: "color-dot" },
      { slotKey: "hook", zone: "top", align: "center", className: "text-center max-w-[90%]", accent: "none" },
      { slotKey: "subtext", zone: "bottom", align: "center", className: "text-center max-w-[75%]", accent: "hairline-above" },
      { slotKey: "cta", zone: "bottom", align: "center", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography({ fontSize: "4rem" }, {}, { fontWeight: "400" }, {}),
    palette: { accent: "#F5F5F5", contrast: "#FFFFFF", surface: "#000000", muted: "#555555" },
    decorative: { type: "frame-hairline", className: "absolute inset-10 border border-white/12 pointer-events-none" },
  };
}

function layoutRetailCornerPunch(): CompositionLayout {
  return {
    id: "retail-corner-punch",
    name: "Asymmetric Cover",
    category: "RetailAggressive",
    description: "Composición asimétrica de revista",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: TOP_ZONE,
    bottomZoneClass: "flex flex-col justify-end px-14 pb-16 gap-6 items-end text-right",
    slots: [
      { slotKey: "hook", zone: "top", align: "left", className: "", accent: "vertical-line" },
      { slotKey: "badge", zone: "top", align: "right", className: "self-end", accent: "color-dot" },
      { slotKey: "subtext", zone: "bottom", align: "right", className: "max-w-[80%]", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "right", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography({}, {}, {}, {}),
    palette: { accent: "#C9A962", contrast: "#FFFFFF", surface: "#0D0D0D", muted: "#5A5A5A" },
  };
}

function layoutEditorialSerifFrame(): CompositionLayout {
  return {
    id: "editorial-serif-frame",
    name: "Serif Frame",
    category: "EditorialPremium",
    description: "Marco hairline y tipografía serif",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "flex-1 flex flex-col justify-center px-16 gap-6 items-center text-center",
    bottomZoneClass: "px-16 pb-16 flex flex-col gap-5 items-center",
    slots: [
      { slotKey: "badge", zone: "top", align: "center", className: "", accent: "color-dot" },
      { slotKey: "hook", zone: "top", align: "center", className: "text-center max-w-[92%]", accent: "none" },
      { slotKey: "subtext", zone: "bottom", align: "center", className: "text-center max-w-[78%] leading-relaxed", accent: "hairline-above" },
      { slotKey: "cta", zone: "bottom", align: "center", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography({ fontSize: "4rem" }, { color: "#D4AF37" }, { fontSize: "1.15rem" }, { color: "#D4AF37" }),
    palette: { accent: "#D4AF37", contrast: "#FFFFFF", surface: "#1A1A1A", muted: "#666666" },
    decorative: { type: "frame-hairline", className: "absolute inset-12 border border-white/18 pointer-events-none" },
  };
}

function layoutEditorialLuxuryBar(): CompositionLayout {
  return {
    id: "editorial-luxury-bar",
    name: "Luxury Bar",
    category: "EditorialPremium",
    description: "Línea vertical de lujo junto al titular",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: TOP_ZONE,
    bottomZoneClass: BOTTOM_ZONE,
    slots: [
      { slotKey: "badge", zone: "top", align: "left", className: "", accent: "color-dot" },
      { slotKey: "hook", zone: "top", align: "left", className: "max-w-[88%]", accent: "vertical-line" },
      { slotKey: "subtext", zone: "bottom", align: "left", className: "max-w-[85%]", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography({ fontSize: "3.6rem" }, {}, { fontWeight: "300", fontSize: "1.3rem" }, {}),
    palette: { accent: "#D4AF37", contrast: "#FFFFFF", surface: "#121212", muted: "#555555" },
  };
}

function layoutEditorialMinimalRule(): CompositionLayout {
  return {
    id: "editorial-minimal-rule",
    name: "Minimal Rule",
    category: "EditorialPremium",
    description: "Minimalismo suizo con regla fina",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "flex-1 flex flex-col justify-start px-16 pt-20 gap-8",
    bottomZoneClass: "px-16 pb-20 flex flex-col gap-6 border-t border-white/20 pt-10",
    slots: [
      { slotKey: "badge", zone: "top", align: "left", className: "", accent: "color-dot" },
      { slotKey: "hook", zone: "top", align: "left", className: "", accent: "vertical-line" },
      { slotKey: "subtext", zone: "bottom", align: "left", className: "max-w-[80%]", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography({ fontSize: "3.4rem" }, { color: "#AAAAAA" }, { color: "#CCCCCC" }, {}),
    palette: { accent: "#FFFFFF", contrast: "#000000", surface: "#0A0A0A", muted: "#888888" },
  };
}

function layoutEditorialMagazineSplit(): CompositionLayout {
  return {
    id: "editorial-magazine-split",
    name: "Magazine Split",
    category: "EditorialPremium",
    description: "Split editorial con titular sobre imagen",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "flex-1 flex flex-col justify-end px-14 pb-10 gap-5",
    bottomZoneClass: "px-14 pb-16 flex flex-col gap-5 border-t border-white/15 pt-8",
    slots: [
      { slotKey: "hook", zone: "top", align: "left", className: "max-w-[90%]", accent: "vertical-line" },
      { slotKey: "badge", zone: "top", align: "left", className: "", accent: "color-dot" },
      { slotKey: "subtext", zone: "bottom", align: "left", className: "max-w-[85%]", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography({ fontSize: "4.25rem" }, {}, { fontSize: "1.25rem" }, { color: "#D4AF37" }),
    palette: { accent: "#D4AF37", contrast: "#FFFFFF", surface: "#111111", muted: "#444444" },
  };
}

function layoutEditorialGoldAccent(): CompositionLayout {
  return {
    id: "editorial-gold-accent",
    name: "Gold Accent",
    category: "EditorialPremium",
    description: "Acento dorado y centrado de portada",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "flex-1 flex flex-col justify-center px-14 gap-6 items-center text-center",
    bottomZoneClass: "px-14 pb-16 flex flex-col gap-5 items-center",
    slots: [
      { slotKey: "badge", zone: "top", align: "center", className: "", accent: "color-dot" },
      { slotKey: "hook", zone: "top", align: "center", className: "text-center", accent: "none" },
      { slotKey: "subtext", zone: "bottom", align: "center", className: "text-center max-w-[72%]", accent: "hairline-above" },
      { slotKey: "cta", zone: "bottom", align: "center", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography({ fontSize: "3.8rem" }, { color: "#D4AF37" }, { fontWeight: "300" }, { color: "#D4AF37" }),
    palette: { accent: "#D4AF37", contrast: "#FFFFFF", surface: "#151515", muted: "#5A5A5A" },
    decorative: { type: "hairline-rule", className: "absolute bottom-24 left-1/2 -translate-x-1/2 w-32 h-px bg-[var(--ad-accent)]/80" },
  };
}

function layoutTechGlassPanel(): CompositionLayout {
  return {
    id: "tech-glass-panel",
    name: "Swiss Minimal",
    category: "TechModern",
    description: "Tech premium con minimalismo suizo",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: TOP_ZONE,
    bottomZoneClass: BOTTOM_ZONE,
    slots: [
      { slotKey: "hook", zone: "top", align: "left", className: "", accent: "vertical-line" },
      { slotKey: "badge", zone: "top", align: "left", className: "", accent: "color-dot" },
      { slotKey: "subtext", zone: "bottom", align: "left", className: "max-w-[82%]", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography(
      { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: "300", fontSize: "3.25rem", uppercase: false },
      { fontFamily: "'Inter', sans-serif", color: "#A8B4C4" },
      { fontFamily: "'Inter', sans-serif", fontWeight: "400", fontSize: "1.1rem", color: "#E2E8F0" },
      { fontFamily: "'Inter', sans-serif", color: "#FFFFFF" }
    ),
    palette: { accent: "#94A3B8", contrast: "#FFFFFF", surface: "#0B1220", muted: "#3A4A5C" },
  };
}

function layoutTechGridLines(): CompositionLayout {
  return {
    id: "tech-grid-lines",
    name: "Refined Grid",
    category: "TechModern",
    description: "Grid hairline discreto",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: TOP_ZONE,
    bottomZoneClass: BOTTOM_ZONE,
    slots: [
      { slotKey: "badge", zone: "top", align: "left", className: "", accent: "color-dot" },
      { slotKey: "hook", zone: "top", align: "left", className: "", accent: "vertical-line" },
      { slotKey: "subtext", zone: "bottom", align: "left", className: "", accent: "hairline-above" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography(
      { fontFamily: "'Inter', sans-serif", fontWeight: "600", fontSize: "3rem", uppercase: false },
      {},
      { fontFamily: "'Inter', sans-serif", fontSize: "1.05rem" },
      {}
    ),
    palette: { accent: "#CBD5E1", contrast: "#FFFFFF", surface: "#111827", muted: "#374151" },
    decorative: { type: "hairline-rule", className: "absolute top-16 right-14 w-px h-40 bg-white/15" },
  };
}

function layoutTechNeonEdge(): CompositionLayout {
  return {
    id: "tech-neon-edge",
    name: "Quiet Luxury Tech",
    category: "TechModern",
    description: "Tech sin neón — líneas finas",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: TOP_ZONE,
    bottomZoneClass: "flex flex-col justify-end px-14 pb-16 gap-6 items-end text-right",
    slots: [
      { slotKey: "hook", zone: "top", align: "left", className: "", accent: "vertical-line" },
      { slotKey: "badge", zone: "top", align: "right", className: "self-end", accent: "color-dot" },
      { slotKey: "subtext", zone: "bottom", align: "right", className: "max-w-[80%]", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "right", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography(
      { fontFamily: "'Inter', sans-serif", fontSize: "3.4rem", uppercase: false },
      { color: "#E2E8F0" },
      {},
      {}
    ),
    palette: { accent: "#E2E8F0", contrast: "#FFFFFF", surface: "#050505", muted: "#333333" },
    decorative: { type: "frame-hairline", className: "absolute inset-14 border border-white/10 pointer-events-none" },
  };
}

function layoutTechDataCard(): CompositionLayout {
  return {
    id: "tech-data-card",
    name: "Product Feature",
    category: "TechModern",
    description: "Feature editorial para producto tech",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: TOP_ZONE,
    bottomZoneClass: BOTTOM_ZONE,
    slots: [
      { slotKey: "badge", zone: "top", align: "left", className: "", accent: "color-dot" },
      { slotKey: "hook", zone: "top", align: "left", className: "max-w-[85%]", accent: "vertical-line" },
      { slotKey: "subtext", zone: "bottom", align: "left", className: "", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography(
      { fontFamily: "'Inter', sans-serif", fontWeight: "600", fontSize: "2.85rem", uppercase: false },
      { fontSize: "0.65rem", color: "#94A3B8" },
      { fontSize: "1.05rem", color: "#CBD5E1" },
      { color: "#F8FAFC" }
    ),
    palette: { accent: "#94A3B8", contrast: "#FFFFFF", surface: "#0F172A", muted: "#334155" },
  };
}

function layoutTechCleanStack(): CompositionLayout {
  return {
    id: "tech-clean-stack",
    name: "Clean Stack",
    category: "TechModern",
    description: "Apilamiento limpio premium",
    containerClass: "bg-black",
    overlayClass: OVERLAY,
    topZoneClass: "flex-1 flex flex-col justify-start px-16 pt-20 gap-7",
    bottomZoneClass: "px-16 pb-20 flex flex-col gap-6 border-t border-white/12 pt-10",
    slots: [
      { slotKey: "hook", zone: "top", align: "left", className: "", accent: "vertical-line" },
      { slotKey: "badge", zone: "top", align: "left", className: "", accent: "color-dot" },
      { slotKey: "subtext", zone: "bottom", align: "left", className: "max-w-[80%]", accent: "none" },
      { slotKey: "cta", zone: "bottom", align: "left", className: "", accent: "ghost-cta" },
    ],
    typography: baseTypography(
      { fontFamily: "'Montserrat', sans-serif", fontWeight: "600", fontSize: "3rem", uppercase: false },
      { color: "#A5B4FC" },
      { fontWeight: "400", color: "#E2E8F0" },
      {}
    ),
    palette: { accent: "#A5B4FC", contrast: "#FFFFFF", surface: "#111827", muted: "#475569" },
  };
}

export const ALL_LAYOUTS: CompositionLayout[] = CATEGORY_MASTERS.flatMap((c) => c.layouts);

export const ALL_LAYOUT_IDS = ALL_LAYOUTS.map((l) => l.id) as [string, ...string[]];

export const ALL_CATEGORIES = CATEGORY_MASTERS.map((c) => c.id) as [
  CompositionCategory,
  ...CompositionCategory[],
];

export function getCategoryMaster(category: CompositionCategory): CategoryMaster {
  return CATEGORY_MASTERS.find((c) => c.id === category)!;
}

export function getLayoutById(layoutId: string): CompositionLayout | undefined {
  return ALL_LAYOUTS.find((l) => l.id === layoutId);
}

export function resolveLayout(
  category: CompositionCategory,
  layoutId: string
): CompositionLayout {
  const layout = getLayoutById(layoutId);
  if (layout && layout.category === category) return layout;

  const fallback = CATEGORY_MASTERS.find((c) => c.id === category)?.layouts[0];
  if (!fallback) throw new Error(`Categoría desconocida: ${category}`);
  return fallback;
}

export function getCategoryLabel(category: CompositionCategory): string {
  return getCategoryMaster(category).label;
}

export function buildLayoutCatalogForPrompt(): string {
  return CATEGORY_MASTERS.map(
    (cat) =>
      `[${cat.id}] ${cat.label} — ${cat.description}\nLayouts: ${cat.layouts.map((l) => `${l.id} (${l.name})`).join(", ")}`
  ).join("\n\n");
}
