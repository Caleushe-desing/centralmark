/** Recorta el concepto de imagen para caber en el límite del generador (enhancer añade ~600 chars más). */
export function clampImageConcept(text: string, maxLength = 600): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxLength) return trimmed;

  const cut = trimmed.slice(0, maxLength);
  const lastPeriod = cut.lastIndexOf(".");
  if (lastPeriod > maxLength * 0.55) {
    return cut.slice(0, lastPeriod + 1).trim();
  }

  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.55) {
    return cut.slice(0, lastSpace).trim();
  }

  return cut.trim();
}
