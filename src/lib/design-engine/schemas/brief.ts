import { z } from "zod";
import { ARCHETYPE_IDS, DEFAULT_ARCHETYPE } from "../archetypes";

export const campaignBriefSchema = z.object({
  brief: z.string().min(3, "Escribe qué quieres promocionar").max(500),
  archetype: z.enum(ARCHETYPE_IDS).optional().default(DEFAULT_ARCHETYPE),
});

export type CampaignBriefInput = z.infer<typeof campaignBriefSchema>;

/** @deprecated */
export const proAdInputSchema = campaignBriefSchema;
export type ProAdInput = CampaignBriefInput;
