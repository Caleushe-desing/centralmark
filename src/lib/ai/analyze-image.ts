import OpenAI from "openai";
import { z } from "zod";

const analysisSchema = z.object({
  productName: z.string(),
  discountPercent: z.number().int().min(1).max(99).optional(),
  caption: z.string(),
  hashtags: z.string(),
  imageBrief: z.string().optional(),
});

export type ImageAnalysis = z.infer<typeof analysisSchema>;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-...") return null;
  return new OpenAI({ apiKey });
}

export async function analyzeOfferImage(params: {
  imageBase64: string;
  mimeType: string;
  aiBrief?: string;
  storeName: string;
  storeCategory: string;
  mallName: string;
}): Promise<ImageAnalysis | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  const userText = params.aiBrief?.trim()
    ? `Brief del cliente: ${params.aiBrief}`
    : "Sin brief adicional — infiere la oferta desde la imagen.";

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres experto en marketing para malls y tiendas en Chile.
Analiza la imagen y el brief para crear una publicación en Instagram/Facebook.
Responde SOLO JSON:
{
  "productName": "nombre corto del producto u oferta",
  "discountPercent": número 1-99 si se menciona explícitamente un % de descuento, si no null,
  "caption": "texto de la publicación en español neutro de Chile, 2-4 líneas, emojis moderados, SIN hashtags. NO copies el brief del cliente palabra por palabra; redacta un copy publicitario original",
  "hashtags": "#tag1 #tag2 ... (6-10 hashtags)",
  "imageBrief": "descripción corta de lo que se ve en la foto"
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${params.mimeType};base64,${params.imageBase64}`,
              },
            },
            {
              type: "text",
              text: `${userText}

Tienda: ${params.storeName} (${params.storeCategory})
Mall: ${params.mallName}`,
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const raw = res.choices[0]?.message?.content;
    if (!raw) return null;
    return analysisSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
