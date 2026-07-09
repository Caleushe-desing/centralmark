import { z } from "zod";
import { isValidBackgroundColor, normalizeBackgroundColor, normalizeTextColor } from "./normalize-colors";

export const proAdTypographySchema = z.enum([
  "Inter",
  "Montserrat",
  "Bebas Neue",
  "Oswald",
  "Anton",
  "Playfair Display",
]);

export type ProAdTypography = z.infer<typeof proAdTypographySchema>;

export const proAdFontWeightSchema = z.enum(["normal", "semibold", "bold", "black"]);

export const proAdBackgroundStyleSchema = z.enum([
  "none",
  "solid-hex",
  "glassmorphism",
  "neon-glow",
]);

export const layoutZoneSchema = z.enum(["top", "center", "bottom"]);

export type LayoutZone = z.infer<typeof layoutZoneSchema>;

export const textAlignSchema = z.enum(["left", "center", "right"]);

export type TextAlign = z.infer<typeof textAlignSchema>;

export const layoutElementSchema = z.object({
  id: z.string().min(2).max(48),
  text: z.string().min(1).max(120),
  typography: proAdTypographySchema,
  fontWeight: proAdFontWeightSchema,
  fontSize: z.string().min(3).max(24),
  color: z
    .string()
    .transform(normalizeTextColor)
    .pipe(z.string().regex(/^#[0-9A-Fa-f]{6}$/)),
  layoutZone: layoutZoneSchema,
  textAlign: textAlignSchema,
  backgroundStyle: proAdBackgroundStyleSchema,
  backgroundColor: z
    .string()
    .transform(normalizeBackgroundColor)
    .pipe(z.string().refine(isValidBackgroundColor, { message: "backgroundColor inválido" })),
  textShadow: z.boolean(),
});

export type LayoutElement = z.infer<typeof layoutElementSchema>;

export const proAdInputSchema = z.object({
  brief: z.string().min(3, "Escribe qué quieres promocionar").max(500),
});

export type ProAdInput = z.infer<typeof proAdInputSchema>;

export const proAdCopySchema = z.object({
  imagePrompt: z.string().min(20).max(500),
  caption: z.string().min(20).max(2200),
  layoutElements: z.array(layoutElementSchema).min(2).max(6),
});

export type ProAdCopy = z.infer<typeof proAdCopySchema>;

const LAYOUT_ELEMENT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "text",
    "typography",
    "fontWeight",
    "fontSize",
    "color",
    "layoutZone",
    "textAlign",
    "backgroundStyle",
    "backgroundColor",
    "textShadow",
  ],
  properties: {
    id: { type: "string" },
    text: { type: "string" },
    typography: {
      type: "string",
      enum: ["Inter", "Montserrat", "Bebas Neue", "Oswald", "Anton", "Playfair Display"],
    },
    fontWeight: {
      type: "string",
      enum: ["normal", "semibold", "bold", "black"],
    },
    fontSize: { type: "string" },
    color: { type: "string" },
    layoutZone: { type: "string", enum: ["top", "center", "bottom"] },
    textAlign: { type: "string", enum: ["left", "center", "right"] },
    backgroundStyle: {
      type: "string",
      enum: ["none", "solid-hex", "glassmorphism", "neon-glow"],
    },
    backgroundColor: { type: "string" },
    textShadow: { type: "boolean" },
  },
} as const;

export const PRO_AD_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["imagePrompt", "caption", "layoutElements"],
  properties: {
    imagePrompt: { type: "string" },
    caption: { type: "string" },
    layoutElements: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: LAYOUT_ELEMENT_JSON_SCHEMA,
    },
  },
} as const;

export type ProAdResult = {
  copy: ProAdCopy;
  imageUrl: string;
  metadata: {
    model: string;
    imageModel: string;
    generatedAt: string;
    durationMs: number;
  };
};
