import { z } from "zod";

/** Hechos extraídos del brief — anclas inmutables para copy y validación */
export const briefFactsSchema = z.object({
  productName: z.string().min(2).max(120),
  commercialHook: z.string().min(2).max(200),
  urgencyCta: z.string().min(2).max(120),
  discountPercent: z.number().int().min(1).max(99).nullable(),
  rawBrief: z.string().min(3).max(500),
});

export type BriefFacts = z.infer<typeof briefFactsSchema>;

const DEFAULT_COMMERCIAL_HOOK = "Oferta especial";
const DEFAULT_URGENCY_CTA = "Aprovecha hoy";

/** Separa frases del brief por punto (.) — estructura [Producto].[Gancho].[Urgencia] */
function splitBriefSentences(brief: string): string[] {
  return brief
    .split(".")
    .map((part) => part.replace(/[!?]+$/g, "").trim())
    .filter(Boolean);
}

/** Extrae porcentaje de descuento si el cliente lo mencionó explícitamente. */
export function extractDiscountPercent(text: string): number | null {
  const match = text.match(/(?:^|\s)(\d{1,2})\s*%/);
  if (!match) return null;
  const value = parseInt(match[1]!, 10);
  return value >= 1 && value <= 99 ? value : null;
}

/**
 * Parser determinista del brief en tres bloques:
 * [Producto] + [Gancho comercial/descuento] + [Urgencia/CTA]
 *
 * Prioriza separación por puntos; si hay menos de 3 frases, rellena con defaults.
 */
export function parseBriefFacts(brief: string): BriefFacts {
  const rawBrief = brief.trim();
  if (!rawBrief) {
    return briefFactsSchema.parse({
      productName: "Producto destacado",
      commercialHook: DEFAULT_COMMERCIAL_HOOK,
      urgencyCta: DEFAULT_URGENCY_CTA,
      discountPercent: null,
      rawBrief: "Producto destacado",
    });
  }

  const sentences = splitBriefSentences(rawBrief);

  let productName: string;
  let commercialHook: string;
  let urgencyCta: string;

  if (sentences.length === 0) {
    productName = rawBrief.slice(0, 120);
    commercialHook = DEFAULT_COMMERCIAL_HOOK;
    urgencyCta = DEFAULT_URGENCY_CTA;
  } else if (sentences.length === 1) {
    productName = sentences[0]!;
    commercialHook = DEFAULT_COMMERCIAL_HOOK;
    urgencyCta = DEFAULT_URGENCY_CTA;
  } else if (sentences.length === 2) {
    productName = sentences[0]!;
    commercialHook = sentences[1]!;
    urgencyCta = DEFAULT_URGENCY_CTA;
  } else {
    productName = sentences[0]!;
    commercialHook = sentences[1]!;
    urgencyCta = sentences.slice(2).join(" ").trim() || DEFAULT_URGENCY_CTA;
  }

  const discountPercent =
    extractDiscountPercent(commercialHook) ?? extractDiscountPercent(rawBrief);

  return briefFactsSchema.parse({
    productName,
    commercialHook,
    urgencyCta,
    discountPercent,
    rawBrief,
  });
}
