import type { AdCopySlots, CompositionLayout } from "../composition/rules";

const DISCOUNT_PATTERN =
  /(?:^|\s)(-?\d{1,3}\s*%|\d{1,3}\s*%\s*D?T?O?|2\s*x\s*1|3\s*x\s*2|-\d{1,3}\s*D?T?O?)/i;

function trimWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ");
}

function shorten(text: string, maxChars: number): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, maxChars - 1).trimEnd()}…`;
}

/** Extrae la mejor cifra de descuento de uno o más textos. */
export function extractDiscountText(...sources: string[]): string | null {
  for (const source of sources) {
    const match = source.match(DISCOUNT_PATTERN);
    if (!match) continue;
    const raw = match[1]!.trim().replace(/\s+/g, "");
    if (/^2x1$/i.test(raw)) return "2x1";
    if (/^3x2$/i.test(raw)) return "3x2";
    const pct = raw.match(/-?(\d{1,3})/);
    if (pct) {
      const n = pct[1];
      if (/-?\d+%/i.test(raw) && /dto/i.test(raw)) return `${n}% DTO`;
      if (/-?\d+%/.test(raw)) return `${n}%`;
      if (/dto/i.test(raw)) return `-${n}% DTO`;
    }
  }
  return null;
}

function stripDiscountFromLabel(text: string): string {
  return text
    .replace(DISCOUNT_PATTERN, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isDiscountLike(text: string): boolean {
  return DISCOUNT_PATTERN.test(text);
}

/** Ajusta copy a las restricciones del layout drop (evita frases largas en slots de %). */
export function shapeDropGridCopy(copy: AdCopySlots): AdCopySlots {
  let badge = copy.badge.trim();
  let hook = trimWords(copy.hook, 5);
  let subtext = copy.subtext.trim();
  let cta = copy.cta.trim();

  const discount =
    extractDiscountText(subtext, badge, hook) ??
    extractDiscountText(copy.hook) ??
    null;

  if (discount) {
    subtext = discount;
    if (isDiscountLike(badge)) {
      const label = stripDiscountFromLabel(badge);
      badge = label.length >= 3 ? shorten(label, 18) : "OFERTA";
    }
  } else if (subtext.length > 12) {
    // Frase larga en subtext → va al CTA; subtext queda vacío o genérico
    if (!cta || cta.length < subtext.length) {
      cta = subtext;
    }
    subtext = extractDiscountText(badge) ?? "";
  }

  if (!subtext && discount) subtext = discount;

  badge = shorten(badge || "OFERTA", 18);
  hook = shorten(hook, 42);
  subtext = shorten(subtext, 10);
  cta = shorten(cta, 24);

  return { badge, hook, subtext, cta };
}

export function shapeCopyForLayout(
  copy: AdCopySlots,
  layout: CompositionLayout
): AdCopySlots {
  if (layout.id === "drop-grid-break") {
    return shapeDropGridCopy(copy);
  }

  if (layout.id === "drop-edge-cut") {
    const shaped = shapeDropGridCopy(copy);
    return {
      ...shaped,
      hook: shorten(trimWords(shaped.hook, 4), 36),
      subtext: shorten(shaped.subtext, 8),
    };
  }

  if (layout.archetype === "promo") {
    return {
      ...copy,
      subtext: shorten(copy.subtext, 10),
      cta: shorten(copy.cta, 22),
    };
  }

  return {
    ...copy,
    hook: shorten(trimWords(copy.hook, layout.archetype === "editorial" ? 4 : 6), 48),
    badge: shorten(copy.badge, 20),
    subtext: shorten(copy.subtext, 80),
    cta: shorten(copy.cta, 28),
  };
}

export function subtextUsesMegaDiscount(layout: CompositionLayout, text: string): boolean {
  if (layout.id !== "drop-grid-break" && layout.id !== "drop-edge-cut") {
    return layout.slots.find((s) => s.slotKey === "subtext")?.accent === "mega-discount";
  }
  return isDiscountLike(text) || extractDiscountText(text) !== null;
}
