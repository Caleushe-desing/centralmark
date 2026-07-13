import type { BriefFacts } from "./brief-facts";
import type { DesignDocumentV2 } from "./schemas";
import type { VisualArchetype } from "./archetypes";

export type DesignValidationErrorCode =
  | "SPANISH_REQUIRED"
  | "ANGLICISM_FORBIDDEN"
  | "PRODUCT_MISSING"
  | "COMMERCIAL_HOOK_MISSING"
  | "URGENCY_CTA_MISSING"
  | "DISCOUNT_MISSING";

export interface DesignValidationError {
  code: DesignValidationErrorCode;
  field: string;
  message: string;
}

export interface DesignValidationResult {
  valid: boolean;
  errors: DesignValidationError[];
}

/** Anglicismos de marketing prohibidos en texto visible al usuario */
export const FORBIDDEN_ANGLICISMS = [
  "OFF",
  "SALE",
  "SHOP",
  "NEW",
  "DROP",
  "LIMITED",
  "EXCLUSIVE",
  "NOW",
  "BUY",
  "GET",
  "FREE",
  "DEAL",
  "FLASH",
  "HOT",
  "TRENDING",
  "OUTLET",
  "CYBER",
  "WEEKEND",
  "HAPPY HOUR",
  "BRUNCH",
  "INSIGHT",
  "STORY",
  "GLOW",
  "SKINCARE",
  "FLAGSHIP",
  "STREET",
  "HEAT",
  "FIT",
  "TECH",
  "GADGET",
  "SNEAKER",
  "LIVING",
  "ÉDITION",
  "EDITION",
  "AIR MAX",
  "RUNNER",
  "ULTRABOOK",
] as const;

/** Palabras inglesas comunes fuera del léxico comercial (heurística ligera) */
const ENGLISH_WORD_PATTERN =
  /\b(the|and|for|with|your|our|best|only|today|this|weekend|limited|exclusive|shop|sale|new|free|buy|get|deal|now)\b/i;

function normalizeForMatch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function containsNormalized(haystack: string, needle: string): boolean {
  const h = normalizeForMatch(haystack);
  const n = normalizeForMatch(needle);
  if (!n || n.length < 3) return false;
  return h.includes(n);
}

function findForbiddenAnglicism(text: string): string | null {
  const upper = text.toUpperCase();
  for (const term of FORBIDDEN_ANGLICISMS) {
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(upper)) return term;
  }
  return null;
}

export interface AssertSpanishOnlyOptions {
  /** Campos que permiten inglés (p. ej. imagePrompt interno) */
  allowEnglish?: boolean;
}

/**
 * Verifica que el texto visible esté en español y sin anglicismos de marketing.
 */
export function assertSpanishOnly(
  text: string,
  field: string,
  options: AssertSpanishOnlyOptions = {}
): DesignValidationError[] {
  const errors: DesignValidationError[] = [];
  const trimmed = text.trim();
  if (!trimmed) return errors;

  const anglicism = findForbiddenAnglicism(trimmed);
  if (anglicism) {
    errors.push({
      code: "ANGLICISM_FORBIDDEN",
      field,
      message: `Anglicismo prohibido "${anglicism}" en ${field}. Usa español comercial premium.`,
    });
  }

  if (!options.allowEnglish && ENGLISH_WORD_PATTERN.test(trimmed)) {
    errors.push({
      code: "SPANISH_REQUIRED",
      field,
      message: `Se detectó inglés en ${field}. Todo el copy visible debe estar en español.`,
    });
  }

  return errors;
}

function productPresentInSlots(facts: BriefFacts, design: DesignDocumentV2): boolean {
  const slots = [
    design.textOnImage.productName,
    design.textOnImage.hook,
    design.textOnImage.badge,
  ];
  return slots.some((slot) => containsNormalized(slot, facts.productName));
}

function commercialHookPresentInSlots(facts: BriefFacts, design: DesignDocumentV2): boolean {
  const slots = [
    design.textOnImage.hook,
    design.textOnImage.subtext,
    design.textOnImage.badge,
  ];
  return slots.some((slot) => containsNormalized(slot, facts.commercialHook));
}

function urgencyPresentInCta(facts: BriefFacts, design: DesignDocumentV2): boolean {
  return containsNormalized(design.textOnImage.cta, facts.urgencyCta);
}

function discountPresentIfRequired(
  facts: BriefFacts,
  design: DesignDocumentV2,
  archetype: VisualArchetype
): boolean {
  if (facts.discountPercent == null) return true;
  const discountToken = `${facts.discountPercent}`;
  const slots = [design.textOnImage.subtext, design.textOnImage.hook, design.textOnImage.badge];
  const hasPercent = slots.some((slot) => slot.includes("%") && slot.includes(discountToken));
  if (hasPercent) return true;
  if (archetype === "promo" || archetype === "drop") {
    return slots.some((slot) => slot.includes(discountToken));
  }
  return true;
}

export interface ValidateDesignOutputOptions {
  archetype: VisualArchetype;
  facts: BriefFacts;
}

/**
 * Validador post-IA: idioma, anglicismos y presencia de BriefFacts en slots visibles.
 */
export function validateDesignOutput(
  design: DesignDocumentV2,
  options: ValidateDesignOutputOptions
): DesignValidationResult {
  const { facts, archetype } = options;
  const errors: DesignValidationError[] = [];

  const visibleFields: Array<{ key: string; value: string }> = [
    { key: "textOnImage.productName", value: design.textOnImage.productName },
    { key: "textOnImage.badge", value: design.textOnImage.badge },
    { key: "textOnImage.hook", value: design.textOnImage.hook },
    { key: "textOnImage.subtext", value: design.textOnImage.subtext },
    { key: "textOnImage.cta", value: design.textOnImage.cta },
    { key: "textExternal.caption", value: design.textExternal.caption },
  ];

  for (const { key, value } of visibleFields) {
    errors.push(...assertSpanishOnly(value, key));
  }

  if (!productPresentInSlots(facts, design)) {
    errors.push({
      code: "PRODUCT_MISSING",
      field: "textOnImage",
      message: `El producto "${facts.productName}" debe aparecer en hook, badge o productName.`,
    });
  }

  if (!commercialHookPresentInSlots(facts, design)) {
    errors.push({
      code: "COMMERCIAL_HOOK_MISSING",
      field: "textOnImage",
      message: `El gancho comercial "${facts.commercialHook}" debe reflejarse en los slots de imagen.`,
    });
  }

  if (!urgencyPresentInCta(facts, design)) {
    errors.push({
      code: "URGENCY_CTA_MISSING",
      field: "textOnImage.cta",
      message: `La urgencia "${facts.urgencyCta}" debe estar presente en el CTA de imagen.`,
    });
  }

  if (!discountPresentIfRequired(facts, design, archetype)) {
    errors.push({
      code: "DISCOUNT_MISSING",
      field: "textOnImage.subtext",
      message: `El descuento ${facts.discountPercent}% del brief debe figurar en subtext u otro slot de oferta.`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
