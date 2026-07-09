import OpenAI from "openai";
import { z } from "zod";
import { pickDirectionForBrief } from "@/lib/ai/digital-designer";
import { DESIGNER_PERSONA } from "@/lib/ai/digital-designer-knowledge";

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

  const direction = pickDirectionForBrief({
    aiBrief: params.aiBrief,
    productName: params.productName,
    discountPercent: params.discountPercent,
  });

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${DESIGNER_PERSONA}

Escribe el PIE del post (caption Instagram/Facebook) — complementa la imagen, no la repitas.

Técnica de marketing para esta pieza: ${direction.technique.name}
→ ${direction.technique.copyHint}
Tono: ${direction.tone}

Reglas:
- Español chileno, 2-4 líneas, emojis con moderación (1-3)
- CTA claro con verbo
- SIN hashtags
- NO copies el brief literalmente
- NO inventes % si no está en los datos
- Máximo 400 caracteres
- Varía el estilo según la técnica (no siempre el mismo gancho)

JSON: { "caption": "..." }`,
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
