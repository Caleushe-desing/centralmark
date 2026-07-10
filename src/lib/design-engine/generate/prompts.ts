import { buildLayoutCatalogForPrompt } from "../composition/rules";
import { getArchetypeDefinition, type VisualArchetype } from "../archetypes";

function buildArchetypeSystemPrompt(archetype: VisualArchetype): string {
  const def = getArchetypeDefinition(archetype);

  const slotMapping: Record<VisualArchetype, string> = {
    drop: `badge (eyebrow hype corto), hook (titular MASIVO 4-8 palabras en mayúsculas), subtext (descuento brutal: "-50% DTO" o similar), cta (urgencia con ·)`,
    spotlight: `badge (etiqueta mínima ultraligera), hook (nombre producto 2-5 palabras, peso 200), subtext (una línea descriptiva ligera), cta (discreto con hairline)`,
    editorial: `badge (línea edición/masthead serif), hook (titular portada 3-4 palabras, puede mezclar roman + itálica), subtext (bajada poética), cta (invitación sobria "VER COLECCIÓN")`,
    promo: `subtext (SOLO el porcentaje: "50%" o "-50% OFF" — renderizado grande integrado), hook (nombre promo/colección), badge (contexto breve), cta (llamada comercial en bloque curado)`,
  };

  const imageStyle: Record<VisualArchetype, string> = {
    drop: "Dynamic urban street fashion, model in motion, wet pavement, neon glow, high energy, cinematic — space for massive typography breaking the grid. NO text in image.",
    spotlight: "Clean product hero shot, soft studio or minimal environment, abundant negative space center, subtle lighting, catalog premium. NO text in image.",
    editorial: "High-fashion editorial photography, Vogue aesthetic, soft natural light, muted luxury grading, negative space for serif typography. NO text in image.",
    promo: "Premium retail lifestyle, balanced composition with clean area for curated promo block, warm sophisticated tones. NO text in image.",
  };

  return `Eres director creativo de MarkMall Design Engine.
Arquetipo activo: "${def.label}" (${archetype}).

═══ REGLAS DE COMPOSICIÓN (OBLIGATORIAS) ═══
${def.compositionRules}

═══ MAPEO DE SLOTS ═══
${slotMapping[archetype]}

═══ COMPOSITION ENGINE ═══
OBLIGATORIO: compositionCategory "${archetype}"
Layout preferido: "${def.defaultLayoutId}"

═══ imagePrompt ═══
EN INGLÉS. Máx 2 oraciones (~350 chars).
${imageStyle[archetype]}

═══ caption ═══
Caption Instagram alineado al arquetipo ${def.label}: AIDA, emojis moderados, hashtags relevantes.

Responde SOLO el JSON del schema.`;
}

export function getDesignerSystemPrompt(archetype: VisualArchetype): string {
  return buildArchetypeSystemPrompt(archetype);
}

export function buildProAdUserPrompt(brief: string, archetype: VisualArchetype): string {
  const def = getArchetypeDefinition(archetype);

  return `Brief del cliente:
"${brief.trim()}"

ARQUETIPO SELECCIONADO: ${def.label} — ${def.marketingPurpose}

CATÁLOGO DE LAYOUTS (usa compositionCategory "${archetype}"):
${buildLayoutCatalogForPrompt()}

Genera: compositionCategory, compositionLayoutId, badge, hook, subtext, cta, imagePrompt (~350 chars), caption.`;
}

/** @deprecated */
export const PRO_AD_DESIGNER_SYSTEM = buildArchetypeSystemPrompt("editorial");
