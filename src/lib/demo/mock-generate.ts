import {
  ARCHETYPE_DEFINITIONS,
  getArchetypeDefinition,
  type VisualArchetype,
} from "@/lib/design-engine/archetypes";
import { getLayoutById } from "@/lib/design-engine/composition/rules";
import { applyStoreBrandToLayout } from "@/lib/design-engine/store-branding";
import { shapeCopyForLayout } from "@/lib/design-engine/copy/shape-slot-copy";
import { matchDemoPreset, type DemoPreset } from "@/lib/design-engine/demo-presets";
import type { DesignDocument } from "@/lib/design-engine/schemas";
import type { DesignPreviewState } from "@/components/design-engine/DesignEnginePreview";

export type DemoBrand = {
  name: string;
  mallName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | null;
  rubro?: string | null;
  previewImageUrl?: string | null;
};

function layoutToArchetype(layoutId: string): VisualArchetype {
  const layout = getLayoutById(layoutId);
  if (layout?.archetype) return layout.archetype as VisualArchetype;
  return "promo";
}

/** Adapta un DemoPreset al DesignDocument que consume el AdEngine actual. */
export function presetToDesignDocument(preset: DemoPreset): DesignDocument {
  const { design } = preset;
  const text = design.textOnImage;
  const archetype = layoutToArchetype(design.layoutId);

  return {
    imagePrompt: design.visualConcept.imagePrompt,
    caption: design.textExternal.caption,
    compositionCategory: archetype,
    compositionLayoutId: design.layoutId,
    hook: text.hook,
    badge: text.badge,
    subtext: text.subtext,
    cta: text.cta,
  };
}

/** Genera el mismo tipo de pieza que el motor real, sin llamar a OpenAI. */
export function buildDemoGeneration(input: {
  brief: string;
  imageSource: "ai" | "upload";
  userImageUrl?: string;
  brand: DemoBrand;
}): DesignPreviewState {
  const preset = matchDemoPreset(input.brief);
  const design = presetToDesignDocument(preset);
  const def = getArchetypeDefinition(design.compositionCategory);

  const baseLayout =
    getLayoutById(design.compositionLayoutId) ?? getLayoutById(def.defaultLayoutId)!;
  const layout = applyStoreBrandToLayout(baseLayout, {
    primaryColor: input.brand.primaryColor,
    secondaryColor: input.brand.secondaryColor,
  });

  const shaped = shapeCopyForLayout(
    {
      hook: design.hook,
      badge: design.badge,
      subtext: design.subtext,
      cta: design.cta,
    },
    layout
  );

  const shapedDesign: DesignDocument = {
    ...design,
    ...shaped,
  };

  const imageUrl =
    input.imageSource === "upload" && input.userImageUrl
      ? input.userImageUrl
      : preset.design.visualConcept.imageUrl;

  return {
    design: shapedDesign,
    layout,
    imageUrl,
    styleName: def.label,
    costoEstimado: 0,
  };
}

export { DEMO_PRESETS, matchDemoPreset } from "@/lib/design-engine/demo-presets";
export type { DemoPreset } from "@/lib/design-engine/demo-presets";
export const DEMO_ARCHETYPE_LABELS = ARCHETYPE_DEFINITIONS.map((d) => d.label);
