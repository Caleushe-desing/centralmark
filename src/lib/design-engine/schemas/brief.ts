import { z } from "zod";

export const campaignBriefSchema = z.object({
  brief: z.string().min(3, "Escribe qué quieres promocionar").max(500),
});

export type CampaignBriefInput = z.infer<typeof campaignBriefSchema>;

/** @deprecated */
export const proAdInputSchema = campaignBriefSchema;
export type ProAdInput = CampaignBriefInput;
