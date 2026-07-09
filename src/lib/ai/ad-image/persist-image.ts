import fs from "fs/promises";
import path from "path";

export async function persistAdImageBuffer(buffer: Buffer): Promise<{
  publicUrl: string;
  absolutePath: string;
}> {
  const dir = path.join(process.cwd(), "public", "generated", "ad-images");
  await fs.mkdir(dir, { recursive: true });
  const filename = `ad-${Date.now()}.png`;
  const absolutePath = path.join(dir, filename);
  await fs.writeFile(absolutePath, buffer);
  return {
    publicUrl: `/generated/ad-images/${filename}`,
    absolutePath,
  };
}

export async function persistAdImageBase64(b64: string): Promise<{
  publicUrl: string;
  dataUrl: string;
}> {
  const buffer = Buffer.from(b64, "base64");
  const { publicUrl } = await persistAdImageBuffer(buffer);
  return {
    publicUrl,
    dataUrl: `data:image/png;base64,${b64}`,
  };
}
