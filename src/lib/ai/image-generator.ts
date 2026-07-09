import OpenAI from "openai";
import { buildBrandPromptBlock, extractBrandsFromBrief } from "./extract-brands";

export interface ImageBriefInput {
  aiBrief: string;
  description?: string | null;
  productName: string;
  discountPercent: number | null;
  priceText?: string | null;
  storeName: string;
  storeCategory: string;
}

/** complete = publicación lista para compartir (escena + textos integrados); editor = escena + editor manual */
export type ImageCreationMode = "complete" | "editor";

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1-mini";

const PROMPT_SYSTEM_EDITOR = `Eres un experto en convertir pedidos en español a prompts para generación de imágenes con IA (GPT Image), especializado en publicaciones de Instagram.

REGLA #1 — LA ESCENA DEBE COINCIDIR SOLO CON EL BRIEF DEL CLIENTE:
- Si el brief habla de software, páginas web, oficina, servicios → escena tecnológica/profesional (NO zapatillas, NO tienda deportiva)
- Si habla de comida → gastronomía. Si habla de ropa → moda. Etc.
- NUNCA asumas calzado, outlet deportivo o zapatillas si el brief no los menciona
- El nombre de la tienda NO define la escena; solo el brief

Describe una ESCENA COMPLETA estilo anuncio profesional de Instagram según el brief.
- Iluminación comercial, composición cuadrada 1:1, alta calidad
- Si el cliente nombra una MARCA en el brief, productos con esa marca visible
- NUNCA inventes marcas ni logos con texto ilegible

Genera UN prompt en INGLÉS, detallado (4-8 oraciones).

PROHIBIDO en la imagen: texto escrito, letreros con palabras, watermarks, tipografía, logos inventados.
El logo del comercio se superpone después — no lo dibujes.

Responde SOLO con JSON: {"dallePrompt": "..."}`;

const PROMPT_SYSTEM_COMPLETE = `Eres un experto en convertir pedidos en español a prompts para generación de imágenes con IA (GPT Image).

El usuario eligió "imagen completa": necesitas solo la ESCENA FOTOGRÁFICA de fondo.
Los textos promocionales en español se superponen después con tipografía real (ortografía perfecta).

REGLA #1 — LA ESCENA DEBE COINCIDIR SOLO CON EL BRIEF DEL CLIENTE:
- Si el brief habla de software, páginas web, oficina, servicios → escena tecnológica/profesional (NO zapatillas, NO tienda deportiva)
- Si habla de comida → gastronomía. Si habla de ropa → moda. Etc.
- NUNCA asumas calzado, outlet deportivo o zapatillas si el brief no los menciona

Describe una ESCENA estilo anuncio profesional de Instagram según el brief.
- Iluminación comercial, composición cuadrada 1:1, alta calidad
- Si el cliente nombra una MARCA en el brief, productos con esa marca visible (sin texto legible inventado)

PROHIBIDO en la imagen: texto escrito, letreros con palabras, watermarks, tipografía, logos inventados.
El logo del comercio se superpone después — no lo dibujes.

Genera UN prompt en INGLÉS, detallado (4-8 oraciones).

Responde SOLO con JSON: {"dallePrompt": "..."}`;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-...") return null;
  return new OpenAI({ apiKey });
}

export async function craftDallePromptFromBrief(
  input: ImageBriefInput,
  mode: ImageCreationMode = "editor"
): Promise<string> {
  const openai = getOpenAI();
  const userText = [input.aiBrief, input.description].filter(Boolean).join("\n");
  const brands = extractBrandsFromBrief(userText);
  const brandBlock = buildBrandPromptBlock(brands);
  const discountLine =
    input.discountPercent != null
      ? `Descuento explícito del cliente: ${input.discountPercent}%`
      : "Sin descuento porcentual — NO incluyas % de descuento en la imagen.";
  const priceLine = input.priceText
    ? `Precio mencionado por el cliente: ${input.priceText}`
    : "";
  const systemPrompt = mode === "complete" ? PROMPT_SYSTEM_COMPLETE : PROMPT_SYSTEM_EDITOR;

  if (openai) {
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              mode === "complete"
                ? `Pedido del cliente (imagen COMPLETA — escena SIN texto, textos van encima después):
"${userText}"

Oferta: ${input.productName}
${discountLine}
${priceLine}
Comercio (solo referencia, NO cambies la escena): ${input.storeName}
${brands.length ? `Marcas en el brief: ${brands.join(", ")}` : ""}

Genera escena que coincida SOLO con el brief. Si es software/web, NO muestres zapatillas ni tienda deportiva.
${brandBlock}`
                : `Pedido del cliente para la imagen:
"${userText}"

Oferta: ${input.productName}
${discountLine}
${priceLine}
Comercio (solo referencia, NO cambies la escena): ${input.storeName}
${brands.length ? `Marcas en el brief: ${brands.join(", ")}` : ""}

La escena debe coincidir SOLO con el brief del cliente.
${brandBlock}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      const raw = res.choices[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw) as { dallePrompt?: string };
        if (parsed.dallePrompt?.trim()) return parsed.dallePrompt.trim();
      }
    } catch {
      // fallback below
    }
  }

  if (mode === "complete") {
    const brandLine =
      brands.length > 0
        ? `${brands.join(" and ")} sneakers/products with official brand logos and large "${brands.join('" / "')}" wordmark text in the design.`
        : `Authentic branded products exactly as described by the client.`;

    const promoText =
      input.discountPercent != null
        ? `Large Spanish promotional text: "¡OFERTA!", "${input.discountPercent}% DE DESCUENTO".`
        : input.priceText
          ? `Large Spanish promotional text highlighting price: "${input.priceText}" and "¡OFERTA!" — no percentage discount badges.`
          : `Large Spanish promotional text: "¡OFERTA!" — no invented percentage discounts.`;

    return [
      `Professional complete Instagram retail advertisement, square 1:1.`,
      brandLine,
      promoText,
      `Follow client brief exactly. No fake invented brand names, leave top-right corner clear for merchant logo overlay.`,
      `Scene: ${userText}`,
    ].join(" ");
  }

  return [
    `Professional Instagram retail advertisement photo, square 1:1 format.`,
    `Scene: ${userText}`,
    `Retail store interior, products displayed on shelves and platform,`,
    `warm commercial lighting, shopping mall atmosphere, authentic branded products when mentioned,`,
    `vibrant promotional retail photography, depth of field, no promotional text overlay, no watermarks.`,
  ].join(" ");
}

export async function generateImageWithDalle(
  prompt: string,
  mode: ImageCreationMode = "editor",
  options?: { brands?: string[] }
): Promise<Buffer | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  const hasBrands = (options?.brands?.length ?? 0) > 0;
  const brandSuffix = hasBrands
    ? "Show official brand logos and legible brand name text exactly as requested. Never invent fake brand names."
    : "Show authentic product brands when requested.";

  const suffix =
    mode === "complete"
      ? `Square 1:1. Scene ONLY from client brief. NO shoes or sport store unless brief asks. NO text, words, signs, or logos in image. ${brandSuffix} Merchant logo added separately. No watermarks.`
      : `Square 1:1 aspect ratio. Scene ONLY from client brief. No promotional text overlay. ${brandSuffix} Merchant store logo added separately in top-right. No watermarks.`;

  const quality = mode === "complete" && hasBrands ? "high" : "medium";

  try {
    const result = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt: `${prompt}. ${suffix}`,
      n: 1,
      size: "1024x1024",
      quality,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) return null;
    return Buffer.from(b64, "base64");
  } catch (err) {
    console.error("Image generation failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
