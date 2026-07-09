import OpenAI from "openai";
import { z } from "zod";
import {
  createTextLayer,
  normalizeLayer,
  type TextLayer,
} from "@/lib/image/text-layers";
import {
  analyzeMarketingStrategy,
  designPublicationWithStrategy,
  pickDirectionForBrief,
} from "@/lib/ai/digital-designer";

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

const creativeDesignSchema = z.object({
  composition: z.string().optional(),
  marketingTechnique: z.string().optional(),
  layers: z
    .array(
      z.object({
        text: z.string(),
        x: z.number(),
        y: z.number(),
        fontSize: z.number(),
        fontFamily: z.enum(FONT_IDS),
        color: z.string(),
        bold: z.boolean().optional(),
        italic: z.boolean().optional(),
        align: z.enum(["left", "center", "right"]).optional(),
        strokeWidth: z.number().optional(),
        strokeColor: z.string().optional(),
        backgroundColor: z.string().nullable().optional(),
        variant: z.enum(["text", "badge", "pill"]).optional(),
        badgeColor: z.string().nullable().optional(),
        letterSpacing: z.number().optional(),
        rotation: z.number().optional(),
      })
    )
    .min(3)
    .max(7),
});

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

function normalizeCreativeLayers(raw: z.infer<typeof creativeDesignSchema>["layers"]): TextLayer[] {
  const layers = raw.map((layer) => {
    let text = applyLocalSpanishFixes(truncate(layer.text, 56));
    let variant = layer.variant ?? "text";

    if (variant === "badge" && text.length > 10) {
      variant = "pill";
    }

    return normalizeLayer(
      createTextLayer(text, {
        x: clamp(layer.x, 8, 92),
        y: clamp(layer.y, 8, 94),
        fontSize: clamp(layer.fontSize, 18, 110),
        fontFamily: FONT_IDS.includes(layer.fontFamily as (typeof FONT_IDS)[number])
          ? layer.fontFamily
          : "montserrat",
        color: layer.color,
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
  });

  return separateOverlappingLayers(layers);
}

function separateOverlappingLayers(layers: TextLayer[]): TextLayer[] {
  const sorted = [...layers].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const gap = curr.fontSize > 50 || prev.fontSize > 50 ? 9 : 7;
    if (curr.y - prev.y < gap) {
      curr.y = clamp(prev.y + gap, 8, 94);
    }
  }
  return sorted;
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

  if (!designJson) return buildFallbackLayers(params);

  try {
    const design = creativeDesignSchema.parse(JSON.parse(designJson));
    const layers = normalizeCreativeLayers(design.layers);
    if (layers.length < 3) return buildFallbackLayers(params);
    const proofread = await proofreadLayerTexts(layers, params.aiBrief);
    return separateOverlappingLayers(proofread);
  } catch {
    return buildFallbackLayers(params);
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
Misma cantidad de textos, mismo orden. No cambies diseño ni alargues mucho.`,
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

/** Solo si falla la IA — variante pseudoaleatoria, no plantilla fija */
function buildFallbackLayers(params: {
  aiBrief: string;
  productName?: string;
  discountPercent?: number | null;
}): TextLayer[] {
  const direction = pickDirectionForBrief(params);
  const seed = direction.variationSeed;
  const variants = [
    () => fallbackAsymmetric(params, seed),
    () => fallbackBottomHeavy(params, seed),
    () => fallbackCenterHero(params, seed),
  ];
  return variants[seed % variants.length]();
}

function fallbackAsymmetric(
  params: { productName?: string; discountPercent?: number | null },
  seed: number
): TextLayer[] {
  const name = truncate(params.productName ?? "Oferta", 28);
  const layers = [
    createTextLayer(name.toUpperCase(), {
      x: 14,
      y: 14 + (seed % 4),
      fontSize: 58,
      fontFamily: "bebas",
      color: "#FFFFFF",
      align: "left",
      strokeWidth: 2,
      strokeColor: "#050505",
    }),
    createTextLayer("Calidad que destaca", {
      x: 14,
      y: 28,
      fontSize: 22,
      fontFamily: "montserrat",
      color: "#b8ff00",
      align: "left",
      bold: true,
    }),
  ];
  if (params.discountPercent != null) {
    layers.push(
      createTextLayer(`-${params.discountPercent}%`, {
        x: 82,
        y: 18,
        fontSize: 48,
        fontFamily: "anton",
        color: "#050505",
        variant: "badge",
        badgeColor: "#ffe600",
      })
    );
  }
  layers.push(
    createTextLayer("Ver más", {
      x: 14,
      y: 90,
      fontSize: 24,
      fontFamily: "oswald",
      color: "#050505",
      align: "left",
      variant: "pill",
      backgroundColor: "#b8ff00",
      bold: true,
    })
  );
  return separateOverlappingLayers(layers.map((l) => normalizeLayer(l)));
}

function fallbackBottomHeavy(
  params: { productName?: string },
  seed: number
): TextLayer[] {
  return separateOverlappingLayers(
    [
      createTextLayer("Nuevo", {
        x: 50,
        y: 62 + (seed % 3),
        fontSize: 32,
        fontFamily: "oswald",
        color: "#ffe600",
        letterSpacing: 4,
      }),
      createTextLayer(truncate(params.productName ?? "Colección", 24), {
        x: 50,
        y: 72,
        fontSize: 64,
        fontFamily: "playfair",
        color: "#FFFFFF",
        italic: true,
        strokeWidth: 1,
        strokeColor: "#050505",
      }),
      createTextLayer("Descúbrelo hoy", {
        x: 50,
        y: 90,
        fontSize: 26,
        fontFamily: "montserrat",
        color: "#050505",
        variant: "pill",
        backgroundColor: "#b8ff00",
        bold: true,
      }),
    ].map((l) => normalizeLayer(l))
  );
}

function fallbackCenterHero(
  params: { productName?: string; discountPercent?: number | null },
  seed: number
): TextLayer[] {
  const layers = [
    createTextLayer(truncate(params.productName ?? "Oferta especial", 30), {
      x: 50,
      y: 38 + (seed % 5),
      fontSize: 72,
      fontFamily: seed % 2 === 0 ? "bebas" : "anton",
      color: "#FFFFFF",
      strokeWidth: 3,
      strokeColor: "#050505",
      rotation: seed % 3 === 0 ? -3 : 0,
    }),
    createTextLayer("Edición limitada", {
      x: 50,
      y: 52,
      fontSize: 20,
      fontFamily: "montserrat",
      color: "#FFFFFF",
      variant: "pill",
      backgroundColor: "rgba(5,5,5,0.65)",
    }),
    createTextLayer("Consíguelo ahora", {
      x: 50,
      y: 88,
      fontSize: 24,
      fontFamily: "oswald",
      color: "#050505",
      variant: "pill",
      backgroundColor: "#ffe600",
      bold: true,
    }),
  ];
  return separateOverlappingLayers(layers.map((l) => normalizeLayer(l)));
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
