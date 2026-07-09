import { normalizeLayer, type TextLayer } from "@/lib/image/text-layers";

const CANVAS = 1080;

export type LayerRole = "hook" | "headline" | "benefit" | "cta" | "badge";

export interface LayoutSlot {
  role: LayerRole;
  y: number;
  maxChars: number;
  maxFontSize: number;
  minFontSize: number;
}

const DEFAULT_SLOTS: LayoutSlot[] = [
  { role: "hook", y: 16, maxChars: 34, maxFontSize: 44, minFontSize: 24 },
  { role: "headline", y: 34, maxChars: 28, maxFontSize: 72, minFontSize: 40 },
  { role: "benefit", y: 54, maxChars: 42, maxFontSize: 30, minFontSize: 20 },
  { role: "cta", y: 88, maxChars: 20, maxFontSize: 28, minFontSize: 22 },
];

const LOWER_THIRD_SLOTS: LayoutSlot[] = [
  { role: "hook", y: 64, maxChars: 30, maxFontSize: 32, minFontSize: 22 },
  { role: "headline", y: 74, maxChars: 26, maxFontSize: 56, minFontSize: 36 },
  { role: "benefit", y: 82, maxChars: 36, maxFontSize: 24, minFontSize: 18 },
  { role: "cta", y: 92, maxChars: 18, maxFontSize: 26, minFontSize: 20 },
];

const LEFT_EDITORIAL_SLOTS: LayoutSlot[] = [
  { role: "headline", y: 14, maxChars: 28, maxFontSize: 52, minFontSize: 36 },
  { role: "benefit", y: 28, maxChars: 40, maxFontSize: 26, minFontSize: 20 },
  { role: "cta", y: 90, maxChars: 20, maxFontSize: 26, minFontSize: 20 },
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function truncate(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.45 ? cut.slice(0, lastSpace) : cut).trim();
}

/** Altura visual aproximada de una capa en % del canvas */
export function estimateLayerHeightPercent(layer: TextLayer): number {
  const lines = Math.max(1, layer.text.split("\n").length);
  const lineHeight = layer.fontSize * 1.2;
  let heightPx = lineHeight * lines;

  if (layer.variant === "badge") {
    heightPx = layer.fontSize * 2.2;
  } else if (layer.variant === "pill" || layer.backgroundColor) {
    heightPx += layer.fontSize * 0.55;
  }

  if (layer.strokeWidth > 0) heightPx += layer.strokeWidth * 2;
  return (heightPx / CANVAS) * 100;
}

function layerTopY(layer: TextLayer): number {
  return layer.y - estimateLayerHeightPercent(layer) / 2;
}

function layerBottomY(layer: TextLayer): number {
  return layer.y + estimateLayerHeightPercent(layer) / 2;
}

function detectRole(layer: TextLayer, index: number, total: number): LayerRole {
  if (layer.variant === "badge") return "badge";
  if (index === total - 1 || layer.variant === "pill" || layer.y >= 78) return "cta";
  if (index === 0) return "hook";
  if (index === 1 || layer.fontSize >= 44) return "headline";
  return "benefit";
}

export function slotsForComposition(compositionId?: string): LayoutSlot[] {
  if (
    compositionId === "lower_third" ||
    compositionId === "corner_anchor" ||
    compositionId === "upper_third"
  ) {
    return LOWER_THIRD_SLOTS;
  }
  if (compositionId === "f_left" || compositionId === "luxury_minimal" || compositionId === "split_asymmetric") {
    return LEFT_EDITORIAL_SLOTS;
  }
  return DEFAULT_SLOTS;
}

/** Reduce capas sobrantes y acorta textos largos */
export function condenseLayers(layers: TextLayer[], maxLayers = 4): TextLayer[] {
  if (layers.length <= maxLayers) {
    return layers.map((l) =>
      normalizeLayer({ ...l, text: truncate(l.text.replace(/\n/g, " "), 42) })
    );
  }

  const sorted = [...layers].sort((a, b) => a.y - b.y);
  const cta =
    sorted.find((l) => l.variant === "pill" || l.y >= 78) ?? sorted[sorted.length - 1];
  const badge = sorted.find((l) => l.variant === "badge");
  const body = sorted.filter((l) => l.id !== cta.id && l.id !== badge?.id);

  const hook = body[0];
  const headline = body[1];
  const benefitText = body.slice(2).map((l) => l.text).join(" ");
  const benefitLayer = body[2] ?? body[1] ?? body[0];

  const result: TextLayer[] = [];
  if (badge) result.push(badge);
  if (hook) {
    result.push(normalizeLayer({ ...hook, text: truncate(hook.text, 34) }));
  }
  if (headline && headline.id !== hook?.id) {
    result.push(
      normalizeLayer({
        ...headline,
        text: truncate(headline.text, 28),
        fontSize: Math.min(headline.fontSize, 68),
      })
    );
  }
  if (benefitLayer) {
    result.push(
      normalizeLayer({
        ...benefitLayer,
        text: truncate(benefitText || benefitLayer.text, 42),
        fontSize: Math.min(benefitLayer.fontSize, 30),
      })
    );
  }
  result.push(
    normalizeLayer({
      ...cta,
      variant: "pill",
      y: 88,
      text: truncate(cta.text.replace(/[.!?]+$/, ""), 18),
      fontSize: clamp(cta.fontSize, 20, 28),
    })
  );

  if (badge && result.length > maxLayers) {
    return [badge, hook, result[result.length - 2], cta].filter(Boolean).slice(0, maxLayers) as TextLayer[];
  }

  return result.slice(0, maxLayers);
}

function shortenForRole(text: string, role: LayerRole, maxChars: number): string {
  let t = text.trim().replace(/\s+/g, " ");
  // Una sola frase corta por capa
  const sentence = t.split(/(?<=[.!?])\s+/)[0] ?? t;
  t = truncate(sentence, maxChars);
  if (role === "cta") {
    t = truncate(t.replace(/[.!?]+$/, ""), 18);
  }
  return t;
}

/** Aplica posiciones seguras según composición y roles */
export function applyLayoutSlots(
  layers: TextLayer[],
  compositionId?: string
): TextLayer[] {
  const condensed = condenseLayers(layers, 4);
  const slots = slotsForComposition(compositionId);
  const alignLeft = compositionId === "f_left" || compositionId === "luxury_minimal";

  return condensed.map((layer, index) => {
    if (layer.variant === "badge") {
      return normalizeLayer({
        ...layer,
        x: clamp(layer.x, 72, 88),
        y: clamp(layer.y, 12, 22),
      });
    }

    const role = detectRole(layer, index, condensed.length);
    const slot =
      slots.find((s) => s.role === role) ??
      slots[Math.min(index, slots.length - 1)];

    const text = shortenForRole(layer.text, role, slot.maxChars);
    const fontSize = clamp(layer.fontSize, slot.minFontSize, slot.maxFontSize);

    return normalizeLayer({
      ...layer,
      text,
      y: role === "badge" ? layer.y : slot.y,
      x: alignLeft && role !== "badge" ? 14 : layer.x,
      align: alignLeft && role !== "badge" ? "left" : layer.align,
      fontSize,
      variant: role === "cta" ? "pill" : layer.variant === "badge" ? "badge" : layer.variant,
      backgroundColor:
        role === "cta"
          ? layer.backgroundColor ?? "#ffe600"
          : role === "benefit" && !layer.backgroundColor
            ? "rgba(5,5,5,0.65)"
            : layer.backgroundColor,
    });
  });
}

/** Separa capas usando altura real, no solo coordenada Y */
export function separateOverlappingLayers(layers: TextLayer[]): TextLayer[] {
  if (layers.length <= 1) return layers;

  const sorted = [...layers].sort((a, b) => a.y - b.y);
  const gap = 2.5;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const minCenterY = layerBottomY(prev) + gap + estimateLayerHeightPercent(curr) / 2;
    if (curr.y < minCenterY) {
      curr.y = clamp(minCenterY, 8, 92);
    }
  }

  const last = sorted[sorted.length - 1];
  if (layerBottomY(last) > 93) {
    return redistributeLayers(sorted);
  }

  return sorted;
}

function redistributeLayers(layers: TextLayer[]): TextLayer[] {
  const sorted = [...layers].sort((a, b) => a.y - b.y);
  const cta = sorted.find((l) => l.variant === "pill") ?? sorted[sorted.length - 1];
  const others = sorted.filter((l) => l.id !== cta.id);
  const zoneTop = 14;
  const zoneBottom = 78;
  const count = others.length;

  others.forEach((layer, i) => {
    const height = estimateLayerHeightPercent(layer);
    const available = zoneBottom - zoneTop;
    const step = count > 1 ? available / count : 0;
    layer.y = clamp(zoneTop + step * i + height / 2, zoneTop + height / 2, zoneBottom - height / 2);
  });

  cta.y = 88;
  return separateOverlappingLayers([...others, cta]);
}

export function finalizeLayerLayout(
  layers: TextLayer[],
  compositionId?: string
): TextLayer[] {
  const laid = applyLayoutSlots(layers, compositionId);
  return separateOverlappingLayers(laid);
}
