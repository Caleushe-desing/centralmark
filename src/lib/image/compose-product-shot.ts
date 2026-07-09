import sharp from "sharp";

const SIZE = 1080;

async function createStudioBackground(): Promise<Buffer> {
  const svg = `
    <svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="45%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
        <radialGradient id="spot" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
      <ellipse cx="540" cy="520" rx="420" ry="380" fill="url(#spot)"/>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Producto recortado centrado sobre fondo tipo estudio (1080×1080) */
export async function composeProductShot(productPng: Buffer): Promise<Buffer> {
  const background = await createStudioBackground();

  const product = await sharp(productPng)
    .ensureAlpha()
    .resize(Math.round(SIZE * 0.82), Math.round(SIZE * 0.82), {
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  const meta = await sharp(product).metadata();
  const w = meta.width ?? SIZE;
  const h = meta.height ?? SIZE;
  const left = Math.round((SIZE - w) / 2);
  const top = Math.round((SIZE - h) / 2 + SIZE * 0.02);

  const shadow = await sharp(product)
    .blur(18)
    .modulate({ brightness: 0.15 })
    .png()
    .toBuffer();

  const shadowMeta = await sharp(shadow).metadata();
  const sw = shadowMeta.width ?? w;
  const sh = shadowMeta.height ?? h;
  const shadowLeft = Math.round((SIZE - sw) / 2);
  const shadowTop = Math.round(top + h * 0.92);

  return sharp(background)
    .composite([
      { input: shadow, left: shadowLeft, top: shadowTop, blend: "multiply" },
      { input: product, left, top },
    ])
    .png()
    .toBuffer();
}
