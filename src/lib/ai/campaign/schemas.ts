import { z } from "zod";

export const adCampaignInputSchema = z.object({
  product: z.string().min(2, "El producto es obligatorio").max(200),
  targetAudience: z.string().min(2, "El público objetivo es obligatorio").max(300),
  brandTone: z.string().min(2, "El tono de marca es obligatorio").max(120),
  campaignGoals: z.string().min(2, "Los objetivos son obligatorios").max(400),
  platform: z.enum(["instagram", "facebook", "both"]).default("instagram"),
  locale: z.string().default("es-CL"),
  storeName: z.string().max(120).optional(),
  category: z.string().max(80).optional(),
});

export type AdCampaignInput = z.infer<typeof adCampaignInputSchema>;

export const adCampaignOutputSchema = z.object({
  campaignName: z.string(),
  aida: z.object({
    attention: z.object({
      hooks: z.array(z.string()).min(2).max(5),
    }),
    interest: z.object({
      body: z.string(),
      keyPoints: z.array(z.string()).min(2).max(5),
    }),
    desire: z.object({
      emotionalTriggers: z.array(z.string()).min(1).max(4),
      socialProof: z.string(),
    }),
    action: z.object({
      ctas: z.array(z.string()).min(2).max(4),
    }),
  }),
  adVariants: z
    .array(
      z.object({
        id: z.string(),
        hook: z.string(),
        body: z.string(),
        cta: z.string(),
        platform: z.enum(["instagram", "facebook", "both"]),
      })
    )
    .min(2)
    .max(4),
  imagePrompts: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        prompt: z.string(),
        style: z.string(),
        aspectRatio: z.literal("1:1"),
        mood: z.string(),
        negativePrompt: z.string(),
      })
    )
    .min(2)
    .max(4),
  hashtags: z.array(z.string()).min(4).max(12),
});

export type AdCampaignOutput = z.infer<typeof adCampaignOutputSchema>;

/**
 * JSON Schema para Structured Outputs (strict mode).
 * Debe mantenerse alineado con adCampaignOutputSchema.
 */
export const AD_CAMPAIGN_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "campaignName",
    "aida",
    "adVariants",
    "imagePrompts",
    "hashtags",
  ],
  properties: {
    campaignName: { type: "string" },
    aida: {
      type: "object",
      additionalProperties: false,
      required: ["attention", "interest", "desire", "action"],
      properties: {
        attention: {
          type: "object",
          additionalProperties: false,
          required: ["hooks"],
          properties: {
            hooks: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 5,
            },
          },
        },
        interest: {
          type: "object",
          additionalProperties: false,
          required: ["body", "keyPoints"],
          properties: {
            body: { type: "string" },
            keyPoints: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 5,
            },
          },
        },
        desire: {
          type: "object",
          additionalProperties: false,
          required: ["emotionalTriggers", "socialProof"],
          properties: {
            emotionalTriggers: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 4,
            },
            socialProof: { type: "string" },
          },
        },
        action: {
          type: "object",
          additionalProperties: false,
          required: ["ctas"],
          properties: {
            ctas: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 4,
            },
          },
        },
      },
    },
    adVariants: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "hook", "body", "cta", "platform"],
        properties: {
          id: { type: "string" },
          hook: { type: "string" },
          body: { type: "string" },
          cta: { type: "string" },
          platform: { type: "string", enum: ["instagram", "facebook", "both"] },
        },
      },
    },
    imagePrompts: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "title",
          "prompt",
          "style",
          "aspectRatio",
          "mood",
          "negativePrompt",
        ],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          prompt: { type: "string" },
          style: { type: "string" },
          aspectRatio: { type: "string", enum: ["1:1"] },
          mood: { type: "string" },
          negativePrompt: { type: "string" },
        },
      },
    },
    hashtags: {
      type: "array",
      items: { type: "string" },
      minItems: 4,
      maxItems: 12,
    },
  },
} as const;

export type AdCampaignResult = AdCampaignOutput & {
  metadata: {
    model: string;
    generatedAt: string;
    durationMs: number;
  };
};
