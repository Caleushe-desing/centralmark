import type { LayoutElement, LayoutZone } from "./schemas";
import {
  defaultAlignForId,
  defaultZoneForId,
  normalizeLayoutZone,
  normalizeTextAlign,
} from "./group-layout-zones";

type LegacyPosition = {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
};

function inferZoneFromLegacyPosition(position: LegacyPosition | undefined, id: string): LayoutZone {
  if (!position) return defaultZoneForId(id);

  const bottom = position.bottom?.trim();
  const top = position.top?.trim();

  if (bottom && bottom !== "auto") return "bottom";
  if (top && top !== "auto") {
    const topNum = parseFloat(top);
    if (!Number.isNaN(topNum) && topNum >= 30) return "center";
    return "top";
  }

  return defaultZoneForId(id);
}

function inferAlignFromLegacyPosition(position: LegacyPosition | undefined, id: string) {
  if (!position) return defaultAlignForId(id);

  const right = position.right?.trim();
  const left = position.left?.trim();

  if (right && right !== "auto" && (!left || left === "auto")) return "right" as const;
  if (left && left !== "auto" && (!right || right === "auto")) return "left" as const;

  return defaultAlignForId(id);
}

export function normalizeLayoutElementRaw(item: unknown): unknown {
  if (!item || typeof item !== "object") return item;

  const el = item as Record<string, unknown>;
  const id = typeof el.id === "string" ? el.id : "element";
  const legacyPosition = el.position as LegacyPosition | undefined;

  const layoutZone =
    "layoutZone" in el
      ? normalizeLayoutZone(el.layoutZone, id)
      : inferZoneFromLegacyPosition(legacyPosition, id);

  const textAlign =
    "textAlign" in el
      ? normalizeTextAlign(el.textAlign, id)
      : inferAlignFromLegacyPosition(legacyPosition, id);

  const { position: _removed, ...rest } = el;

  return {
    ...rest,
    layoutZone,
    textAlign,
  };
}

export function sanitizeLayoutElementFields(el: LayoutElement): LayoutElement {
  return {
    ...el,
    id: el.id.trim(),
    text: el.text.trim(),
    layoutZone: normalizeLayoutZone(el.layoutZone, el.id),
    textAlign: normalizeTextAlign(el.textAlign, el.id),
  };
}
