import { buildLayoutCatalogForPrompt } from "../composition/rules";
import { getArchetypeDefinition, type VisualArchetype } from "../archetypes";
import type { BriefFacts } from "../brief-facts";
import { FORBIDDEN_ANGLICISMS } from "../design-output-validator";
import type { DesignValidationError } from "../design-output-validator";

const IMAGE_STYLE: Record<VisualArchetype, string> = {
  drop: "Dynamic urban street fashion, model in motion, wet pavement, neon glow, high energy, cinematic — abundant space for massive typography breaking the grid. NO text, letters or words rendered in the image.",
  spotlight:
    "Clean product hero shot, soft studio or minimal environment, abundant negative space center, subtle lighting, premium catalog aesthetic. NO text, letters or words rendered in the image.",
  editorial:
    "High-fashion editorial photography, Vogue aesthetic, soft natural light, muted luxury grading, negative space for serif typography overlay. NO text, letters or words rendered in the image.",
  promo:
    "Premium retail lifestyle, balanced composition with clean area for curated promo block, warm sophisticated tones. NO text, letters or words rendered in the image.",
};

const SLOT_MAPPING: Record<VisualArchetype, string> = {
  drop: `textOnImage.badge (etiqueta hype corta), textOnImage.hook (titular MASIVO con el productName, mayúsculas), textOnImage.subtext (descuento: "-50% DTO"), textOnImage.cta (urgencia del brief, con ·)`,
  spotlight: `textOnImage.badge (etiqueta mínima), textOnImage.hook (productName, 2-5 palabras), textOnImage.subtext (gancho comercial en una línea), textOnImage.cta (discreto)`,
  editorial: `textOnImage.badge (línea edición/masthead), textOnImage.hook (titular portada con productName), textOnImage.subtext (bajada poética del gancho), textOnImage.cta (invitación sobria)`,
  promo: `textOnImage.subtext (SOLO el porcentaje: "50%" o "-50% DTO"), textOnImage.hook (productName o nombre promo), textOnImage.badge (contexto breve), textOnImage.cta (llamada comercial)`,
};

const FORBIDDEN_SAMPLE = FORBIDDEN_ANGLICISMS.slice(0, 16).join(", ");

function buildV2SystemPrompt(archetype: VisualArchetype): string {
  const def = getArchetypeDefinition(archetype);

  return `Eres director creativo senior del MarkMall Design Engine (Diseño V2).
Arquetipo activo: "${def.label}" (${archetype}).

═══ IDIOMA Y ZONAS (BILINGÜE ESTRICTO) ═══
1. visualConcept.imagePrompt → INGLÉS descriptivo (solo escena visual, sin texto incrustado en la foto).
2. textOnImage (productName, badge, hook, subtext, cta) → ESPAÑOL NATIVO comercial premium (Chile/LATAM).
3. textExternal.caption → ESPAÑOL NATIVO para Instagram/Facebook.

PROHIBIDO en textOnImage y textExternal: inglés y anglicismos (${FORBIDDEN_SAMPLE}, etc.).
Usa: DTO, DESCUENTO, COMPRA, OFERTA, EXCLUSIVO, STOCK LIMITADO.

═══ BRIEFFACTS INMUTABLES ═══
Los datos del brief son ANCLAS SEMÁNTICAS. NO inventes producto, descuento ni urgencia distintos.
- productName debe figurar en textOnImage.productName y en textOnImage.hook o badge.
- commercialHook debe reflejarse en textOnImage.subtext o hook.
- urgencyCta debe estar en textOnImage.cta (puede abreviarse sin perder sentido).
- Si hay discountPercent, debe aparecer en textOnImage.subtext (drop/promo).

═══ REGLAS DE COMPOSICIÓN ═══
${def.compositionRules}

═══ MAPEO DE SLOTS (textOnImage) ═══
${SLOT_MAPPING[archetype]}

═══ COMPOSITION ═══
composition.category DEBE ser "${archetype}".
composition.layoutId preferido: "${def.defaultLayoutId}".

═══ visualConcept.imagePrompt ═══
INGLÉS. Máximo 2 oraciones (~350 caracteres).
${IMAGE_STYLE[archetype]}

═══ textExternal.caption ═══
Español, AIDA, 2-4 líneas, emojis moderados (1-3), SIN hashtags.
Complementa la imagen; no repitas literalmente todos los slots.
Mantén coherencia con productName, commercialHook y urgencyCta.

Responde ÚNICAMENTE el JSON del schema DesignDocumentV2 (strict).`;
}

export function getDesignerSystemPrompt(archetype: VisualArchetype): string {
  return buildV2SystemPrompt(archetype);
}

export function getArchetypeImageStylePrompt(
  archetype: VisualArchetype,
  productName: string
): string {
  const product = productName.trim().slice(0, 80) || "product";
  return `${IMAGE_STYLE[archetype]} Product focus: ${product}.`;
}

function formatBriefFactsBlock(facts: BriefFacts): string {
  return `DATOS INMUTABLES DEL BRIEF (no modificar):
- productName: "${facts.productName}"
- commercialHook: "${facts.commercialHook}"
- urgencyCta: "${facts.urgencyCta}"
- discountPercent: ${facts.discountPercent ?? "null"}`;
}

export function buildProAdUserPrompt(
  brief: string,
  archetype: VisualArchetype,
  facts: BriefFacts
): string {
  const def = getArchetypeDefinition(archetype);

  return `Brief original del cliente:
"${brief.trim()}"

${formatBriefFactsBlock(facts)}

ARQUETIPO SELECCIONADO: ${def.label} — ${def.marketingPurpose}

CATÁLOGO DE LAYOUTS (composition.category = "${archetype}"):
${buildLayoutCatalogForPrompt()}

Genera el JSON DesignDocumentV2 completo:
- composition (category, layoutId)
- visualConcept (imagePrompt en inglés)
- textOnImage (productName, badge, hook, subtext, cta en español)
- textExternal (caption en español)`;
}

export function buildDesignCorrectionPrompt(
  brief: string,
  archetype: VisualArchetype,
  facts: BriefFacts,
  errors: DesignValidationError[]
): string {
  const errorList = errors
    .map((e, i) => `${i + 1}. [${e.code}] ${e.field}: ${e.message}`)
    .join("\n");

  return `CORRECCIÓN OBLIGATORIA — la generación anterior falló validación.

${formatBriefFactsBlock(facts)}

Brief original:
"${brief.trim()}"

ERRORES DETECTADOS:
${errorList}

INSTRUCCIONES:
- Corrige SOLO los campos necesarios para resolver los errores.
- Mantén composition.category = "${archetype}".
- NO cambies productName, commercialHook ni urgencyCta del brief (solo su expresión en slots).
- visualConcept.imagePrompt sigue en INGLÉS; textOnImage y textExternal en ESPAÑOL.

Regenera el JSON DesignDocumentV2 completo y válido.`;
}

/** @deprecated Legacy V1 — usar getDesignerSystemPrompt */
export const PRO_AD_DESIGNER_SYSTEM = buildV2SystemPrompt("editorial");
