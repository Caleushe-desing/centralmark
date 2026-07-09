import { clampImageConcept } from "./clamp-concept";
import { normalizeLayoutElementRaw } from "./normalize-layout";

/** Normaliza color de texto a HEX de 6 dígitos. */
export function normalizeTextColor(value: string): string {
  const v = value.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v.toUpperCase();

  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    const [, r, g, b] = v.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/i)!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  // 8-digit hex → tomar solo RGB
  if (/^#[0-9A-Fa-f]{8}$/.test(v)) {
    return v.slice(0, 7).toUpperCase();
  }

  return "#FFFFFF";
}

/** Acepta HEX 6/8 dígitos, rgba(), o transparent. */
export function normalizeBackgroundColor(value: string): string {
  const v = value.trim();

  if (!v || /^transparent$/i.test(v) || /^#transparent$/i.test(v)) {
    return "transparent";
  }

  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v.toUpperCase();
  if (/^#[0-9A-Fa-f]{8}$/.test(v)) return v.toUpperCase();

  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    const [, r, g, b] = v.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/i)!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  if (/^rgba?\(/i.test(v)) return v;

  return "transparent";
}

export function isValidBackgroundColor(value: string): boolean {
  return (
    value === "transparent" ||
    /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value) ||
    /^rgba?\(/i.test(value)
  );
}

export function normalizeRawProAdCopy(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;

  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.layoutElements)) return raw;

  return {
    ...obj,
    imagePrompt:
      typeof obj.imagePrompt === "string" ? clampImageConcept(obj.imagePrompt, 500) : obj.imagePrompt,
    layoutElements: obj.layoutElements.map((item) => {
      const withZone = normalizeLayoutElementRaw(item);
      if (!withZone || typeof withZone !== "object") return withZone;
      const el = withZone as Record<string, unknown>;

      return {
        ...el,
        color: typeof el.color === "string" ? normalizeTextColor(el.color) : el.color,
        backgroundColor:
          typeof el.backgroundColor === "string"
            ? normalizeBackgroundColor(el.backgroundColor)
            : el.backgroundColor,
      };
    }),
  };
}
