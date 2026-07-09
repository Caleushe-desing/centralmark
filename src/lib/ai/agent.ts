import OpenAI from "openai";
import { z } from "zod";

const offerContentSchema = z.object({
  captionInstagram: z.string(),
  captionFacebook: z.string(),
  hashtags: z.string(),
  backgroundPrompt: z.string(),
  visualStyle: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  cta: z.string(),
});

export type OfferContent = z.infer<typeof offerContentSchema>;

export interface OfferInput {
  storeName: string;
  storeCategory: string;
  mallName: string;
  productName: string;
  discountPercent: number;
  description?: string | null;
  aiBrief?: string | null;
  startDate: string;
  endDate: string;
}

const SYSTEM_PROMPT = `Eres MarkAI, el agente de marketing especializado en malls y retail.
Tu trabajo es convertir ofertas de tiendas en contenido listo para publicar en redes sociales.

Reglas:
- Escribe en español latinoamericano, tono comercial atractivo pero profesional
- Instagram: máximo 2200 caracteres, emojis moderados, CTA claro
- Facebook: tono similar, puede ser un poco más descriptivo
- Hashtags: 8-12 relevantes, mezcla generales (#ofertas #descuentos) con específicos del producto y mall
- backgroundPrompt: prompt en INGLÉS para generación de imagen. Describe la IMAGEN COMPLETA (escena, producto, ambiente, colores, estilo, energía) basándote SOLO en el texto del cliente (aiBrief). Incluye marcas y logos de producto si el cliente los menciona (Adidas, Samsung, Nike, etc.). Sin texto promocional escrito en la imagen (va en el editor o en modo completo aparte). Estilo publicitario premium para redes sociales.
- visualStyle: una palabra que describa el estilo (ej: deportivo, elegante, vibrante)
- headline: texto corto para la imagen (ej: "30% OFF")
- subheadline: nombre del producto o beneficio corto
- cta: llamado a la acción corto (ej: "¡Solo hoy!")

Responde SOLO con JSON válido, sin markdown.`;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no está configurada");
  }
  return new OpenAI({ apiKey });
}

export async function generateOfferContent(
  input: OfferInput
): Promise<OfferContent> {
  const openai = getOpenAI();

  const userPrompt = `Genera contenido de marketing para esta oferta:

Mall: ${input.mallName}
Tienda: ${input.storeName} (${input.storeCategory})
Producto: ${input.productName}
Descuento: ${input.discountPercent}%
Vigencia: ${input.startDate} al ${input.endDate}
${input.aiBrief ? `\nTEXTO DEL CLIENTE PARA CREAR LA IMAGEN (obligatorio — interpreta esto para backgroundPrompt y copy):\n${input.aiBrief}` : ""}
${input.description ? `\nDetalle adicional: ${input.description}` : ""}

Responde con este JSON exacto:
{
  "captionInstagram": "...",
  "captionFacebook": "...",
  "hashtags": "#tag1 #tag2 ...",
  "backgroundPrompt": "...",
  "visualStyle": "...",
  "headline": "...",
  "subheadline": "...",
  "cta": "..."
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("La IA no generó contenido");
  }

  return offerContentSchema.parse(JSON.parse(content));
}

export function buildFallbackContent(input: OfferInput): OfferContent {
  const hashtags = [
    "#ofertas",
    "#descuentos",
    `#${input.mallName.replace(/\s+/g, "")}`,
    `#${input.storeName.replace(/\s+/g, "")}`,
    "#shopping",
    "#liquidacion",
    "#promocion",
    "#ahorro",
  ].join(" ");

  const caption = `🔥 ${input.discountPercent}% OFF en ${input.productName}

📍 ${input.storeName} — ${input.mallName}
📅 Válido del ${input.startDate} al ${input.endDate}

${input.description ?? "¡No te lo pierdas!"}

${hashtags}`;

  return {
    captionInstagram: caption,
    captionFacebook: caption,
    hashtags,
    backgroundPrompt: input.aiBrief
      ? `Escena según pedido del cliente: ${input.aiBrief}. Estilo ${input.storeCategory}, sin texto en imagen.`
      : `Premium retail visual for ${input.storeCategory}, ${input.productName}, authentic brands as described`,
    visualStyle: "vibrante",
    headline: `${input.discountPercent}% OFF`,
    subheadline: input.productName,
    cta: "¡Aprovecha ahora!",
  };
}
