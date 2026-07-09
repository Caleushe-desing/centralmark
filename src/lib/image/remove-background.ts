import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function removeProductBackground(
  inputBuffer: Buffer,
  filename: string,
  subdir = "products"
): Promise<{ buffer: Buffer; outputPath: string; usedAi: boolean }> {
  const apiKey = process.env.REMOVEBG_API_KEY;

  if (apiKey) {
    const formData = new FormData();
    formData.append("image_file", new Blob([new Uint8Array(inputBuffer)]), filename);
    formData.append("size", "auto");

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: formData,
    });

    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      const outputPath = await saveProcessedImage(buffer, filename, "nobg", subdir);
      return { buffer, outputPath, usedAi: true };
    }
  }

  const processed = await sharp(inputBuffer)
    .trim({ threshold: 15 })
    .png()
    .toBuffer();

  const outputPath = await saveProcessedImage(processed, filename, "nobg", subdir);
  return { buffer: processed, outputPath, usedAi: false };
}

export function isRemoveBgConfigured() {
  return Boolean(process.env.REMOVEBG_API_KEY);
}

async function saveProcessedImage(
  buffer: Buffer,
  originalFilename: string,
  suffix: string,
  subdir: string
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await fs.mkdir(dir, { recursive: true });
  const ext = path.extname(originalFilename) || ".png";
  const base = path.basename(originalFilename, ext);
  const filename = `${base}-${suffix}.png`;
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/uploads/${subdir}/${filename}`;
}
