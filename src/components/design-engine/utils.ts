import type { CSSProperties } from "react";
import type { AdCopySlots, CompositionLayout, SlotKey, SlotRule, TypographyToken } from "@/lib/design-engine/composition/rules";

export function slotText(copy: AdCopySlots, slotKey: SlotKey): string {
  return copy[slotKey]?.trim() ?? "";
}

export function buildSlotStyle(
  token: TypographyToken,
  paletteAccent: string,
  fontSizePx?: number
): CSSProperties {
  return {
    fontFamily: token.fontFamily,
    fontWeight: token.fontWeight,
    fontSize: fontSizePx ? `${fontSizePx}px` : token.fontSize,
    letterSpacing: token.letterSpacing,
    fontStyle: token.fontStyle,
    textTransform: token.uppercase ? "uppercase" : undefined,
    color: token.color?.includes("var(") ? undefined : token.color,
    lineHeight: 1.12,
  };
}

export function alignClass(align: SlotRule["align"]): string {
  if (align === "center") return "self-center text-center";
  if (align === "right") return "self-end text-right";
  return "self-start text-left";
}

export function paletteCssVars(palette: {
  accent: string;
  contrast: string;
  surface: string;
  muted: string;
}): CSSProperties {
  return {
    ["--ad-accent" as string]: palette.accent,
    ["--ad-contrast" as string]: palette.contrast,
    ["--ad-surface" as string]: palette.surface,
    ["--ad-muted" as string]: palette.muted,
  };
}

/** Ancho máximo útil por zona (1080 canvas − padding) */
export function slotMaxWidthPx(
  rule: SlotRule,
  layout?: Pick<CompositionLayout, "id">,
  slotKey?: SlotKey
): number {
  if (layout?.id === "drop-grid-break") {
    const horizontalPad = 32 + 3 + 8;
    if (rule.zone === "top") return Math.floor(1080 * 0.48) - 64;
    if (rule.zone === "bottom") {
      const boxWidth = Math.floor(1080 * 0.48);
      return boxWidth - horizontalPad - (slotKey === "cta" ? 4 : 0);
    }
  }

  const base = 1080 - 112; // px-14 × 2
  if (rule.className.includes("max-w-")) {
    if (rule.className.includes("max-w-[90%]")) return base * 0.9;
    if (rule.className.includes("max-w-[88%]")) return base * 0.88;
    if (rule.className.includes("max-w-[85%]")) return base * 0.85;
    if (rule.className.includes("max-w-[82%]")) return base * 0.82;
    if (rule.className.includes("max-w-[80%]")) return base * 0.8;
    if (rule.className.includes("max-w-[78%]")) return base * 0.78;
    if (rule.className.includes("max-w-[75%]")) return base * 0.75;
    if (rule.className.includes("max-w-[72%]")) return base * 0.72;
  }
  if (rule.className.includes("max-w-full") && layout?.id === "drop-grid-break") {
    return rule.zone === "top" ? 500 : 520;
  }
  return base;
}

export function slotMaxLines(slotKey: SlotKey): number {
  if (slotKey === "hook") return 3;
  if (slotKey === "subtext") return 4;
  return 2;
}
