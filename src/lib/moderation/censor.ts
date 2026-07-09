/** Palabras que se censuran automáticamente con xxx */
const CENSOR_PATTERNS: RegExp[] = [
  /\b(put[oa]s?|mierda|weon|wea\b|ctm\b|conchet[ua]|pendej[oa]|maric[oa]|imbecil|zorra\b|perra\b)\b/gi,
  /\b(fuck|shit|bitch|asshole|damn)\b/gi,
  /\b(porno|sexo\s+expl[ií]cito)\b/gi,
];

/** Contenido grave — no se censura, se bloquea */
const BLOCK_PATTERNS: RegExp[] = [
  /\b(nazi|hitler)\b/i,
  /\b(negro de m|indio de m|sidoso|retrasad[oa])\b/i,
  /\b(marica\b|trolo\b).*(de m|insulto)/i,
  /\b(comunista de m|facho de m)\b/i,
];

export interface CensorResult {
  text: string;
  censored: boolean;
  blocked: boolean;
  blockedReason?: string;
}

export function censorBadWords(text: string): CensorResult {
  if (!text.trim()) {
    return { text, censored: false, blocked: false };
  }

  for (const pattern of BLOCK_PATTERNS) {
    if (pattern.test(text)) {
      return {
        text,
        censored: false,
        blocked: true,
        blockedReason:
          "Este contenido no está permitido (odio, discriminación o ataques). Elimínalo para continuar.",
      };
    }
  }

  let censored = false;
  let result = text;

  for (const pattern of CENSOR_PATTERNS) {
    const next = result.replace(pattern, (match) => {
      censored = true;
      return "x".repeat(Math.max(3, match.length));
    });
    result = next;
  }

  return { text: result, censored, blocked: false };
}

export function censorFields<T extends Record<string, string | undefined>>(
  fields: T
): { fields: T; censored: boolean; blocked: boolean; blockedReason?: string } {
  let anyCensored = false;
  let blockedReason: string | undefined;
  const out = { ...fields };

  for (const key of Object.keys(fields) as (keyof T)[]) {
    const val = fields[key];
    if (!val) continue;
    const r = censorBadWords(val);
    if (r.blocked) {
      return { fields: out, censored: anyCensored, blocked: true, blockedReason: r.blockedReason };
    }
    if (r.censored) {
      anyCensored = true;
      out[key] = r.text as T[keyof T];
    }
  }

  return { fields: out, censored: anyCensored, blocked: false, blockedReason };
}
