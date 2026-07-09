/**
 * FitText Engine — escala font-size antes de render para evitar rotura de layout.
 * Usa canvas measureText en cliente; heurística por caracteres en SSR.
 */

export interface FitTextOptions {
  text: string;
  baseFontSizePx: number;
  minFontSizePx?: number;
  maxWidthPx: number;
  maxLines?: number;
  fontFamily?: string;
  fontWeight?: string;
  letterSpacingPx?: number;
}

const DEFAULT_MIN = 10;

export function parseFontSizePx(fontSize: string, rootPx = 16): number {
  const trimmed = fontSize.trim();
  if (trimmed.endsWith("rem")) return parseFloat(trimmed) * rootPx;
  if (trimmed.endsWith("px")) return parseFloat(trimmed);
  return parseFloat(trimmed) || 16;
}

function measureLineWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  letterSpacingPx: number
): number {
  if (!text) return 0;
  const chars = [...text];
  let width = 0;
  for (let i = 0; i < chars.length; i++) {
    width += ctx.measureText(chars[i]!).width;
    if (i < chars.length - 1) width += letterSpacingPx;
  }
  return width;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidthPx: number,
  letterSpacingPx: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = words[0]!;

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (measureLineWidth(ctx, candidate, letterSpacingPx) <= maxWidthPx) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i]!;
    }
  }
  lines.push(current);
  return lines;
}

/** Escala binaria hasta caber en maxWidth × maxLines */
export function computeFitFontSizePx(options: FitTextOptions): number {
  const {
    text,
    baseFontSizePx,
    minFontSizePx = DEFAULT_MIN,
    maxWidthPx,
    maxLines = 3,
    fontFamily = "system-ui, sans-serif",
    fontWeight = "400",
    letterSpacingPx = 0,
  } = options;

  if (!text.trim() || maxWidthPx <= 0) return baseFontSizePx;

  if (typeof document === "undefined") {
    return heuristicFitFontSize(text, baseFontSizePx, minFontSizePx, maxWidthPx, maxLines);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return baseFontSizePx;

  let lo = minFontSizePx;
  let hi = baseFontSizePx;
  let best = minFontSizePx;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    ctx.font = `${fontWeight} ${mid}px ${fontFamily}`;
    const lines = wrapLines(ctx, text, maxWidthPx, letterSpacingPx * (mid / baseFontSizePx));

    if (lines.length <= maxLines && lines.every((l) => measureLineWidth(ctx, l, letterSpacingPx * (mid / baseFontSizePx)) <= maxWidthPx)) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return best;
}

/** Heurística SSR / fallback — gracia degradada por longitud */
function heuristicFitFontSize(
  text: string,
  base: number,
  min: number,
  maxWidth: number,
  maxLines: number
): number {
  const charsPerLine = Math.max(8, Math.floor(maxWidth / (base * 0.55)));
  const estimatedLines = Math.ceil(text.length / charsPerLine);
  if (estimatedLines <= maxLines) return base;
  const scale = maxLines / estimatedLines;
  return Math.max(min, Math.floor(base * scale));
}

export function ellipsisEditorial(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars - 1).trimEnd()}…`;
}
