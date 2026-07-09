import { createTextLayer, type TextLayer } from "./text-layers";

/** Plantilla estilo publicación Instagram outlet (como referencia Gemini) */
export function buildOutletInstagramLayers(
  discountPercent = 30,
  subtitle = "EN TODOS LOS PARES"
): TextLayer[] {
  return [
    createTextLayer("¡OUTLET!", {
      x: 50,
      y: 20,
      fontSize: 78,
      fontFamily: "bebas",
      color: "#FFFFFF",
      strokeWidth: 4,
      strokeColor: "#111827",
      letterSpacing: 3,
    }),
    createTextLayer(`-${discountPercent}%`, {
      x: 50,
      y: 46,
      fontSize: 88,
      fontFamily: "anton",
      color: "#FFFFFF",
      variant: "badge",
      badgeColor: "#F97316",
      strokeWidth: 0,
    }),
    createTextLayer(subtitle, {
      x: 50,
      y: 60,
      fontSize: 34,
      fontFamily: "oswald",
      color: "#FFFFFF",
      variant: "pill",
      backgroundColor: "#EA580C",
      bold: true,
      letterSpacing: 2,
    }),
    createTextLayer("OFERTA LIMITADA", {
      x: 50,
      y: 88,
      fontSize: 28,
      fontFamily: "montserrat",
      color: "#F8FAFC",
      backgroundColor: "rgba(0,0,0,0.55)",
      bold: true,
    }),
  ];
}

export function isOutletStyleBrief(brief: string): boolean {
  return /outlet|liquidaci|oferta|descuento|\d+\s*%|promo/i.test(brief);
}
