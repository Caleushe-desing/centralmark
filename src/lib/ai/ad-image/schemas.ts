import { z } from "zod";

export const adImageSizeSchema = z.enum(["1024x1024", "1024x1792"]);

export type AdImageSize = z.infer<typeof adImageSizeSchema>;

export const adImageInputSchema = z.object({
  concept: z.string().min(5, "El concepto debe tener al menos 5 caracteres").max(800),
  product: z.string().min(2, "El producto es obligatorio").max(200),
  size: adImageSizeSchema.default("1024x1024"),
  lighting: z
    .enum(["studio-soft", "dramatic-chiaroscuro", "bright-editorial", "auto"])
    .default("auto"),
});

export type AdImageInput = z.infer<typeof adImageInputSchema>;

export type AdImageResult = {
  imageUrl: string;
  revisedPrompt: string;
  enhancedPrompt: string;
  size: AdImageSize;
  metadata: {
    model: string;
    quality: string;
    /** Estilo natural aplicado vía prompt (la API ya no acepta style=natural) */
    style: "natural";
    revisedPromptSource: "openai" | "enhanced";
    generatedAt: string;
    durationMs: number;
  };
};
