import OpenAI, { toFile } from "openai";

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1-mini";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-...") return null;
  return new OpenAI({ apiKey });
}

export async function enhanceOfferImage(
  imageBuffer: Buffer,
  aiBrief: string
): Promise<Buffer | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  const prompt = [
    "Enhance this photo for a professional Instagram retail advertisement.",
    aiBrief.trim() || "Make it vibrant, clean, and eye-catching for a shopping mall promotion.",
    "Keep the main product or subject clearly recognizable, including brand logos on products.",
    "No added promotional text or watermarks unless requested in the brief.",
  ].join(" ");

  try {
    const file = await toFile(imageBuffer, "upload.png", { type: "image/png" });
    const result = await openai.images.edit({
      model: IMAGE_MODEL,
      image: file,
      prompt,
      size: "1024x1024",
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) return null;
    return Buffer.from(b64, "base64");
  } catch (err) {
    console.error("Image enhance failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
