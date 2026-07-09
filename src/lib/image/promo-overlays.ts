/** Degradados tipo anuncio Instagram para legibilidad del texto */
export function drawPromoScrims(ctx: CanvasRenderingContext2D, size: number) {
  const top = ctx.createLinearGradient(0, 0, 0, size * 0.45);
  top.addColorStop(0, "rgba(2,6,23,0.72)");
  top.addColorStop(0.55, "rgba(2,6,23,0.28)");
  top.addColorStop(1, "rgba(2,6,23,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, size, size * 0.45);

  const bottom = ctx.createLinearGradient(0, size * 0.62, 0, size);
  bottom.addColorStop(0, "rgba(2,6,23,0)");
  bottom.addColorStop(0.45, "rgba(2,6,23,0.35)");
  bottom.addColorStop(1, "rgba(2,6,23,0.7)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, size * 0.62, size, size * 0.38);
}

export function drawAccentRibbon(
  ctx: CanvasRenderingContext2D,
  size: number,
  color = "rgba(249,115,22,0.92)"
) {
  ctx.save();
  ctx.translate(size * 0.5, size * 0.31);
  ctx.rotate(-0.04);
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  const w = size * 0.78;
  const h = size * 0.09;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 6);
  ctx.fill();
  ctx.restore();
}
