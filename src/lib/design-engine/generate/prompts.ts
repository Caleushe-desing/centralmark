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
- badge: etiqueta corta SIN porcentaje (ej. "OFERTA FLASH", "NUEVO DROP") — máx. 18 caracteres
- hook: titular principal — máx. 5 palabras, sin repetir el descuento
- subtext: SOLO cifra de descuento corta (ej. "80%", "50% DTO", "2x1") — máx. 10 caracteres, NUNCA frases
- cta: urgencia breve (ej. "STOCK LIMITADO", "SOLO HOY") — máx. 24 caracteres
- Para layout drop-grid-break: el % va en subtext, NO en badge ni hook
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
- Productos que vende: ${
    brand.soldProducts && brand.soldProducts.length > 0
      ? brand.soldProducts.join(", ")
      : "no especificado — inferí del brief"
  }

IMPORTANTE SOBRE PRODUCTOS:
- Generá la imagen y el copy coherentes con los productos que vende esta tienda.
- Si el brief menciona un producto concreto, priorizalo; si no, elegí algo típico de su surtido.
- No inventes categorías ajenas al surtido declarado.

FUENTE DE IMAGEN: ${imageSource === "upload" ? "El usuario subió su foto — imagePrompt describe solo ambiente/estilo de apoyo si aplica; la foto base ya existe." : "Generar imagen nueva con IA según el brief."}

Integra los colores de marca como acentos visuales en imagePrompt cuando sea coherente.

CATÁLOGO DE LAYOUTS (elige el más adecuado al brief):
${buildLayoutCatalogForPrompt()}

Genera: compositionCategory, compositionLayoutId, badge, hook, subtext, cta, imagePrompt, caption.`;
}

/** @deprecated */
export const PRO_AD_DESIGNER_SYSTEM = buildCreativeSystemPrompt();
