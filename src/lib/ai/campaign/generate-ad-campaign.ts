import {
  getCampaignModel,
  getOpenAIClient,
  OpenAIConfigError,
} from "@/lib/openai/client";
import {
  AIDA_COPYWRITER_SYSTEM_PROMPT,
  buildCampaignUserPrompt,
} from "./prompts";
import {
  adCampaignInputSchema,
  adCampaignOutputSchema,
  AD_CAMPAIGN_JSON_SCHEMA,
  type AdCampaignInput,
  type AdCampaignResult,
} from "./schemas";
import { CampaignGenerationError, mapOpenAIError } from "./errors";
import { campaignLogger } from "./logger";

export type { AdCampaignInput, AdCampaignResult };
export { adCampaignInputSchema, adCampaignOutputSchema };

/**
 * Genera una campaña publicitaria de nivel agencia usando gpt-4o + Structured Outputs.
 */
export async function generateAdCampaign(
  input: AdCampaignInput
): Promise<AdCampaignResult> {
  const startedAt = Date.now();
  const validated = adCampaignInputSchema.parse(input);

  campaignLogger.info("campaign.generation.start", {
    product: validated.product,
    platform: validated.platform,
    locale: validated.locale,
  });

  let client;
  try {
    client = getOpenAIClient();
  } catch (error) {
    if (error instanceof OpenAIConfigError) {
      campaignLogger.error("campaign.generation.config_error", {
        code: error.code,
      });
      throw new CampaignGenerationError(error.message, error.code, 503, {
        cause: error,
      });
    }
    throw error;
  }

  const model = getCampaignModel();

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.72,
      messages: [
        { role: "system", content: AIDA_COPYWRITER_SYSTEM_PROMPT },
        { role: "user", content: buildCampaignUserPrompt(validated) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ad_campaign",
          strict: true,
          schema: AD_CAMPAIGN_JSON_SCHEMA,
        },
      },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      throw new CampaignGenerationError(
        "OpenAI devolvió una respuesta vacía",
        "EMPTY_RESPONSE",
        502
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      campaignLogger.error("campaign.generation.invalid_json", {
        rawPreview: raw.slice(0, 200),
      });
      throw new CampaignGenerationError(
        "JSON inválido en la respuesta del modelo",
        "INVALID_JSON",
        502,
        { cause: parseError }
      );
    }

    const campaign = adCampaignOutputSchema.parse(parsed);
    const durationMs = Date.now() - startedAt;

    const result: AdCampaignResult = {
      ...campaign,
      metadata: {
        model: response.model,
        generatedAt: new Date().toISOString(),
        durationMs,
      },
    };

    campaignLogger.info("campaign.generation.success", {
      model: response.model,
      durationMs,
      variantCount: result.adVariants.length,
      imagePromptCount: result.imagePrompts.length,
      usage: response.usage,
    });

    return result;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const mapped = mapOpenAIError(error);

    campaignLogger.error("campaign.generation.failed", {
      code: mapped.code,
      statusCode: mapped.statusCode,
      durationMs,
      message: mapped.message,
      retryAfterSeconds: mapped.retryAfterSeconds,
    });

    throw mapped;
  }
}
