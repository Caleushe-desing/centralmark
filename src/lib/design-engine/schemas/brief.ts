import { z } from "zod";
import { ARCHETYPE_IDS } from "../archetypes";

export const campaignBriefSchema = z.object({
  brief: z.string().min(10, "Describe tu publicación con más detalle").max(1200),
  imageSource: z.enum(["ai", "upload"]).default("ai"),
  userImageUrl: z.string().min(1).max(500).optional(),
  clientRequestId: z.string().uuid().optional(),
  /** La IA infiere el estilo; solo para compatibilidad interna */
  archetype: z.enum(ARCHETYPE_IDS).optional(),
});

export type CampaignBriefInput = z.infer<typeof campaignBriefSchema>;

/** @deprecated */
export const proAdInputSchema = campaignBriefSchema;
export type ProAdInput = CampaignBriefInput;
