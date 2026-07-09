import OpenAI from "openai";
import { z } from "zod";

const responseSchema = z.object({
  caption: z.string(),
});

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-...") return null;
  return new OpenAI({ apiKey });
}

export async function suggestOfferCaption(params: {
  aiBrief: string;
  productName?: string;
  discountPercent?: number | null;
  priceText?: string | null;
  storeName: string;
  mallName: string;
  storeCategory?: string;
}): Promise<string | null> {
  const openai = getOpenAI();
  if (!openai || !params.aiBrief.trim()) return null;

  const context = [
    params.productName ? `Producto/oferta: ${params.productName}` : null,
    params.discountPercent ? `Descuento: ${params.discountPercent}%` : null,
    params.priceText ? `Precio: ${params.priceText}` : null,
    `Tienda: ${params.storeName}`,
    `Mall: ${params.mallName}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres copywriter para Instagram/Facebook de tiendas en malls chilenos.
Escribe un texto CORTO y LLAMATIVO para el pie del post (fuera de la imagen).

Reglas:
- Español latinoamericano, tono comercial cercano
- 2 a 4 líneas, emojis con moderación (1-3)
- Incluye un llamado a la acción claro
- SIN hashtags (van aparte)
- NO copies ni repitas literalmente el brief del cliente
- NO inventes un % de descuento si no está en los datos
- Máximo 400 caracteres

Responde SOLO JSON: { "caption": "..." }`,
        },
        {
          role: "user",
          content: `Brief del cliente (solo como inspiración, no lo copies):
${params.aiBrief.trim()}

Contexto:
${context}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.75,
    });

    const raw = res.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = responseSchema.parse(JSON.parse(raw));
    return parsed.caption.trim() || null;
  } catch {
    return null;
  }
}

const hashtagsSchema = z.object({
  hashtags: z.string(),
});

export async function suggestOfferHashtags(params: {
  aiBrief: string;
  productName?: string;
  storeName: string;
}): Promise<string | null> {
  const openai = getOpenAI();
  if (!openai || !params.aiBrief.trim()) return null;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Genera hashtags para Instagram según el brief del cliente.
6-10 hashtags en español/inglés, separados por espacio, cada uno con #.
Deben relacionarse SOLO con el brief actual (NO zapatillas ni Nike si el brief es de software/web).
Responde SOLO JSON: { "hashtags": "#ejemplo #otro" }`,
        },
        {
          role: "user",
          content: `Brief:\n${params.aiBrief}\n\nTienda: ${params.storeName}\nOferta: ${params.productName ?? "servicio"}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const raw = res.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = hashtagsSchema.parse(JSON.parse(raw));
    return parsed.hashtags.trim() || null;
  } catch {
    return null;
  }
}
