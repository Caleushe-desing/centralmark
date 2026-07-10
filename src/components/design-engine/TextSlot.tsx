"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AdCopySlots, CompositionLayout, SlotKey, SlotRule } from "@/lib/design-engine/composition/rules";
import {
  computeFitFontSizePx,
  ellipsisEditorial,
  parseFontSizePx,
} from "@/lib/design-engine/fit-text/measure";
import {
  alignClass,
  buildSlotStyle,
  slotMaxLines,
  slotMaxWidthPx,
  slotText,
} from "./utils";

const TYPOGRAPHIC_CTA_CLASS =
  "inline-block tracking-[0.28em] text-[length:inherit] border-b border-white/40 pb-1";

const DROP_ACCENTS = new Set(["grid-break-box", "impact-italic", "mega-discount", "glass-urgency"]);
const SPOTLIGHT_ACCENTS = new Set(["ultra-light", "hairline-frame"]);
const PROMO_ACCENTS = new Set(["promo-numeral", "color-curated-block"]);

interface TextSlotProps {
  slotKey: SlotKey;
  rule: SlotRule;
  copy: AdCopySlots;
  layout: CompositionLayout;
}

function AccentWrapper({
  rule,
  layout,
  children,
}: {
  rule: SlotRule;
  layout: CompositionLayout;
  children: ReactNode;
}) {
  const accent = rule.accent ?? "none";

  if (accent === "grid-break-box") {
    return (
      <div className={`max-w-full ${alignClass(rule.align)}`}>
        <div className="inline-block px-4 py-2 bg-black/90 border-l-[3px] border-[var(--ad-accent)] -ml-3">
          {children}
        </div>
      </div>
    );
  }

  if (accent === "impact-italic") {
    return (
      <div className={`max-w-full ${alignClass(rule.align)}`}>
        <div className="inline-block italic [text-shadow:0_3px_0_#000,0_6px_28px_rgba(0,0,0,0.85)]">
          {children}
        </div>
      </div>
    );
  }

  if (accent === "mega-discount") {
    return (
      <div className={`w-full ${alignClass(rule.align)}`}>
        <div
          className="inline-block leading-[0.88] tracking-tight"
          style={{ color: layout.palette.contrast, textShadow: "0 4px 0 rgba(0,0,0,0.9)" }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (accent === "glass-urgency") {
    return <div className={`w-full ${alignClass(rule.align)}`}>{children}</div>;
  }

  if (accent === "ultra-light") {
    return (
      <div className={`max-w-full ${alignClass(rule.align)}`}>
        <div className="font-extralight tracking-[0.2em] opacity-95">{children}</div>
      </div>
    );
  }

  if (accent === "hairline-frame") {
    return (
      <div className={`max-w-full ${alignClass(rule.align)}`}>
        <div className="inline-block border-t border-b border-white/25 py-2 px-6">{children}</div>
      </div>
    );
  }

  if (accent === "serif-masthead") {
    return (
      <div className={`max-w-full ${alignClass(rule.align)}`}>
        <div className="tracking-[0.32em] text-[var(--ad-accent)]">{children}</div>
      </div>
    );
  }

  if (accent === "italic-deck") {
    return (
      <div className={`max-w-full ${alignClass(rule.align)}`}>
        <div className="[&_p]:font-serif">{children}</div>
      </div>
    );
  }

  if (accent === "promo-numeral") {
    return (
      <div className={`${alignClass(rule.align)}`}>
        <div
          className="inline-block leading-none tabular-nums"
          style={{ color: layout.palette.contrast }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (accent === "color-curated-block") {
    return (
      <div className={`max-w-full ${alignClass(rule.align)}`}>
        <div className="inline-block px-4 py-2 rounded-md bg-[var(--ad-accent)]/25 border border-[var(--ad-accent)]/40">
          {children}
        </div>
      </div>
    );
  }

  if (accent === "vertical-line") {
    return (
      <div className={`flex items-stretch gap-5 max-w-full ${alignClass(rule.align)}`}>
        <div
          className="w-px shrink-0 self-stretch min-h-[2.5rem] opacity-90"
          style={{ backgroundColor: layout.palette.accent }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    );
  }

  if (accent === "color-dot") {
    return (
      <div className={`flex items-center gap-3 max-w-full ${alignClass(rule.align)}`}>
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: layout.palette.accent }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    );
  }

  if (accent === "hairline-above") {
    return (
      <div
        className={`max-w-full pt-5 mt-2 border-t border-white/25 ${alignClass(rule.align)} ${rule.wrapperClassName ?? ""}`}
      >
        {children}
      </div>
    );
  }

  if (accent === "typographic-cta") {
    return (
      <div className={`max-w-full ${alignClass(rule.align)} ${rule.wrapperClassName ?? ""}`}>
        <span className={TYPOGRAPHIC_CTA_CLASS}>{children}</span>
      </div>
    );
  }

  if (rule.wrapperClassName?.trim()) {
    return <div className={`max-w-full ${alignClass(rule.align)} ${rule.wrapperClassName}`}>{children}</div>;
  }

  return <div className={`w-fit max-w-full min-w-0 ${alignClass(rule.align)}`}>{children}</div>;
}

export function TextSlot({ slotKey, rule, copy, layout }: TextSlotProps) {
  const rawText = slotText(copy, slotKey);
  const pRef = useRef<HTMLParagraphElement>(null);
  const [fitPx, setFitPx] = useState<number | null>(null);

  const token = layout.typography[slotKey];
  const basePx = parseFontSizePx(token.fontSize);
  const maxWidth = slotMaxWidthPx(rule);
  const accent = rule.accent ?? "none";
  const maxLines =
    accent === "mega-discount" || accent === "promo-numeral"
      ? 1
      : accent === "impact-italic"
        ? 3
        : slotMaxLines(slotKey);
  const maxChars =
    slotKey === "hook"
      ? layout.archetype === "drop"
        ? 64
        : 48
      : slotKey === "subtext" && (accent === "mega-discount" || accent === "promo-numeral")
        ? 12
        : slotKey === "subtext"
          ? 120
          : 40;
  const text = ellipsisEditorial(rawText, maxChars);

  useLayoutEffect(() => {
    if (!text) return;
    if (accent === "mega-discount" || accent === "promo-numeral") {
      setFitPx(basePx);
      return;
    }
    const minRatio =
      accent === "impact-italic" ? 0.62 : accent === "ultra-light" ? 0.8 : accent === "grid-break-box" ? 0.75 : 0.45;
    const fitted = computeFitFontSizePx({
      text,
      baseFontSizePx: basePx,
      minFontSizePx: Math.max(12, basePx * minRatio),
      maxWidthPx: maxWidth,
      maxLines,
      fontFamily: token.fontFamily,
      fontWeight: token.fontWeight,
      letterSpacingPx: token.letterSpacing ? parseFontSizePx(token.letterSpacing, 1) : 0,
    });
    setFitPx(fitted);
  }, [text, basePx, maxWidth, maxLines, token.fontFamily, token.fontWeight, token.letterSpacing, accent]);

  if (!text) return null;

  const isTypographicCta = rule.accent === "typographic-cta";
  const skipDefaultShadow =
    DROP_ACCENTS.has(accent) || SPOTLIGHT_ACCENTS.has(accent) || PROMO_ACCENTS.has(accent);

  return (
    <AccentWrapper rule={rule} layout={layout}>
      <p
        ref={pRef}
        style={{
          ...buildSlotStyle(token, layout.palette.accent, fitPx ?? basePx),
          fontStyle: token.fontStyle,
          WebkitLineClamp: maxLines,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
        className={[
          rule.className,
          "break-words",
          isTypographicCta || skipDefaultShadow ? "" : "drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]",
          accent === "italic-deck" && slotKey === "hook" ? "italic" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-slot={slotKey}
      >
        {text}
      </p>
    </AccentWrapper>
  );
}

interface DecorativeLayerProps {
  layout: CompositionLayout;
}

export function DecorativeLayer({ layout }: DecorativeLayerProps) {
  if (!layout.decorative) return null;

  if (layout.decorative.type === "light-streaks") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-[36%] left-[-5%] right-[-5%] h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent rotate-[-2deg]" />
        <div className="absolute top-[40%] left-[-5%] right-[-5%] h-[2px] bg-gradient-to-r from-transparent via-red-500/55 to-transparent rotate-[1deg]" />
      </div>
    );
  }

  if (layout.decorative.type === "spotlight-cross") {
    return (
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-16 left-14 right-14 h-px bg-white/20" />
        <div className="absolute bottom-16 left-14 right-14 h-px bg-white/20" />
        <div className="absolute top-20 bottom-20 left-1/2 w-px bg-white/10" />
      </div>
    );
  }

  return <div className={layout.decorative.className} aria-hidden />;
}
