import {
  ARCHETYPE_DEFINITIONS,
  getArchetypeDefinition,
  type VisualArchetype,
} from "@/lib/design-engine/archetypes";
import { getLayoutById } from "@/lib/design-engine/composition/rules";
import { applyStoreBrandToLayout } from "@/lib/design-engine/store-branding";
import { shapeCopyForLayout } from "@/lib/design-engine/copy/shape-slot-copy";
import type { DesignDocument } from "@/lib/design-engine/schemas";
import type { DesignPreviewState } from "@/components/design-engine/DesignEnginePreview";
import { getStoreRubroDefinition } from "@/lib/store/rubros";

export type DemoBrand = {
  name: string;
  mallName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | null;
  rubro?: string | null;
  previewImageUrl?: string | null;
};

function pickArchetype(brief: string): VisualArchetype {
  const t = brief.toLowerCase();
  if (/editorial|histor|story|colecci[oó]n|lifestyle/.test(t)) return "editorial";
  if (/spotlight|h[eé]roe|producto|detalle|premium/.test(t)) return "spotlight";
  if (/promo|descuento|%|liquidaci|oferta|outlet|2x1/.test(t)) return "promo";
  if (/drop|lanzamiento|nueva|street|hype/.test(t)) return "drop";
  return "promo";
}

function extractDiscount(brief: string): string | null {
  const m = brief.match(/(\d{1,2})\s*%/);
  return m ? `${m[1]}%` : null;
}

function extractHook(brief: string, archetype: VisualArchetype): string {
  const first = brief
    .split(/[.!\n]/)
    .map((s) => s.trim())
    .filter(Boolean)[0];
  if (!first) return getArchetypeDefinition(archetype).sampleCopy.hook;
  const words = first.split(/\s+/).slice(0, getArchetypeDefinition(archetype).maxHookWords);
  return words.join(" ").toUpperCase();
}

function extractProductName(brief: string): string {
  const cleaned = brief.trim().replace(/\s+/g, " ");
  const withoutPct = cleaned.replace(/\d{1,2}\s*%/g, "").trim();
  const chunk = withoutPct.split(/[.!,]/)[0]?.trim() ?? withoutPct;
  return chunk.slice(0, 48) || "Publicación demo";
}

/** Genera el mismo tipo de pieza que el motor real, sin llamar a OpenAI. */
export function buildDemoGeneration(input: {
  brief: string;
  imageSource: "ai" | "upload";
  userImageUrl?: string;
  brand: DemoBrand;
}): DesignPreviewState {
  const archetype = pickArchetype(input.brief);
  const def = getArchetypeDefinition(archetype);
  const sample = def.sampleCopy;
  const discount = extractDiscount(input.brief);
  const hook = extractHook(input.brief, archetype);
  const productName = extractProductName(input.brief);

  const design: DesignDocument = {
    imagePrompt: `Demo mock scene for: ${input.brief.slice(0, 120)}`,
    caption: [
      discount ? `🔥 ${discount} DTO` : "✨ Llegó lo nuevo",
      productName,
      `📍 ${input.brand.name} — ${input.brand.mallName}`,
      "",
      "Ven a conocerlo este fin de semana. Stock limitado.",
    ].join("\n"),
    compositionCategory: archetype,
    compositionLayoutId: def.defaultLayoutId,
    hook,
    badge: discount ? `${discount} DTO` : sample.badge,
    subtext: discount ? `${discount} DTO` : sample.subtext,
    cta: sample.cta,
  };

  const baseLayout = getLayoutById(design.compositionLayoutId) ?? getLayoutById(def.defaultLayoutId)!;
  const layout = applyStoreBrandToLayout(baseLayout, {
    primaryColor: input.brand.primaryColor,
    secondaryColor: input.brand.secondaryColor,
  });

  const rubroImg =
    input.brand.previewImageUrl ||
    getStoreRubroDefinition(input.brand.rubro ?? "fashion").defaultSampleImageUrl;

  const imageUrl =
    input.imageSource === "upload" && input.userImageUrl
      ? input.userImageUrl
      : def.sampleImageUrl || rubroImg;

  // touch shapeCopy to mirror production path
  shapeCopyForLayout(
    { hook: design.hook, badge: design.badge, subtext: design.subtext, cta: design.cta },
    layout
  );

  return {
    design,
    layout,
    imageUrl,
    styleName: def.label,
    costoEstimado: 0,
  };
}

export const DEMO_ARCHETYPE_LABELS = ARCHETYPE_DEFINITIONS.map((d) => d.label);
