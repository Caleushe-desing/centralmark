import { loadImage } from "./text-layers";

export const STORE_LOGO_LAYER_ID = "__store_logo__";
export const STORE_LOGO_CANVAS_SIZE = 1080;
export const STORE_LOGO_MAX_PX = 100;
export const STORE_LOGO_MARGIN_PX = 24;

export interface LogoLayer {
  id: typeof STORE_LOGO_LAYER_ID;
  /** Centro horizontal en % del canvas */
  x: number;
  /** Centro vertical en % del canvas */
  y: number;
  /** Lado del cuadro del logo en px (canvas 1080) */
  size: number;
  rotation: number;
  opacity: number;
  showBackground: boolean;
}

export function createDefaultLogoLayer(): LogoLayer {
  const size = STORE_LOGO_MAX_PX;
  const margin = STORE_LOGO_MARGIN_PX;
  const canvas = STORE_LOGO_CANVAS_SIZE;
  return {
    id: STORE_LOGO_LAYER_ID,
    x: ((canvas - size / 2 - margin) / canvas) * 100,
    y: ((size / 2 + margin) / canvas) * 100,
    size,
    rotation: 0,
    opacity: 1,
    showBackground: true,
  };
}

export function normalizeLogoLayer(layer?: Partial<LogoLayer> | null): LogoLayer {
  return { ...createDefaultLogoLayer(), ...layer, id: STORE_LOGO_LAYER_ID };
}

/** Dibuja el logo de la tienda sobre un canvas 2D según posición del usuario. */
export async function drawStoreLogoOnCanvas(
  ctx: CanvasRenderingContext2D,
  logoUrl: string,
  layer: LogoLayer,
  canvasSize = STORE_LOGO_CANVAS_SIZE
): Promise<void> {
  const img = await loadImage(logoUrl);
  const cx = (layer.x / 100) * canvasSize;
  const cy = (layer.y / 100) * canvasSize;
  const box = layer.size;
  const pad = layer.showBackground ? 6 : 0;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;

  if (layer.showBackground) {
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.roundRect(-box / 2 - pad, -box / 2 - pad, box + pad * 2, box + pad * 2, 10);
    ctx.fill();
    ctx.shadowColor = "transparent";
  }

  const fit = Math.min(box / img.width, box / img.height);
  const dw = img.width * fit;
  const dh = img.height * fit;
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}
