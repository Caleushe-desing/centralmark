import { getArchetypeDefinition, type VisualArchetype } from "../archetypes";
import type { BriefFacts } from "../brief-facts";
import type { DesignDocumentV2 } from "../schemas";
import { getArchetypeImageStylePrompt } from "./prompts";

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(1, max - 1)).trim()}…`;
}

function formatDiscountSubtext(facts: BriefFacts): string {
  if (facts.discountPercent != null) {
    return `-${facts.discountPercent}% DTO`;
  }
  return truncate(facts.commercialHook, 40);
}

function formatPromoSubtext(facts: BriefFacts): string {
  if (facts.discountPercent != null) {
    return `${facts.discountPercent}%`;
  }
  const match = facts.commercialHook.match(/(\d{1,2})\s*%/);
  if (match) return `${match[1]}%`;
  return truncate(facts.commercialHook, 12);
}

function buildFallbackCaption(facts: BriefFacts): string {
  const discountLine =
    facts.discountPercent != null
      ? `Aprovecha el ${facts.discountPercent}% de descuento.`
      : null;

  const parts = [
    `🔥 ${facts.productName}`,
    facts.commercialHook,
    discountLine,
    facts.urgencyCta,
  ].filter(Boolean);

  const caption = parts.join("\n\n");
  return caption.length >= 20 ? caption : `${facts.productName}. ${facts.urgencyCta}. Oferta disponible en tienda.`;
}

function buildTextOnImage(
  facts: BriefFacts,
  archetype: VisualArchetype
): DesignDocumentV2["textOnImage"] {
  const productName = truncate(facts.productName, 80);
  const cta = truncate(facts.urgencyCta, 48);

  switch (archetype) {
    case "drop":
      return {
        productName,
        badge: truncate(facts.commercialHook, 32),
        hook: truncate(facts.productName.toUpperCase(), 48),
        subtext: formatDiscountSubtext(facts),
        cta,
      };
    case "spotlight":
      return {
        productName,
        badge: "COLECCIÓN",
        hook: truncate(facts.productName, 48),
        subtext: truncate(facts.commercialHook, 120),
        cta,
      };
    case "editorial":
      return {
        productName,
        badge: "EDICIÓN",
        hook: truncate(facts.productName, 48),
        subtext: truncate(facts.commercialHook, 120),
        cta: truncate(facts.urgencyCta, 48) || "VER COLECCIÓN",
      };
    case "promo":
      return {
        productName,
        badge: truncate(facts.commercialHook, 32),
        hook: truncate(facts.productName, 48),
        subtext: formatPromoSubtext(facts),
        cta,
      };
  }
}

/**
 * Fallback determinista: ensambla DesignDocumentV2 en español puro desde BriefFacts.
 * Garantiza cero caídas si la IA falla validación tras el reintento.
 */
export function buildDeterministicDesignV2(
  facts: BriefFacts,
  archetype: VisualArchetype
): DesignDocumentV2 {
  const def = getArchetypeDefinition(archetype);

  return {
    composition: {
      category: archetype,
      layoutId: def.defaultLayoutId,
    },
    visualConcept: {
      imagePrompt: getArchetypeImageStylePrompt(archetype, facts.productName),
    },
    textOnImage: buildTextOnImage(facts, archetype),
    textExternal: {
      caption: buildFallbackCaption(facts),
    },
  };
}
