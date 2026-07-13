import { buildLayoutCatalogForPrompt } from "../composition/rules";
import type { StoreBrandContext } from "../store-branding";

export interface PublicationPromptContext {
  brief: string;
  brand: StoreBrandContext;
  imageSource: "ai" | "upload";
}

function buildCreativeSystemPrompt(): string {
  return `Eres director creativo senior de MarkMall. El usuario escribe UNA instrucción libre; tú interpretas todo y entregas una publicación completa para Instagram/Facebook (1080×1080).

═══ IDIOMA (OBLIGATORIO) ═══
- badge, hook, subtext, cta y caption → ESPAÑOL NATIVO comercial premium (Chile/LATAM).
- PROHIBIDO inglés y anglicismos de marketing: OFF, SALE, SHOP, NEW, LIMITED, BUY, etc.
- Usa: DTO, DESCUENTO, COMPRA, OFERTA, EXCLUSIVO, STOCK LIMITADO.

═══ IMAGEN (imagePrompt) ═══
- INGLÉS descriptivo, máx. 2 oraciones (~350 caracteres).
- Escena ÚNICA y llamativa para redes: variar encuadre, luz, ambiente según el brief del usuario.
- NO texto, letras ni palabras renderizadas en la foto.
- Debe captar atención en scroll (contraste, energía visual, producto protagonista).

═══ COMPOSICIÓN ═══
- Elige compositionCategory y compositionLayoutId según la intención del brief (no uses siempre el mismo).
- Catálogo de layouts disponible en el mensaje del usuario.

═══ TEXTOS EN IMAGEN ═══
- badge: etiqueta corta | hook: titular principal | subtext: oferta/descuento | cta: urgencia
- Refleja lo que el usuario pidió; si no especifica textos, propón copy impactante en español.

═══ CAPTION EXTERNO (feed IG/FB) ═══
- 2-4 líneas profesionales, complementa la imagen (no repitas literalmente todos los slots).
- Emojis moderados (1-3), SIN hashtags en el caption.
- Tono comercial cercano, CTA claro.

Responde ÚNICAMENTE el JSON del schema.`;
}

export function getDesignerSystemPrompt(): string {
  return buildCreativeSystemPrompt();
}

export function buildProAdUserPrompt(ctx: PublicationPromptContext): string {
  const { brief, brand, imageSource } = ctx;

  return `INSTRUCCIÓN DEL CLIENTE (interpreta todo):
"${brief.trim()}"

MARCA DE LA TIENDA:
- Nombre: ${brand.name}
- Color primario (acentos): ${brand.primaryColor}
- Color secundario (contraste): ${brand.secondaryColor}
- Rubro: ${brand.category ?? brand.rubro ?? "retail"}

FUENTE DE IMAGEN: ${imageSource === "upload" ? "El usuario subió su foto — imagePrompt describe solo ambiente/estilo de apoyo si aplica; la foto base ya existe." : "Generar imagen nueva con IA según el brief."}

Integra los colores de marca como acentos visuales en imagePrompt cuando sea coherente.

CATÁLOGO DE LAYOUTS (elige el más adecuado al brief):
${buildLayoutCatalogForPrompt()}

Genera: compositionCategory, compositionLayoutId, badge, hook, subtext, cta, imagePrompt, caption.`;
}

/** @deprecated */
export const PRO_AD_DESIGNER_SYSTEM = buildCreativeSystemPrompt();
