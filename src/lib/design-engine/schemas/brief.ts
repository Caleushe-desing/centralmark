import { z } from "zod";
import { COPY_MODE_IDS, DEFAULT_COPY_MODE } from "../copy-modes";

export const campaignBriefSchema = z.object({
  brief: z.string().min(3, "Escribe qué quieres promocionar").max(500),
  copyMode: z.enum(COPY_MODE_IDS).optional().default(DEFAULT_COPY_MODE),
});

export type CampaignBriefInput = z.infer<typeof campaignBriefSchema>;

/** @deprecated */
export const proAdInputSchema = campaignBriefSchema;
export type ProAdInput = CampaignBriefInput;
