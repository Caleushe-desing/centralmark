import OpenAI from "openai";
import { z } from "zod";
import {
  buildDesignBriefPrompt,
  LAYER_JSON_SCHEMA,
  pickCreativeDirection,
  type CreativeDirection,
} from "./digital-designer-knowledge";

const strategySchema = z.object({
  targetAudience: z.string(),
  mainMessage: z.string(),
  emotionalTrigger: z.string(),
  copyAngles: z.array(z.string()).min(2).max(4),
  ctaSuggestion: z.string(),
});

export type MarketingStrategy = z.infer<typeof strategySchema>;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-...") return null;
  return new OpenAI({ apiKey });
}

export async function analyzeMarketingStrategy(params: {
  aiBrief: string;
  productName?: string;
  discountPercent?: number | null;
  priceText?: string | null;
  direction: CreativeDirection;
}): Promise<MarketingStrategy | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  const promoHint =
    params.discountPercent != null
      ? `Descuento: ${params.discountPercent}%`
      : params.priceText
        ? `Precio: ${params.priceText}`
        : "Sin descuento %";

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.55,
      messages: [
        {
          role: "system",
          content: `Eres estratega de marketing digital en Chile.
Analiza el brief y define la estrategia para UNA publicación Instagram.

Técnica elegida: ${params.direction.technique.name} — ${params.direction.technique.copyHint}

JSON:
{
  "targetAudience": "quién es el cliente ideal en 1 frase",
  "mainMessage": "mensaje principal único",
  "emotionalTrigger": "qué emoción activar",
  "copyAngles": ["ángulo 1", "ángulo 2", "ángulo 3"],
  "ctaSuggestion": "CTA corto con verbo"
}`,
        },
        {
          role: "user",
          content: `Brief:\n${params.aiBrief}\n\nProducto: ${params.productName ?? "oferta"}\n${promoHint}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = res.choices[0]?.message?.content;
    if (!raw) return null;
    return strategySchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function designPublicationWithStrategy(params: {
  aiBrief: string;
  productName?: string;
  discountPercent?: number | null;
  priceText?: string | null;
  direction: CreativeDirection;
  strategy: MarketingStrategy | null;
}): Promise<string | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  const promoHint =
    params.discountPercent != null
      ? `Descuento real: ${params.discountPercent}%`
      : params.priceText
        ? `Precio: ${params.priceText}`
        : "Sin % — no inventes descuentos";

  const strategyBlock = params.strategy
    ? `
ESTRATEGIA DE MARKETING:
- Audiencia: ${params.strategy.targetAudience}
- Mensaje principal: ${params.strategy.mainMessage}
- Emoción: ${params.strategy.emotionalTrigger}
- Ángulos: ${params.strategy.copyAngles.join(" | ")}
- CTA: ${params.strategy.ctaSuggestion}`
    : "";

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.78,
      messages: [
        {
          role: "system",
          content: `${buildDesignBriefPrompt(params.direction)}

${LAYER_JSON_SCHEMA}

IMPORTANTE: Máximo 4 capas en el JSON final. Textos MUY cortos (3-6 palabras por capa).
Ejecuta la estrategia con criterio de diseñador gráfico senior.`,
        },
        {
          role: "user",
          content: `Brief:\n${params.aiBrief}\n\nProducto: ${params.productName ?? "oferta"}\n${promoHint}${strategyBlock}\n\nComposición: "${params.direction.composition.name}". Diseña pieza única.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return res.choices[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export function pickDirectionForBrief(params: {
  aiBrief: string;
  productName?: string;
  discountPercent?: number | null;
}): CreativeDirection {
  return pickCreativeDirection(params.aiBrief, {
    discountPercent: params.discountPercent,
    productName: params.productName,
  });
}
