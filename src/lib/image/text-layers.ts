import { buildOutletInstagramLayers } from "./promo-templates";
import { drawAccentRibbon, drawPromoScrims } from "./promo-overlays";
import { drawStoreLogoOnCanvas, type LogoLayer } from "./store-logo";

export type TextVariant = "text" | "badge" | "pill";

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  fontFamily: string;
  rotation: number;
  align: "left" | "center" | "right";
  opacity: number;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string | null;
  letterSpacing: number;
  variant: TextVariant;
  badgeColor: string | null;
}

export const FONT_FAMILIES = [
  { id: "impact", label: "Impacto", css: 'Impact, "Arial Black", sans-serif' },
  { id: "bebas", label: "Bebas", css: '"Bebas Neue", Impact, sans-serif' },
  { id: "anton", label: "Anton", css: 'Anton, Impact, sans-serif' },
  { id: "oswald", label: "Oswald", css: 'Oswald, sans-serif' },
  { id: "montserrat", label: "Montserrat", css: 'Montserrat, sans-serif' },
  { id: "playfair", label: "Elegante", css: '"Playfair Display", Georgia, serif' },
  { id: "pacifico", label: "Script", css: 'Pacifico, cursive' },
  { id: "system", label: "Moderna", css: 'system-ui, -apple-system, sans-serif' },
] as const;

export const TEXT_COLORS = [
  { id: "rose", value: "#FB7185", label: "Rosa" },
  { id: "red", value: "#EF4444", label: "Rojo" },
  { id: "orange", value: "#F97316", label: "Naranja" },
  { id: "yellow", value: "#FACC15", label: "Amarillo" },
  { id: "lime", value: "#84CC16", label: "Lima" },
  { id: "green", value: "#22C55E", label: "Verde" },
  { id: "cyan", value: "#06B6D4", label: "Cian" },
  { id: "blue", value: "#3B82F6", label: "Azul" },
  { id: "indigo", value: "#6366F1", label: "Índigo" },
  { id: "purple", value: "#A855F7", label: "Morado" },
  { id: "white", value: "#FFFFFF", label: "Blanco" },
  { id: "silver", value: "#CBD5E1", label: "Plata" },
  { id: "black", value: "#111827", label: "Negro" },
  { id: "gold", value: "#D4AF37", label: "Dorado" },
] as const;

export const TEXT_PRESETS = [
  "OUTLET",
  "LIQUIDACIÓN",
  "SOLO HOY",
  "ÚLTIMAS UNIDADES",
  "2x1",
  "ENVÍO GRATIS",
  "BLACK FRIDAY",
  "CYBER DAY",
] as const;

export function getFontCss(fontFamilyId: string): string {
  return FONT_FAMILIES.find((f) => f.id === fontFamilyId)?.css ?? FONT_FAMILIES[0].css;
}

export function normalizeLayer(layer: Partial<TextLayer> & Pick<TextLayer, "id" | "text">): TextLayer {
  return {
    id: layer.id,
    text: layer.text,
    x: layer.x ?? 50,
    y: layer.y ?? 50,
    fontSize: layer.fontSize ?? 64,
    color: layer.color ?? "#FFFFFF",
    bold: layer.bold ?? true,
    italic: layer.italic ?? false,
    fontFamily: layer.fontFamily ?? "impact",
    rotation: layer.rotation ?? 0,
    align: layer.align ?? "center",
    opacity: layer.opacity ?? 1,
    strokeColor: layer.strokeColor ?? "#000000",
    strokeWidth: layer.strokeWidth ?? 0,
    backgroundColor: layer.backgroundColor ?? null,
    letterSpacing: layer.letterSpacing ?? 0,
    variant: layer.variant ?? "text",
    badgeColor: layer.badgeColor ?? null,
  };
}

export function createTextLayer(
  text: string,
  overrides?: Partial<Omit<TextLayer, "id" | "text">>
): TextLayer {
  return normalizeLayer({
    id: crypto.randomUUID(),
    text,
    ...overrides,
  });
}

export function buildDefaultLayers(
  discountPercent?: number,
  productName?: string
): TextLayer[] {
  if (discountPercent) {
    return buildOutletInstagramLayers(discountPercent);
  }

  const layers: TextLayer[] = [];

  if (productName) {
    layers.push(
      createTextLayer(productName.slice(0, 48), {
        x: 50,
        y: 82,
        fontSize: 44,
        color: "#FFFFFF",
        fontFamily: "montserrat",
        backgroundColor: "rgba(0,0,0,0.55)",
      })
    );
  }

  return layers;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });
}

async function ensureFontsReady(layers: TextLayer[]) {
  const families = new Set(layers.map((l) => getFontCss(l.fontFamily)));
  await Promise.all(
    [...families].map((family) =>
      document.fonts.load(`900 48px ${family}`).catch(() => undefined)
    )
  );
  await document.fonts.ready;
}

function drawTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer, size: number) {
  const x = (layer.x / 100) * size;
  const y = (layer.y / 100) * size;
  const weight = layer.bold ? "700" : "400";
  const style = layer.italic ? "italic" : "normal";
  const font = `${style} ${weight} ${layer.fontSize}px ${getFontCss(layer.fontFamily)}`;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.font = font;
  ctx.textAlign = layer.align;
  ctx.textBaseline = "middle";
  ctx.letterSpacing = `${layer.letterSpacing}px`;

  const lines = layer.text.split("\n");
  const lineHeight = layer.fontSize * 1.15;
  const blockHeight = lines.length * lineHeight;
  const startY = -blockHeight / 2 + lineHeight / 2;

  let maxWidth = 0;
  for (const line of lines) {
    maxWidth = Math.max(maxWidth, ctx.measureText(line).width);
  }

  if (layer.variant === "badge") {
    const radius = layer.fontSize * 1.05;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = layer.badgeColor ?? "#F97316";
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 5;
    ctx.stroke();
  } else if (layer.backgroundColor || layer.variant === "pill") {
    const padX = 20;
    const padY = 12;
    let boxX = -maxWidth / 2 - padX;
    if (layer.align === "left") boxX = -padX;
    if (layer.align === "right") boxX = -maxWidth - padX;
    ctx.fillStyle = layer.backgroundColor ?? (layer.variant === "pill" ? "#EA580C" : "#000000");
    const radius = layer.variant === "pill" ? 28 : 10;
    const bw = maxWidth + padX * 2;
    const bh = blockHeight + padY * 2;
    const bx = boxX;
    const by = -blockHeight / 2 - padY;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, radius);
    ctx.fill();
  }

  for (let i = 0; i < lines.length; i++) {
    const ly = startY + i * lineHeight;
    const line = lines[i];

    if (layer.strokeWidth > 0) {
      ctx.strokeStyle = layer.strokeColor;
      ctx.lineWidth = layer.strokeWidth;
      ctx.lineJoin = "round";
      ctx.strokeText(line, 0, ly);
    }

    ctx.fillStyle = layer.color;
    ctx.shadowColor = "rgba(0,0,0,0.75)";
    ctx.shadowBlur = Math.max(4, layer.fontSize * 0.1);
    ctx.shadowOffsetY = 2;
    ctx.fillText(line, 0, ly);
  }

  ctx.restore();
}

export async function exportRawImage(
  imageUrl: string,
  size = 1080,
  logoUrl?: string | null,
  logoLayer?: LogoLayer | null
): Promise<Blob> {
  if (typeof document === "undefined") {
    return fetch(imageUrl).then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar la imagen");
      return r.blob();
    });
  }

  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return fetch(imageUrl).then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar la imagen");
      return r.blob();
    });
  }

  const scale = Math.max(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

  if (logoUrl && logoLayer) {
    await drawStoreLogoOnCanvas(ctx, logoUrl, logoLayer, size);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (out) => (out ? resolve(out) : reject(new Error("No se pudo exportar"))),
      "image/png",
      1
    );
  });
}

export async function exportComposedImage(
  imageUrl: string,
  layers: TextLayer[],
  size = 1080,
  logoUrl?: string | null,
  logoLayer?: LogoLayer | null,
  options?: { promoScrims?: boolean; accentRibbon?: boolean }
): Promise<Blob> {
  await ensureFontsReady(layers);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  const img = await loadImage(imageUrl);
  const scale = Math.max(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

  const usePromo = options?.promoScrims ?? layers.length > 0;
  if (usePromo) {
    drawPromoScrims(ctx, size);
    if (options?.accentRibbon) {
      drawAccentRibbon(ctx, size);
    }
  }

  for (const layer of layers) {
    drawTextLayer(ctx, normalizeLayer(layer), size);
  }

  if (logoUrl && logoLayer) {
    await drawStoreLogoOnCanvas(ctx, logoUrl, logoLayer, size);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo exportar"))),
      "image/png",
      1
    );
  });
}
