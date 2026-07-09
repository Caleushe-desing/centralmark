import fs from "fs/promises";
import path from "path";
import sharp, { type OverlayOptions } from "sharp";
import { publishGeneratedImage } from "@/lib/ftp/upload";
import type { OfferContent } from "./agent";
import {
  craftDallePromptFromBrief,
  generateImageWithDalle,
} from "./image-generator";

export interface VisualInput {
  offerId: string;
  content: OfferContent;
  storeName: string;
  mallName: string;
  storeCategory: string;
  discountPercent: number;
  logoUrl?: string | null;
  aiBrief?: string | null;
  description?: string | null;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function createGradientFallback(): Promise<Buffer> {
  const svg = `
    <svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E11D48"/>
          <stop offset="100%" style="stop-color:#1E1B4B"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1080" fill="url(#g)"/>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Overlay ligero — deja ver casi toda la imagen que generó la IA */
function buildLightOverlaySvg(input: VisualInput): string {
  const { content, storeName, mallName } = input;
  return `
    <svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bar" x1="0" y1="780" x2="0" y2="1080" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.75"/>
        </linearGradient>
      </defs>
      <rect x="0" y="780" width="1080" height="300" fill="url(#bar)"/>
      <text x="540" y="870" text-anchor="middle" fill="#FB7185" font-size="72" font-weight="900">${escapeXml(content.headline)}</text>
      <text x="540" y="930" text-anchor="middle" fill="white" font-size="32" font-weight="600">${escapeXml(content.subheadline)}</text>
      <text x="540" y="980" text-anchor="middle" fill="white" font-size="20" opacity="0.85">${escapeXml(storeName)} · ${escapeXml(mallName)}</text>
      <text x="540" y="1020" text-anchor="middle" fill="white" font-size="18" font-weight="700">${escapeXml(content.cta)}</text>
    </svg>`;
}

export async function composeOfferImage(input: VisualInput): Promise<string> {
  const outputDir = path.join(process.cwd(), "public", "generated");
  await fs.mkdir(outputDir, { recursive: true });

  const filename = `offer-${input.offerId}.png`;
  const outputPath = path.join(outputDir, filename);

  const dallePrompt = await craftDallePromptFromBrief({
    aiBrief: input.aiBrief ?? input.content.backgroundPrompt,
    description: input.description,
    productName: input.content.subheadline,
    discountPercent: input.discountPercent,
    storeName: input.storeName,
    storeCategory: input.storeCategory,
  });

  let baseBuffer =
    (await generateImageWithDalle(dallePrompt)) ?? (await createGradientFallback());

  let pipeline = sharp(baseBuffer).resize(1080, 1080, { fit: "cover" });

  const composites: OverlayOptions[] = [];

  if (input.logoUrl) {
    try {
      const logoPath = path.join(process.cwd(), "public", input.logoUrl.replace(/^\//, ""));
      const logo = await sharp(logoPath)
        .resize(100, 100, { fit: "contain" })
        .png()
        .toBuffer();
      composites.push({ input: logo, top: 24, left: 956 });
    } catch {
      // optional
    }
  }

  if (composites.length) {
    pipeline = pipeline.composite(composites);
  }

  const withLogo = await pipeline.png().toBuffer();
  const overlaySvg = Buffer.from(buildLightOverlaySvg(input));

  await sharp(withLogo)
    .composite([{ input: overlaySvg, top: 0, left: 0 }])
    .png()
    .toFile(outputPath);

  const localPath = `/generated/${filename}`;
  return publishGeneratedImage(localPath);
}

export { craftDallePromptFromBrief, generateImageWithDalle };
