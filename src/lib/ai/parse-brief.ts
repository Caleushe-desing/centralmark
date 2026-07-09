import OpenAI from "openai";
import { z } from "zod";

const parsedSchema = z.object({
  productName: z.string(),
  discountPercent: z.number().int().min(1).max(99).nullable(),
  priceText: z.string().nullable().optional(),
  validityDays: z.number().int().min(1).max(90).optional(),
});

export type ParsedOfferBrief = z.infer<typeof parsedSchema>;

const PARSE_SYSTEM = `Extrae datos de un pedido de publicidad en español. Responde SOLO JSON:
{
  "productName": "nombre corto del producto u oferta",
  "discountPercent": número 1-99 SOLO si el cliente menciona explícitamente un porcentaje de descuento (ej. 30%, 20% off). Si NO hay % de descuento, usa null,
  "priceText": "precio tal como lo escribió el cliente (ej. $9.990, 9990) o null si no hay",
  "validityDays": días de vigencia si se menciona, sino 7
}

REGLAS:
- NO inventes un porcentaje de descuento si el cliente solo dio un precio fijo u oferta sin %.
- "oferta", "promoción" o precio bajo NO implican un % automático.`;

function extractPriceText(text: string): string | null {
  const priceMatch = text.match(
    /(?:a\s+)?\$?\s*(\d{1,3}(?:\.\d{3})+|\d{4,})(?:\s*(?:clp|pesos))?/i
  );
  return priceMatch ? priceMatch[0].replace(/^\s*a\s+/i, "").trim() : null;
}

function regexFallback(text: string): ParsedOfferBrief {
  const discountMatch = text.match(/(\d{1,2})\s*%/);
  const discountPercent = discountMatch ? parseInt(discountMatch[1], 10) : null;
  const firstLine = text.split("\n")[0]?.trim() || "Oferta especial";
  const productName =
    firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;

  return {
    productName,
    discountPercent,
    priceText: extractPriceText(text),
    validityDays: 7,
  };
}

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-...") return null;
  return new OpenAI({ apiKey });
}

export async function parseOfferBrief(text: string): Promise<ParsedOfferBrief> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { productName: "Oferta especial", discountPercent: null, priceText: null, validityDays: 7 };
  }

  const openai = getOpenAI();
  if (!openai) return regexFallback(trimmed);

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PARSE_SYSTEM },
        { role: "user", content: trimmed },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const raw = res.choices[0]?.message?.content;
    if (raw) {
      const parsed = parsedSchema.parse(JSON.parse(raw));
      return {
        ...parsed,
        priceText: parsed.priceText ?? extractPriceText(trimmed),
      };
    }
  } catch {
    // fallback below
  }

  return regexFallback(trimmed);
}
