/** Overlays cinematográficos para publicaciones tipo agencia */

const BRAND_BLACK = "rgba(5,5,5,";
const BRAND_NEON = "#b8ff00";

/** Degradados premium para legibilidad del texto */
export function drawPromoScrims(ctx: CanvasRenderingContext2D, size: number) {
  // Viñeta suave en bordes
  const vignette = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.25,
    size / 2,
    size / 2,
    size * 0.72
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.7, "rgba(0,0,0,0.15)");
  vignette.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  // Zona superior — texto del gancho
  const top = ctx.createLinearGradient(0, 0, 0, size * 0.42);
  top.addColorStop(0, `${BRAND_BLACK}0.82)`);
  top.addColorStop(0.5, `${BRAND_BLACK}0.45)`);
  top.addColorStop(1, `${BRAND_BLACK}0)`);
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, size, size * 0.42);

  // Zona inferior — beneficio + CTA
  const bottom = ctx.createLinearGradient(0, size * 0.58, 0, size);
  bottom.addColorStop(0, `${BRAND_BLACK}0)`);
  bottom.addColorStop(0.4, `${BRAND_BLACK}0.4)`);
  bottom.addColorStop(1, `${BRAND_BLACK}0.85)`);
  ctx.fillStyle = bottom;
  ctx.fillRect(0, size * 0.58, size, size * 0.42);
}

/** Línea de acento neón bajo el titular — detalle de agencia */
export function drawAccentLine(ctx: CanvasRenderingContext2D, size: number, yPercent = 38) {
  const y = (yPercent / 100) * size;
  const lineW = size * 0.22;
  const x = (size - lineW) / 2;

  ctx.save();
  ctx.shadowColor = BRAND_NEON;
  ctx.shadowBlur = 12;
  ctx.fillStyle = BRAND_NEON;
  ctx.beginPath();
  ctx.roundRect(x, y, lineW, 3, 2);
  ctx.fill();
  ctx.restore();
}

/** Línea de acento alineada a la izquierda (plantilla editorial) */
export function drawLeftAccentLine(ctx: CanvasRenderingContext2D, size: number, yPercent = 36) {
  const y = (yPercent / 100) * size;
  const x = size * 0.05;
  const lineW = size * 0.18;

  ctx.save();
  ctx.shadowColor = "#D4AF37";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#D4AF37";
  ctx.beginPath();
  ctx.roundRect(x, y, lineW, 2, 1);
  ctx.fill();
  ctx.restore();
}

/** @deprecated Usar drawAccentLine — ribbon naranja se ve amateur */
export function drawAccentRibbon(
  ctx: CanvasRenderingContext2D,
  size: number,
  color = "rgba(184,255,0,0.15)"
) {
  ctx.save();
  ctx.translate(size * 0.5, size * 0.31);
  ctx.rotate(-0.03);
  ctx.fillStyle = color;
  const w = size * 0.65;
  const h = size * 0.055;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 4);
  ctx.fill();
  ctx.restore();
}
