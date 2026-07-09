import OpenAI from "openai";
import { censorBadWords, censorFields } from "@/lib/moderation/censor";

export interface ModerationResult {
  approved: boolean;
  correctedText?: string;
  issues: string[];
}

export interface UserContentFields {
  productName?: string;
  description?: string;
  offerHashtags?: string;
  aiBrief?: string;
}

export interface ModeratedUserContent {
  approved: boolean;
  issues: string[];
  fields: UserContentFields;
}

const BLOCKED_CATEGORIES = [
  "sexual",
  "sexual/minors",
  "hate",
  "hate/threatening",
  "harassment",
  "harassment/threatening",
  "violence",
  "violence/graphic",
  "self-harm",
  "self-harm/intent",
  "self-harm/instructions",
];

const BASIC_BLOCKED_PATTERNS = [
  /\b(put[oa]s?|weon|wea\b|maric[oa]|nazi|imbecil|pendej[oa]|conchet[ua]|ctm\b|fuck|shit|asshole|bitch)\b/i,
  /\b(comunista de m|facho de m|perra\b|zorra\b|negro de m|indio de m|sidoso|retrasad[oa])\b/i,
  /\b(gay de m|marica\b|bicha\b|trolo\b|travesti de m)\b/i,
  /\b(porno|sexo expl[ií]cito|desnud[oa]|masturb)\b/i,
];

const FIELD_LABELS: Record<keyof UserContentFields, string> = {
  productName: "Producto",
  description: "Descripción",
  offerHashtags: "Hashtags",
  aiBrief: "Instrucciones para la IA",
};

export async function moderateUserContent(
  fields: UserContentFields
): Promise<ModeratedUserContent> {
  const pre = censorFields({
    productName: fields.productName,
    description: fields.description,
    offerHashtags: fields.offerHashtags,
    aiBrief: fields.aiBrief,
  });

  if (pre.blocked) {
    return {
      approved: false,
      issues: [pre.blockedReason ?? "Contenido no permitido"],
      fields: pre.fields,
    };
  }

  const issues: string[] = [];
  const corrected: UserContentFields = { ...pre.fields };

  for (const key of Object.keys(pre.fields) as (keyof UserContentFields)[]) {
    const value = pre.fields[key]?.trim();
    if (!value) continue;

    const result = await moderateOfferText(value, key === "offerHashtags");
    if (!result.approved) {
      const label = FIELD_LABELS[key];
      for (const issue of result.issues) {
        issues.push(`${label}: ${issue}`);
      }
    } else if (result.correctedText && key !== "offerHashtags") {
      corrected[key] = result.correctedText;
    }
  }

  return {
    approved: issues.length === 0,
    issues,
    fields: corrected,
  };
}

export async function moderateOfferText(
  text: string,
  hashtagsOnly = false
): Promise<ModerationResult> {
  const censored = censorBadWords(text);
  if (censored.blocked) {
    return { approved: false, issues: [censored.blockedReason ?? "Contenido no permitido"] };
  }
  const workingText = censored.censored ? censored.text : text;

  const basic = basicFilter(workingText);
  if (!basic.approved) return basic;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-...") {
    return { approved: true, correctedText: workingText, issues: [] };
  }

  const openai = new OpenAI({ apiKey });

  try {
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: workingText,
    });

    const result = moderation.results[0];
    const flaggedCategories = BLOCKED_CATEGORIES.filter(
      (cat) => result.categories[cat as keyof typeof result.categories]
    );

    if (flaggedCategories.length > 0) {
      return {
        approved: false,
        issues: [
          "Contenido no permitido: obscenidades, contenido sexual, odio, violencia o discriminación.",
        ],
      };
    }
  } catch {
    return basic;
  }

  if (hashtagsOnly) {
    const hashtagReview = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Revisa hashtags de una publicación comercial de mall.
Rechaza si alguno contiene: obscenidades, insultos, ataques políticos, homofobia, racismo, xenofobia, contenido sexual o discriminatorio.
Responde JSON: {"approved": true/false, "issues": ["..."]}`,
        },
        { role: "user", content: workingText },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = hashtagReview.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content) as ModerationResult;
      return {
        approved: Boolean(parsed.approved),
        issues: parsed.issues ?? [],
      };
    }
    return basic;
  }

  const review = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Eres moderador de contenido para un centro comercial (mall).
Rechaza CUALQUIER texto que contenga:
- Obscenidades o groserías
- Insultos o lenguaje agresivo
- Ataques políticos o propaganda partidista
- Homofobia, transfobia o burlas por orientación/género
- Racismo, xenofobia o discriminación por origen, etnia o apariencia
- Contenido sexual explícito o sugerente inapropiado para retail familiar

Si el texto es apto para una publicación comercial familiar, corrige ortografía y redacción en español latinoamericano sin cambiar el significado comercial.
Responde JSON: {"approved": true/false, "correctedText": "...", "issues": ["motivo claro si rechazas"]}`,
      },
      { role: "user", content: text },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = review.choices[0]?.message?.content;
  if (!content) return basic;

  const parsed = JSON.parse(content) as ModerationResult;
  return {
    approved: Boolean(parsed.approved),
    correctedText: parsed.correctedText ?? workingText,
    issues: parsed.issues ?? [],
  };
}

function basicFilter(text: string): ModerationResult {
  for (const pattern of BASIC_BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        approved: false,
        issues: [
          "El texto contiene palabras o expresiones no permitidas para publicaciones del mall.",
        ],
      };
    }
  }
  return { approved: true, correctedText: text, issues: [] };
}
