const ANGLICISM_REPLACEMENTS: Array<[RegExp, string]> = [
 [/\bOFF\b/gi, "DTO"],
 [/\bSALE\b/gi, "REBAJA"],
 [/\bSHOP\s*NOW\b/gi, "COMPRA YA"],
 [/\bSHOP\b/gi, "COMPRA"],
 [/\bNEW\b/gi, "NUEVO"],
 [/\bLIMITED\b/gi, "LIMITADO"],
 [/\bEXCLUSIVE\b/gi, "EXCLUSIVO"],
 [/\bBUY\b/gi, "COMPRA"],
 [/\bGET\b/gi, "OBTÉN"],
 [/\bFREE\b/gi, "GRATIS"],
 [/\bDEAL\b/gi, "OFERTA"],
 [/\bFLASH\b/gi, "FLASH"],
];

/** Limpieza ligera de anglicismos frecuentes en copy visible */
export function sanitizeSpanishCopy(text: string): string {
  let out = text.trim();
  for (const [pattern, replacement] of ANGLICISM_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}
