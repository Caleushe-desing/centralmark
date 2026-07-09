import { createTextLayer, normalizeLayer, type TextLayer } from "@/lib/image/text-layers";
import type { LayerRole } from "@/lib/image/layer-layout";

export type ProTemplate = "agency-bold" | "agency-editorial" | "agency-promo";

export interface PublicationCopy {
  hook?: string;
  headline?: string;
  benefit?: string;
  cta?: string;
  badge?: string;
}

export function pickProTemplate(
  brief: string,
  discountPercent?: number | null
): ProTemplate {
  if (discountPercent != null) return "agency-promo";
  if (/web|software|app|servicio|consultor|diseño|premium|artesan|lujo|profesional/i.test(brief)) {
    return "agency-editorial";
  }
  return "agency-bold";
}

function truncate(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.45 ? cut.slice(0, lastSpace) : cut).trim();
}

function detectRoleFromLayer(layer: TextLayer, index: number, total: number): LayerRole {
  if (layer.variant === "badge") return "badge";
  if (index === total - 1 || layer.variant === "pill" || layer.y >= 78) return "cta";
  if (index === 0) return "hook";
  if (index === 1 || layer.fontSize >= 44) return "headline";
  return "benefit";
}

/** Extrae solo el copy de las capas IA — ignora estilos amateur */
export function extractCopyFromLayers(layers: TextLayer[]): PublicationCopy {
  const sorted = [...layers].sort((a, b) => a.y - b.y);
  const copy: PublicationCopy = {};

  sorted.forEach((layer, index) => {
    const role = detectRoleFromLayer(layer, index, sorted.length);
    const text = layer.text.trim();
    if (!text) return;
    if (role === "badge" && !copy.badge) copy.badge = text;
    else if (role === "hook" && !copy.hook) copy.hook = text;
    else if (role === "headline" && !copy.headline) copy.headline = text;
    else if (role === "benefit" && !copy.benefit) copy.benefit = text;
    else if (role === "cta" && !copy.cta) copy.cta = text;
    else if (!copy.benefit) copy.benefit = text;
  });

  return copy;
}

export function buildCopyFromStrategy(params: {
  aiBrief: string;
  productName?: string;
  discountPercent?: number | null;
  priceText?: string | null;
  strategy?: {
    copyAngles?: string[];
    mainMessage?: string;
    ctaSuggestion?: string;
  } | null;
}): PublicationCopy {
  const hook =
    params.strategy?.copyAngles?.[0] ??
    params.aiBrief.split(/[.!?\n]/)[0]?.trim() ??
    params.productName ??
    "Oferta especial";

  return {
    hook: truncate(hook, 32),
    headline: truncate(params.productName ?? hook, 26),
    benefit: truncate(
      params.strategy?.mainMessage ?? params.aiBrief.split(/[.!?\n]/)[1]?.trim() ?? hook,
      38
    ),
    cta: truncate(params.strategy?.ctaSuggestion ?? "Conoce más", 18),
    badge:
      params.discountPercent != null
        ? `-${params.discountPercent}%`
        : params.priceText
          ? truncate(params.priceText, 12)
          : undefined,
  };
}

/** Construye publicación con estilo de agencia — tipografía y color curados */
export function buildProfessionalLayers(
  copy: PublicationCopy,
  template: ProTemplate
): TextLayer[] {
  if (template === "agency-promo") {
    return [
      createTextLayer(truncate(copy.hook ?? "¡OFERTA!", 18).toUpperCase(), {
        x: 50,
        y: 16,
        fontSize: 64,
        fontFamily: "bebas",
        color: "#FFFFFF",
        letterSpacing: 4,
        strokeWidth: 2,
        strokeColor: "#050505",
      }),
      ...(copy.badge
        ? [
            createTextLayer(copy.badge, {
              x: 50,
              y: 40,
              fontSize: 80,
              fontFamily: "anton",
              color: "#050505",
              variant: "badge",
              badgeColor: "#ffe600",
            }),
          ]
        : []),
      createTextLayer(truncate(copy.benefit ?? copy.headline ?? "", 28).toUpperCase(), {
        x: 50,
        y: copy.badge ? 58 : 46,
        fontSize: 28,
        fontFamily: "oswald",
        color: "#FFFFFF",
        variant: "pill",
        backgroundColor: "rgba(5,5,5,0.88)",
        bold: true,
        letterSpacing: 2,
      }),
      createTextLayer(truncate(copy.cta ?? "Aprovecha ahora", 18), {
        x: 50,
        y: 88,
        fontSize: 26,
        fontFamily: "oswald",
        color: "#050505",
        variant: "pill",
        backgroundColor: "#b8ff00",
        bold: true,
      }),
    ].map((l) => normalizeLayer(l));
  }

  if (template === "agency-editorial") {
    return [
      createTextLayer(truncate(copy.hook ?? "", 28).toUpperCase(), {
        x: 12,
        y: 14,
        fontSize: 18,
        fontFamily: "oswald",
        color: "#D4AF37",
        align: "left",
        letterSpacing: 4,
        bold: true,
      }),
      createTextLayer(truncate(copy.headline ?? copy.hook ?? "", 30), {
        x: 12,
        y: 28,
        fontSize: 52,
        fontFamily: "playfair",
        color: "#FFFFFF",
        align: "left",
        italic: true,
        strokeWidth: 0,
      }),
      createTextLayer(truncate(copy.benefit ?? "", 42), {
        x: 12,
        y: 46,
        fontSize: 22,
        fontFamily: "montserrat",
        color: "#E5E5E5",
        align: "left",
        backgroundColor: "rgba(5,5,5,0.55)",
      }),
      createTextLayer(truncate(copy.cta ?? "Solicitar info", 18), {
        x: 12,
        y: 90,
        fontSize: 24,
        fontFamily: "oswald",
        color: "#050505",
        align: "left",
        variant: "pill",
        backgroundColor: "#b8ff00",
        bold: true,
      }),
    ].map((l) => normalizeLayer(l));
  }

  // agency-bold — estilo retail / servicios general
  return [
    createTextLayer(truncate(copy.hook ?? "", 24).toUpperCase(), {
      x: 50,
      y: 14,
      fontSize: 20,
      fontFamily: "oswald",
      color: "#b8ff00",
      letterSpacing: 3,
      variant: "pill",
      backgroundColor: "rgba(5,5,5,0.9)",
      bold: true,
    }),
    createTextLayer(truncate(copy.headline ?? "", 28).toUpperCase(), {
      x: 50,
      y: 34,
      fontSize: 68,
      fontFamily: "bebas",
      color: "#FFFFFF",
      strokeWidth: 0,
      letterSpacing: 1,
    }),
  ...(copy.badge
    ? [
        createTextLayer(copy.badge, {
          x: 84,
          y: 16,
          fontSize: 44,
          fontFamily: "anton",
          color: "#050505",
          variant: "badge",
          badgeColor: "#ffe600",
        }),
      ]
    : []),
    createTextLayer(truncate(copy.benefit ?? "", 40), {
      x: 50,
      y: 54,
      fontSize: 24,
      fontFamily: "montserrat",
      color: "#FFFFFF",
      variant: "pill",
      backgroundColor: "rgba(5,5,5,0.75)",
    }),
    createTextLayer(truncate(copy.cta ?? "Ver más", 18), {
      x: 50,
      y: 88,
      fontSize: 26,
      fontFamily: "oswald",
      color: "#050505",
      variant: "pill",
      backgroundColor: "#ffe600",
      bold: true,
    }),
  ].map((l) => normalizeLayer(l));
}

export function layersFromAiOrStrategy(
  aiLayers: TextLayer[],
  params: {
    aiBrief: string;
    productName?: string;
    discountPercent?: number | null;
    priceText?: string | null;
    strategy?: {
      copyAngles?: string[];
      mainMessage?: string;
      ctaSuggestion?: string;
    } | null;
  }
): TextLayer[] {
  const template = pickProTemplate(params.aiBrief, params.discountPercent);
  const fromAi = extractCopyFromLayers(aiLayers);
  const fromStrategy = buildCopyFromStrategy(params);

  const copy: PublicationCopy = {
    hook: fromAi.hook || fromStrategy.hook,
    headline: fromAi.headline || params.productName || fromStrategy.headline,
    benefit: fromAi.benefit || fromStrategy.benefit,
    cta: fromAi.cta || fromStrategy.cta,
    badge: fromAi.badge || fromStrategy.badge,
  };

  return buildProfessionalLayers(copy, template);
}
