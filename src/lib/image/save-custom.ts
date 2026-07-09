import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { publishGeneratedImage } from "@/lib/ftp/upload";

export async function saveCustomOfferImage(
  offerId: string,
  imageBuffer: Buffer
): Promise<string> {
  const outputDir = path.join(process.cwd(), "public", "generated");
  await fs.mkdir(outputDir, { recursive: true });

  const filename = `offer-${offerId}.png`;
  const outputPath = path.join(outputDir, filename);

  await sharp(imageBuffer).resize(1080, 1080, { fit: "cover" }).png().toFile(outputPath);

  const localPath = `/generated/${filename}`;
  return publishGeneratedImage(localPath);
}
