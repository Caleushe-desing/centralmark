import type { LayoutElement, LayoutZone, TextAlign } from "./schemas";

const ZONES: LayoutZone[] = ["top", "center", "bottom"];

export function groupElementsByZone(elements: LayoutElement[]): Record<LayoutZone, LayoutElement[]> {
  const grouped: Record<LayoutZone, LayoutElement[]> = {
    top: [],
    center: [],
    bottom: [],
  };

  for (const element of elements) {
    const zone = ZONES.includes(element.layoutZone) ? element.layoutZone : "top";
    grouped[zone].push(element);
  }

  return grouped;
}

export function defaultZoneForId(id: string): LayoutZone {
  if (/badge|hook|headline|title/i.test(id)) return "top";
  if (/cta|subtext|subtitle|footer|benefit/i.test(id)) return "bottom";
  return "top";
}

export function defaultAlignForId(id: string): TextAlign {
  if (/badge/i.test(id)) return "right";
  if (/cta/i.test(id)) return "center";
  return "left";
}

export function normalizeLayoutZone(value: unknown, id: string): LayoutZone {
  if (value === "top" || value === "center" || value === "bottom") return value;
  return defaultZoneForId(id);
}

export function normalizeTextAlign(value: unknown, id: string): TextAlign {
  if (value === "left" || value === "center" || value === "right") return value;
  return defaultAlignForId(id);
}
