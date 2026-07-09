import OpenAI from "openai";
import { z } from "zod";
import {
  finalizeLayerLayout,
} from "@/lib/image/layer-layout";
import {
  createTextLayer,
  normalizeLayer,
  type TextLayer,
} from "@/lib/image/text-layers";
import {
  analyzeMarketingStrategy,
  designPublicationWithStrategy,
  pickDirectionForBrief,
  type MarketingStrategy,
} from "@/lib/ai/digital-designer";
import type { CreativeDirection } from "@/lib/ai/digital-designer-knowledge";

const FONT_IDS = [
  "bebas",
  "anton",
  "oswald",
  "montserrat",
  "playfair",
  "impact",
  "pacifico",
  "system",
] as const;

type FontId = (typeof FONT_IDS)[number];

const creativeLayerSchema = z.object({
  text: z.string(),
  x: z.coerce.number(),
  y: z.coerce.number(),
  fontSize: z.coerce.number(),
  fontFamily: z.string(),
  color: z.string(),
  bold: z.coerce.boolean().optional(),
  italic: z.coerce.boolean().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  strokeWidth: z.coerce.number().optional(),
  strokeColor: z.string().nullish(),
  backgroundColor: z.string().nullish(),
  variant: z.enum(["text", "badge", "pill"]).optional(),
  badgeColor: z.string().nullish(),
  letterSpacing: z.coerce.number().optional(),
  rotation: z.coerce.number().optional(),
});

const creativeDesignSchema = z.object({
  composition: z.string().optional(),
  marketingTechnique: z.string().optional(),
  layers: z.array(creativeLayerSchema).min(3).max(7),
});

function normalizeFontFamily(raw: string): FontId {
  const id = raw.toLowerCase().replace(/[^a-z]/g, "");
  const map: Record<string, FontId> = {
    bebas: "bebas",
    bebasneue: "bebas",
    anton: "anton",
    oswald: "oswald",
    montserrat: "montserrat",
    playfair: "playfair",
    playfairdisplay: "playfair",
    impact: "impact",
    pacifico: "pacifico",
    system: "system",
    arial: "system",
    roboto: "montserrat",
  };
  return map[id] ?? (FONT_IDS.includes(id as FontId) ? (id as FontId) : "montserrat");
}

export type ImageTextBlocks = {
  headline: string;
  highlight?: string;
  bullets?: string[];
  cta?: string;
};

export type ImageLayoutStyle = string;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-...") return null;
  return new OpenAI({ apiKey });
}

function applyLocalSpanishFixes(text: string): string {
  const fixes: [RegExp, string][] = [
    [/\bsesion\b/gi, "sesión"],
    [/\bdiseno\b/gi, "diseño"],
    [/\bunico\b/gi, "único"],
    [/\bunica\b/gi, "única"],
    [/\bmas\b/gi, "más"],
    [/\btambien\b/gi, "también"],
    [/\benvio\b/gi, "envío"],
    [/\bliquidacion\b/gi, "liquidación"],
  ];
  let out = text;
  for (const [pattern, replacement] of fixes) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).trim();
}

function estimateTextWidthPercent(text: string, fontSize: number): number {
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((l) => l.length), 1);
  return (longest * fontSize * 0.55) / 10.8;
}

/** Evita textos cortados en los bordes del canvas 1080×1080 */
function ensureTextFitsSafeArea(layer: TextLayer): TextLayer {
  let { text, x, y, fontSize, align } = layer;
  const margin = 8;
  let widthPct = estimateTextWidthPercent(text, fontSize);

  while (widthPct > 84 && fontSize > 22) {
    fontSize -= 4;
    widthPct = estimateTextWidthPercent(text, fontSize);
  }

  if (align === "center") {
    const half = widthPct / 2;
    if (x - half < margin) x = margin + half;
    if (x + half > 100 - margin) x = 100 - margin - half;
  } else if (align === "left") {
    if (x < margin) x = margin;
    if (x + widthPct > 100 - margin) {
      fontSize = Math.min(fontSize, 36);
      widthPct = estimateTextWidthPercent(text, fontSize);
    }
  } else if (align === "right") {
    if (x - widthPct < margin) x = margin + widthPct;
    if (x > 100 - margin) x = 100 - margin;
  }

  return normalizeLayer({
    ...layer,
    text,
    x: clamp(x, margin, 100 - margin),
    y: clamp(y, margin, 94),
    fontSize: clamp(fontSize, 18, 110),
  });
}

function normalizeCreativeLayers(
  raw: z.infer<typeof creativeDesignSchema>["layers"],
  compositionId?: string
): TextLayer[] {
  const layers = raw.map((layer) => {
    let text = applyLocalSpanishFixes(truncate(layer.text.replace(/\n/g, " "), 42));
    let variant = layer.variant ?? "text";

    if (variant === "badge" && text.length > 10) {
      variant = "pill";
    }

    const normalized = normalizeLayer(
      createTextLayer(text, {
        x: clamp(layer.x, 8, 92),
        y: clamp(layer.y, 8, 94),
        fontSize: clamp(layer.fontSize, 18, 110),
        fontFamily: normalizeFontFamily(layer.fontFamily),
        color: layer.color?.startsWith("#") ? layer.color : "#FFFFFF",
        bold: layer.bold ?? layer.fontSize >= 40,
        italic: layer.italic ?? false,
        align: layer.align ?? "center",
        strokeWidth: clamp(layer.strokeWidth ?? 0, 0, 8),
        strokeColor: layer.strokeColor ?? "#050505",
        backgroundColor: layer.backgroundColor ?? null,
        variant,
        badgeColor: layer.badgeColor ?? null,
        letterSpacing: clamp(layer.letterSpacing ?? 0, -1, 12),
        rotation: clamp(layer.rotation ?? 0, -12, 12),
      })
    );

    return ensureTextFitsSafeArea(normalized);
  });

  return finalizeLayerLayout(layers, compositionId);
}

function processLayers(
  layers: TextLayer[],
  compositionId?: string
): TextLayer[] {
  return finalizeLayerLayout(
    layers.map((l) =>
      ensureTextFitsSafeArea(
        normalizeLayer({ ...l, text: l.text.replace(/\n/g, " ") })
      )
    ),
    compositionId
  );
}

/**
 * Pipeline diseñador experto:
 * 1. Técnica de marketing + composición (variada)
 * 2. Estrategia del brief
 * 3. Diseño gráfico de capas
 * 4. Corrección ortográfica
 */
export async function suggestImageTextLayers(params: {
  aiBrief: string;
  productName?: string;
  discountPercent?: number | null;
  priceText?: string | null;
}): Promise<TextLayer[]> {
  if (!params.aiBrief.trim()) return buildFallbackLayers(params);

  const direction = pickDirectionForBrief(params);
  const strategy = await analyzeMarketingStrategy({ ...params, direction });
  const designJson = await designPublicationWithStrategy({
    ...params,
    direction,
    strategy,
  });

  if (!designJson) {
    return buildSmartFallback(params, direction, strategy);
  }

  try {
    const design = creativeDesignSchema.parse(JSON.parse(designJson));
    const compositionId = direction.composition.id;
    const layers = normalizeCreativeLayers(design.layers, compositionId);
    if (layers.length < 3) return buildSmartFallback(params, direction, strategy);
    const proofread = await proofreadLayerTexts(layers, params.aiBrief);
    return processLayers(proofread, compositionId);
  } catch {
    return buildSmartFallback(params, direction, strategy);
  }
}

async function proofreadLayerTexts(
  layers: TextLayer[],
  brief: string
): Promise<TextLayer[]> {
  const openai = getOpenAI();
  if (!openai) return layers;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `Corrige ortografía en español chileno de textos de anuncio.
Devuelve JSON: { "texts": ["texto capa 1", "texto capa 2", ...] }
Misma cantidad de textos, mismo orden.
MANTÉN cada texto CORTO (máx 40 caracteres). No alargues ni unas frases.`,
        },
        {
          role: "user",
          content: `Brief: ${brief}\n\nTextos:\n${JSON.stringify(layers.map((l) => l.text))}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = res.choices[0]?.message?.content;
    if (!raw) return layers;
    const parsed = z.object({ texts: z.array(z.string()) }).parse(JSON.parse(raw));
    if (parsed.texts.length !== layers.length) return layers;

    return layers.map((layer, i) =>
      normalizeLayer({ ...layer, text: applyLocalSpanishFixes(parsed.texts[i] ?? layer.text) })
    );
  } catch {
    return layers;
  }
}

/** Fallback con copy del brief/estrategia — nunca texto genérico de plantilla */
function buildSmartFallback(
  params: {
    aiBrief: string;
    productName?: string;
    discountPercent?: number | null;
    priceText?: string | null;
  },
  direction: CreativeDirection,
  strategy: MarketingStrategy | null
): TextLayer[] {
  const seed = direction.variationSeed;
  const hook = truncate(
    strategy?.copyAngles?.[0] ??
      strategy?.mainMessage ??
      params.aiBrief.split(/[.!?\n]/)[0]?.trim() ??
      params.productName ??
      "Tu próxima gran idea",
    42
  );
  const benefit = truncate(strategy?.mainMessage ?? params.aiBrief.split(/[.!?\n]/)[1]?.trim() ?? hook, 48);
  const cta = truncate(strategy?.ctaSuggestion ?? "Conoce más", 24);
  const product = truncate(params.productName ?? "Oferta", 28);

  const comp = direction.composition.id;

  if (comp === "promo_bold" && params.discountPercent != null) {
    return finalizeLayerLayout(
      [
        createTextLayer(`-${params.discountPercent}%`, {
          x: 82,
          y: 16,
          fontSize: 56,
          fontFamily: "anton",
          color: "#050505",
          variant: "badge",
          badgeColor: "#ffe600",
        }),
        createTextLayer(product.toUpperCase(), {
          x: 50,
          y: 42,
          fontSize: 68,
          fontFamily: "bebas",
          color: "#FFFFFF",
          strokeWidth: 3,
          strokeColor: "#050505",
        }),
        createTextLayer(truncate(benefit, 36), {
          x: 50,
          y: 58,
          fontSize: 24,
          fontFamily: "montserrat",
          color: "#b8ff00",
          variant: "pill",
          backgroundColor: "rgba(5,5,5,0.75)",
        }),
        createTextLayer(cta, {
          x: 50,
          y: 90,
          fontSize: 26,
          fontFamily: "oswald",
          color: "#050505",
          variant: "pill",
          backgroundColor: "#b8ff00",
          bold: true,
        }),
      ].map((l) => ensureTextFitsSafeArea(normalizeLayer(l))),
      comp
    );
  }

  if (comp === "luxury_minimal" || comp === "corner_anchor" || comp === "f_left") {
    return finalizeLayerLayout(
      [
        createTextLayer(product, {
          x: 14,
          y: 14 + (seed % 3),
          fontSize: 48,
          fontFamily: "playfair",
          color: "#FFFFFF",
          align: "left",
          italic: true,
          strokeWidth: 1,
          strokeColor: "#050505",
        }),
        createTextLayer(truncate(hook, 40), {
          x: 14,
          y: 30,
          fontSize: 22,
          fontFamily: "montserrat",
          color: "#D4AF37",
          align: "left",
        }),
        createTextLayer(cta, {
          x: 14,
          y: 90,
          fontSize: 24,
          fontFamily: "oswald",
          color: "#050505",
          align: "left",
          variant: "pill",
          backgroundColor: "#ffe600",
          bold: true,
        }),
      ].map((l) => ensureTextFitsSafeArea(normalizeLayer(l))),
      comp
    );
  }

  if (comp === "lower_third" || comp === "stacked_center") {
    return finalizeLayerLayout(
      [
        createTextLayer(truncate(hook, 32), {
          x: 50,
          y: 66,
          fontSize: 28,
          fontFamily: "oswald",
          color: "#ffe600",
          letterSpacing: 2,
        }),
        createTextLayer(product, {
          x: 50,
          y: 76,
          fontSize: 58,
          fontFamily: seed % 2 === 0 ? "bebas" : "anton",
          color: "#FFFFFF",
          strokeWidth: 2,
          strokeColor: "#050505",
        }),
        createTextLayer(cta, {
          x: 50,
          y: 90,
          fontSize: 26,
          fontFamily: "montserrat",
          color: "#050505",
          variant: "pill",
          backgroundColor: "#b8ff00",
          bold: true,
        }),
      ].map((l) => ensureTextFitsSafeArea(normalizeLayer(l))),
      comp
    );
  }

  return finalizeLayerLayout(
    [
      createTextLayer(truncate(hook, 36), {
        x: 50,
        y: 18 + (seed % 4),
        fontSize: 30,
        fontFamily: "montserrat",
        color: "#b8ff00",
        bold: true,
        variant: "pill",
        backgroundColor: "rgba(5,5,5,0.8)",
      }),
      createTextLayer(product, {
        x: 50,
        y: 40,
        fontSize: 64,
        fontFamily: "bebas",
        color: "#FFFFFF",
        strokeWidth: 3,
        strokeColor: "#050505",
        rotation: seed % 4 === 0 ? -3 : 0,
      }),
      createTextLayer(truncate(benefit, 40), {
        x: 50,
        y: 56,
        fontSize: 22,
        fontFamily: "montserrat",
        color: "#FFFFFF",
      }),
      createTextLayer(cta, {
        x: 50,
        y: 90,
        fontSize: 26,
        fontFamily: "oswald",
        color: "#050505",
        variant: "pill",
        backgroundColor: "#ffe600",
        bold: true,
      }),
    ].map((l) => ensureTextFitsSafeArea(normalizeLayer(l))),
    comp
  );
}

/** @deprecated use buildSmartFallback */
function buildFallbackLayers(params: {
  aiBrief: string;
  productName?: string;
  discountPercent?: number | null;
}): TextLayer[] {
  const direction = pickDirectionForBrief(params);
  return buildSmartFallback(params, direction, null);
}

export function inferImageLayoutStyle(_brief: string): ImageLayoutStyle {
  return "creative";
}

export async function suggestImageTextBlocks(params: {
  aiBrief: string;
  productName?: string;
  discountPercent?: number | null;
  priceText?: string | null;
}): Promise<ImageTextBlocks | null> {
  const layers = await suggestImageTextLayers(params);
  if (!layers.length) return null;
  return {
    headline: layers[0]?.text ?? "",
    highlight: layers[1]?.text,
    bullets: layers.slice(2, -1).map((l) => l.text),
    cta: layers.at(-1)?.text,
  };
}

export function imageTextBlocksToLayers(
  blocks: ImageTextBlocks,
  _style?: ImageLayoutStyle
): TextLayer[] {
  return [
    createTextLayer(blocks.headline, { y: 15, fontSize: 64, fontFamily: "bebas", color: "#FFF" }),
    ...(blocks.highlight
      ? [createTextLayer(blocks.highlight, { y: 32, fontSize: 28, fontFamily: "montserrat", color: "#b8ff00" })]
      : []),
    ...(blocks.bullets?.map((b, i) =>
      createTextLayer(b, {
        y: 50 + i * 8,
        fontSize: 22,
        fontFamily: "montserrat",
        color: "#FFF",
        variant: "pill",
        backgroundColor: "rgba(5,5,5,0.7)",
      })
    ) ?? []),
    ...(blocks.cta
      ? [
          createTextLayer(blocks.cta, {
            y: 90,
            fontSize: 26,
            fontFamily: "oswald",
            color: "#050505",
            variant: "pill",
            backgroundColor: "#b8ff00",
          }),
        ]
      : []),
  ].map((l) => normalizeLayer(l));
}
