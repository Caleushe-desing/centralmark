import type { CompositionLayout } from "./composition/rules";

export interface StoreBrandContext {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | null;
  rubro?: string | null;
  category?: string | null;
}

/** Aplica la paleta de la tienda al layout de composición */
export function applyStoreBrandToLayout(
  layout: CompositionLayout,
  brand: Pick<StoreBrandContext, "primaryColor" | "secondaryColor">
): CompositionLayout {
  return {
    ...layout,
    palette: {
      ...layout.palette,
      accent: brand.primaryColor,
      contrast: brand.secondaryColor,
    },
  };
}
