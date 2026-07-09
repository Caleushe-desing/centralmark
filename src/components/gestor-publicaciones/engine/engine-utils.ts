import type { CSSProperties } from "react";
import type { AdCopySlots, SlotKey, SlotRule, TypographyToken } from "./compositionRules";

export function slotText(copy: AdCopySlots, slotKey: SlotKey): string {
  return copy[slotKey]?.trim() ?? "";
}

export function buildSlotStyle(token: TypographyToken, paletteAccent: string): CSSProperties {
  return {
    fontFamily: token.fontFamily,
    fontWeight: token.fontWeight,
    fontSize: token.fontSize,
    letterSpacing: token.letterSpacing,
    textTransform: token.uppercase ? "uppercase" : undefined,
    color: token.color?.includes("var(") ? undefined : token.color,
    lineHeight: 1.1,
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
