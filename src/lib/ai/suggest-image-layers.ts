import OpenAI from "openai";
import { z } from "zod";
import { createTextLayer, type TextLayer } from "@/lib/image/text-layers";
import { isOutletStyleBrief } from "@/lib/image/promo-templates";

const blocksSchema = z.object({
  headline: z.string(),
  highlight: z.string().optional(),
  bullets: z.array(z.string()).max(4).optional(),
  cta: z.string().optional(),
});

export type ImageTextBlocks = z.infer<typeof blocksSchema>;
export type ImageLayoutStyle = "retail" | "service" | "food";

const LIMITS = {
  headline: 48,
  highlight: 28,
  bullet: 32,
  cta: 28,
} as const;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-...") return null;
  return new OpenAI({ apiKey });
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim();
}

/** Correcciones locales frecuentes en español chileno */
function applyLocalSpanishFixes(text: string): string {
  const fixes: [RegExp, string][] = [
    [/\bsesion\b/gi, "sesión"],
    [/\bdiagnostico\b/gi, "diagnóstico"],
    [/\baplicacion\b/gi, "aplicación"],
    [/\bpaginas\b/gi, "páginas"],
    [/\bpagina\b/gi, "página"],
    [/\bdiseno\b/gi, "diseño"],
    [/\btecnologia\b/gi, "tecnología"],
    [/\bmas\b/gi, "más"],
    [/\btambien\b/gi, "también"],
    [/\bunico\b/gi, "único"],
    [/\bunica\b/gi, "única"],
    [/\benvio\b/gi, "envío"],
    [/\bultimas\b/gi, "últimas"],
    [/\bultimo\b/gi, "último"],
    [/\brapido\b/gi, "rápido"],
    [/\brapida\b/gi, "rápida"],
    [/\belectronico\b/gi, "electrónico"],
    [/\belectronica\b/gi, "electrónica"],
    [/\bexclusivo\b/gi, "exclusivo"],
    [/\bliquidacion\b/gi, "liquidación"],
    [/\bpromocion\b/gi, "promoción"],
    [/\boferta limitada\b/gi, "oferta limitada"],
  ];
  let out = text;
  for (const [pattern, replacement] of fixes) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function normalizeBlocks(blocks: ImageTextBlocks): ImageTextBlocks {
  return {
    headline: applyLocalSpanishFixes(truncate(blocks.headline, LIMITS.headline)),
    highlight: blocks.highlight
      ? applyLocalSpanishFixes(truncate(blocks.highlight, LIMITS.highlight))
      : undefined,
    bullets: blocks.bullets
      ?.map((b) => applyLocalSpanishFixes(truncate(b, LIMITS.bullet)))
      .filter(Boolean)
      .slice(0, 3),
    cta: blocks.cta
      ? applyLocalSpanishFixes(truncate(blocks.cta, LIMITS.cta))
      : undefined,
  };
}

export function inferImageLayoutStyle(brief: string): ImageLayoutStyle {
  const b = brief.toLowerCase();
  if (
    /web|software|página|pagina|sitio|app|digital|marketing|servicio|consultor|desarrollo|tienda online|e-?commerce|hosting|seo\b|redes sociales/i.test(
      b
    )
  ) {
    return "service";
  }
  if (/restaur|comida|gastronom|chef|menú|menu|café|cafe|bar\b|pasteler/i.test(b)) {
    return "food";
  }
  return "retail";
}

function layoutHint(style: ImageLayoutStyle, brief: string): string {
  if (style === "service") {
    return `Estilo SERVICIO/TECNOLOGÍA: tono profesional y confiable. Titular sobre valor (ej. "Tu web lista", "Presencia digital"). Bullets: beneficios concretos (rápido, personalizado, soporte). CTA: "Cotiza hoy", "Más info" o similar. NO uses "OUTLET" ni lenguaje de tienda física salvo que el brief lo pida.`;
  }
  if (style === "food") {
    return `Estilo GASTRONOMÍA: titular apetitoso y cercano. Bullets: sabor, ingredientes, horario o delivery. CTA invitando a visitar o pedir.`;
  }
  if (isOutletStyleBrief(brief)) {
    return `Estilo OUTLET/PROMO: titular impactante (¡OUTLET!, ¡OFERTA!). Highlight con % OFF o precio si aplica. Bullets cortos.`;
  }
  return `Estilo RETAIL: titular impactante con nombre del producto u oferta. Highlight con % OFF o precio si aplica. Bullets cortos de beneficios.`;
}

export async function suggestImageTextBlocks(params: {
  aiBrief: string;
  productName?: string;
  discountPercent?: number | null;
  priceText?: string | null;
}): Promise<ImageTextBlocks | null> {
  const openai = getOpenAI();
  if (!openai || !params.aiBrief.trim()) return null;

  const style = inferImageLayoutStyle(params.aiBrief);
  const promoHint =
    params.discountPercent != null
      ? `Descuento explícito: ${params.discountPercent}%`
      : params.priceText
        ? `Precio: ${params.priceText}`
        : "Sin % de descuento — no inventes porcentajes";

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres copywriter de piezas publicitarias para Instagram en Chile.
Genera textos CORTOS para superponer sobre una foto (ortografía PERFECTA en español de Chile).

JSON:
{
  "headline": "titular grande (máx 48 caracteres)",
  "highlight": "dato clave opcional: % OFF, precio, 2x1, etc. Solo si aplica",
  "bullets": ["beneficio 1", "beneficio 2", "beneficio 3"],
  "cta": "llamado a la acción corto"
}

${layoutHint(style, params.aiBrief)}

Reglas estrictas:
- Tildes correctas: sesión, diagnóstico, aplicación, páginas, más, también, envío, últimas, diseño, tecnología
- NO copies el brief literal; resume en frases comerciales claras
- headline impactante; bullets de 2-5 palabras cada uno
- Si no hay descuento %, highlight puede ser precio o frase clave (o omitir)
- Sin emojis en el JSON
- Sin comillas tipográficas raras; usa español simple`,
        },
        {
          role: "user",
          content: `Brief:\n${params.aiBrief}\n\nProducto/servicio: ${params.productName ?? "oferta"}\n${promoHint}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.35,
    });

    const raw = res.choices[0]?.message?.content;
    if (!raw) return null;
    const draft = blocksSchema.parse(JSON.parse(raw));
    const proofread = await proofreadImageTextBlocks(draft, params.aiBrief);
    return normalizeBlocks(proofread);
  } catch {
    return null;
  }
}

async function proofreadImageTextBlocks(
  blocks: ImageTextBlocks,
  brief: string
): Promise<ImageTextBlocks> {
  const openai = getOpenAI();
  if (!openai) return blocks;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.05,
      messages: [
        {
          role: "system",
          content: `Corrector ortográfico para anuncios Instagram en español chileno.
Revisa tildes, ñ y errores comunes. NO cambies el significado ni alargues textos.
Mantén la misma estructura JSON: headline, highlight (opcional), bullets (opcional), cta (opcional).
Si un campo está bien escrito, déjalo igual.`,
        },
        {
          role: "user",
          content: `Contexto del anuncio:\n${brief}\n\nTextos a corregir:\n${JSON.stringify(blocks, null, 2)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = res.choices[0]?.message?.content;
    if (!raw) return blocks;
    return blocksSchema.parse(JSON.parse(raw));
  } catch {
    return blocks;
  }
}

export function imageTextBlocksToLayers(
  blocks: ImageTextBlocks,
  style: ImageLayoutStyle = "retail"
): TextLayer[] {
  if (style === "service") {
    return serviceStyleLayers(blocks);
  }
  if (style === "food") {
    return foodStyleLayers(blocks);
  }
  return retailStyleLayers(blocks);
}

function retailStyleLayers(blocks: ImageTextBlocks): TextLayer[] {
  const layers: TextLayer[] = [];

  layers.push(
    createTextLayer(blocks.headline.toUpperCase(), {
      x: 50,
      y: 14,
      fontSize: 64,
      fontFamily: "bebas",
      color: "#FFFFFF",
      strokeWidth: 4,
      strokeColor: "#020617",
      letterSpacing: 3,
    })
  );

  if (blocks.highlight?.trim()) {
    layers.push(
      createTextLayer(blocks.highlight.trim().toUpperCase(), {
        x: 50,
        y: 32,
        fontSize: 56,
        fontFamily: "anton",
        color: "#050505",
        variant: "badge",
        badgeColor: "#ffe600",
        strokeWidth: 0,
      })
    );
  }

  const bullets = blocks.bullets?.filter(Boolean) ?? [];
  const startY = blocks.highlight ? 50 : 38;
  bullets.slice(0, 3).forEach((bullet, i) => {
    layers.push(
      createTextLayer(`✓ ${bullet}`, {
        x: 50,
        y: startY + i * 8.5,
        fontSize: 24,
        fontFamily: "montserrat",
        color: "#F8FAFC",
        variant: "pill",
        backgroundColor: "rgba(2,6,23,0.78)",
        bold: true,
      })
    );
  });

  if (blocks.cta?.trim()) {
    layers.push(
      createTextLayer(blocks.cta.trim().toUpperCase(), {
        x: 50,
        y: 91,
        fontSize: 28,
        fontFamily: "oswald",
        color: "#050505",
        variant: "pill",
        backgroundColor: "#b8ff00",
        bold: true,
        letterSpacing: 2,
      })
    );
  }

  return layers;
}

function serviceStyleLayers(blocks: ImageTextBlocks): TextLayer[] {
  const layers: TextLayer[] = [];

  layers.push(
    createTextLayer(blocks.headline, {
      x: 50,
      y: 14,
      fontSize: 52,
      fontFamily: "montserrat",
      color: "#FFFFFF",
      strokeWidth: 2,
      strokeColor: "#0F172A",
      bold: true,
      letterSpacing: 0.5,
    })
  );

  if (blocks.highlight?.trim()) {
    layers.push(
      createTextLayer(blocks.highlight.trim(), {
        x: 50,
        y: 30,
        fontSize: 36,
        fontFamily: "oswald",
        color: "#E0F2FE",
        variant: "pill",
        backgroundColor: "rgba(37,99,235,0.88)",
        bold: true,
      })
    );
  }

  const bullets = blocks.bullets?.filter(Boolean) ?? [];
  const startY = blocks.highlight ? 48 : 38;
  bullets.slice(0, 3).forEach((bullet, i) => {
    layers.push(
      createTextLayer(`• ${bullet}`, {
        x: 50,
        y: startY + i * 8.5,
        fontSize: 24,
        fontFamily: "system",
        color: "#F1F5F9",
        variant: "pill",
        backgroundColor: "rgba(15,23,42,0.7)",
        bold: false,
      })
    );
  });

  if (blocks.cta?.trim()) {
    layers.push(
      createTextLayer(blocks.cta.trim(), {
        x: 50,
        y: 90,
        fontSize: 28,
        fontFamily: "oswald",
        color: "#FFFFFF",
        variant: "pill",
        backgroundColor: "#b8ff00",
        bold: true,
      })
    );
  }

  return layers;
}

function foodStyleLayers(blocks: ImageTextBlocks): TextLayer[] {
  const layers: TextLayer[] = [];

  layers.push(
    createTextLayer(blocks.headline, {
      x: 50,
      y: 15,
      fontSize: 54,
      fontFamily: "playfair",
      color: "#FFFFFF",
      strokeWidth: 2,
      strokeColor: "#451A03",
      italic: true,
    })
  );

  if (blocks.highlight?.trim()) {
    layers.push(
      createTextLayer(blocks.highlight.trim(), {
        x: 50,
        y: 32,
        fontSize: 44,
        fontFamily: "anton",
        color: "#FFFFFF",
        variant: "badge",
        badgeColor: "#DC2626",
      })
    );
  }

  const bullets = blocks.bullets?.filter(Boolean) ?? [];
  const startY = blocks.highlight ? 50 : 42;
  bullets.slice(0, 3).forEach((bullet, i) => {
    layers.push(
      createTextLayer(bullet, {
        x: 50,
        y: startY + i * 9,
        fontSize: 25,
        fontFamily: "montserrat",
        color: "#FFFBEB",
        variant: "pill",
        backgroundColor: "rgba(120,53,15,0.8)",
        bold: true,
      })
    );
  });

  if (blocks.cta?.trim()) {
    layers.push(
      createTextLayer(blocks.cta.trim(), {
        x: 50,
        y: 90,
        fontSize: 28,
        fontFamily: "oswald",
        color: "#FFFFFF",
        variant: "pill",
        backgroundColor: "#B45309",
        bold: true,
      })
    );
  }

  return layers;
}

export async function suggestImageTextLayers(params: {
  aiBrief: string;
  productName?: string;
  discountPercent?: number | null;
  priceText?: string | null;
}): Promise<TextLayer[]> {
  const blocks = await suggestImageTextBlocks(params);
  if (!blocks) return [];
  const style = inferImageLayoutStyle(params.aiBrief);
  return imageTextBlocksToLayers(blocks, style);
}
