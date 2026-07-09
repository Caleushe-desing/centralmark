import type { CSSProperties } from "react";
import type { LayoutElement } from "./schemas";

const FONT_FAMILIES: Record<string, string> = {
  Inter: "Inter, var(--font-geist-sans), system-ui, sans-serif",
  Montserrat: "'Montserrat', system-ui, sans-serif",
  "Bebas Neue": "'Bebas Neue', Impact, sans-serif",
  Oswald: "'Oswald', system-ui, sans-serif",
  Anton: "'Anton', Impact, sans-serif",
  "Playfair Display": "'Playfair Display', Georgia, serif",
};

const FONT_WEIGHT_MAP: Record<string, number> = {
  normal: 400,
  semibold: 600,
  bold: 700,
  black: 900,
};

const TAILWIND_FONT_SIZE: Record<string, string> = {
  "text-xs": "0.75rem",
  "text-sm": "0.875rem",
  "text-base": "1rem",
  "text-lg": "1.125rem",
  "text-xl": "1.25rem",
  "text-2xl": "1.5rem",
  "text-3xl": "1.875rem",
  "text-4xl": "2.25rem",
  "text-5xl": "3rem",
  "text-6xl": "3.75rem",
  "text-7xl": "4.5rem",
  "text-8xl": "6rem",
  "text-9xl": "8rem",
};

function resolveFontSize(fontSize: string): string {
  return TAILWIND_FONT_SIZE[fontSize] ?? fontSize;
}

function buildBackgroundStyle(el: LayoutElement): CSSProperties {
  switch (el.backgroundStyle) {
    case "solid-hex":
      if (el.backgroundColor === "transparent") return {};
      return {
        backgroundColor: el.backgroundColor,
        padding: "0.6em 1em",
        borderRadius: "1rem",
      };
    case "glassmorphism":
      return {
        backgroundColor: el.backgroundColor,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.2)",
        padding: "0.6em 1em",
        borderRadius: "1.25rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      };
    case "neon-glow":
      return {
        backgroundColor:
          el.backgroundColor === "transparent" ? "rgba(0,0,0,0.85)" : el.backgroundColor,
        padding: "0.5em 1em",
        borderRadius: "0.75rem",
        border: `2px solid ${el.color}`,
        boxShadow: `0 0 24px ${el.color}66, 0 0 48px ${el.color}33`,
      };
    default:
      return {};
  }
}

export function hasElementBackground(el: LayoutElement): boolean {
  return el.backgroundStyle !== "none" && el.backgroundColor !== "transparent";
}

/** Estilos tipográficos del bloque (sin posicionamiento absoluto). */
export function buildLayoutElementStyle(el: LayoutElement): CSSProperties {
  const fontSize = resolveFontSize(el.fontSize);
  const bg = buildBackgroundStyle(el);
  const needsShadow = el.textShadow || el.backgroundStyle === "none";

  return {
    color: el.color,
    fontFamily: FONT_FAMILIES[el.typography] ?? FONT_FAMILIES.Inter,
    fontWeight: FONT_WEIGHT_MAP[el.fontWeight] ?? 700,
    fontSize,
    lineHeight: 1.1,
    letterSpacing: el.fontWeight === "black" ? "-0.03em" : "-0.01em",
    textAlign: el.textAlign,
    textTransform: el.id.includes("hook") || el.id.includes("badge") ? "uppercase" : undefined,
    textShadow: needsShadow
      ? "0 2px 8px rgba(0,0,0,0.95), 0 4px 20px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,1)"
      : undefined,
    ...bg,
  };
}
