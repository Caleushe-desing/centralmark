export type LightingStyle = "studio-soft" | "dramatic-chiaroscuro" | "bright-editorial";

const LIGHTING_BLOCKS: Record<LightingStyle, string> = {
  "studio-soft":
    "Studio lighting with soft shadows, balanced highlights, neutral backdrop, polished commercial catalog aesthetic.",
  "dramatic-chiaroscuro":
    "Dramatic chiaroscuro lighting, controlled contrast, deep soft shadows, premium moody advertising atmosphere.",
  "bright-editorial":
    "Bright editorial lighting, airy high-key look, soft diffused light, magazine cover advertisement style.",
};

/**
 * Infiere iluminación según producto y concepto.
 */
export function detectLightingStyle(product: string, concept: string): LightingStyle {
  const text = `${product} ${concept}`.toLowerCase();

  if (/food|gastronom|restaurant|chef|coffee|wine|comida|bebida|café/i.test(text)) {
    return "bright-editorial";
  }
  if (
    /luxury|premium|jewelry|watch|perfume|fashion|moda|lujo|joya|reloj|perfume/i.test(text)
  ) {
    return "dramatic-chiaroscuro";
  }
  if (/tech|software|web|app|office|b2b|servicio|saas|digital|laptop/i.test(text)) {
    return "dramatic-chiaroscuro";
  }
  if (/sport|deport|fitness|energy|outdoor|aventura/i.test(text)) {
    return "bright-editorial";
  }

  return "studio-soft";
}

/**
 * Filtro de Dirección de Arte — fusiona la idea del usuario con comandos estéticos premium.
 * Evita el look falso/3D/stock típico de IA genérica.
 */
export function enhanceAdImagePrompt(params: {
  concept: string;
  product: string;
  lighting?: LightingStyle | "auto";
}): string {
  const lighting =
    params.lighting === "auto" || !params.lighting
      ? detectLightingStyle(params.product, params.concept)
      : params.lighting;

  const concept = params.concept.trim();
  const product = params.product.trim();

  return [
    "Commercial product photography, high-end advertising style.",
    `Hero subject: ${product}.`,
    `Creative direction: ${concept}.`,
    LIGHTING_BLOCKS[lighting],
    "Shot on 85mm lens, f/2.8, shallow depth of field, sharp focus on the product, subtle background bokeh.",
    "Natural photographic color grading, realistic skin and materials, never hyper-saturated or vivid AI look.",
    "Negative aesthetic constraints: avoid plastic textures, waxy skin, deformed faces, oversaturated colors, cluttered composition, generic stock photo look, fake 3D render, CGI artifacts, uncanny valley, lens flare abuse.",
    "Leave negative space in upper and lower areas for optional text overlay.",
    "No text, no watermarks, no logos, no typography, no words in the image.",
  ].join(" ");
}

export function getLightingLabel(style: LightingStyle): string {
  return {
    "studio-soft": "Estudio suave",
    "dramatic-chiaroscuro": "Claroscuro dramático",
    "bright-editorial": "Editorial luminoso",
  }[style];
}
