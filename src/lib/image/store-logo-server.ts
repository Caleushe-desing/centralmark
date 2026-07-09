import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { createDefaultLogoLayer, STORE_LOGO_CANVAS_SIZE } from "./store-logo";

/** Superpone el logo de la tienda sobre una imagen PNG/JPEG (servidor). */
export async function overlayStoreLogoOnImage(
  imageBuffer: Buffer,
  logoUrl: string | null | undefined,
  canvasSize = STORE_LOGO_CANVAS_SIZE
): Promise<Buffer> {
  if (!logoUrl?.trim()) return imageBuffer;

  try {
    const logoPath = path.join(process.cwd(), "public", logoUrl.replace(/^\//, ""));
    await fs.access(logoPath);

    const layer = createDefaultLogoLayer();
    const w = layer.size;
    const h = layer.size;
    const cx = (layer.x / 100) * canvasSize;
    const cy = (layer.y / 100) * canvasSize;
    const x = Math.round(cx - w / 2);
    const y = Math.round(cy - h / 2);
    const pad = 6;
    const logo = await sharp(logoPath).resize(w, h, { fit: "inside" }).png().toBuffer();

    const badgeSvg = Buffer.from(
      `<svg width="${w + pad * 2}" height="${h + pad * 2}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" rx="10" ry="10" fill="rgba(255,255,255,0.92)"/>
      </svg>`
    );

    const base = await sharp(imageBuffer)
      .resize(canvasSize, canvasSize, { fit: "cover" })
      .png()
      .toBuffer();

    return sharp(base)
      .composite([
        { input: badgeSvg, top: y - pad, left: x - pad },
        { input: logo, top: y, left: x },
      ])
      .png()
      .toBuffer();
  } catch {
    return imageBuffer;
  }
}
