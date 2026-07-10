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

const IMPACT_ACCENT_SET = new Set([
  "glitch-headline",
  "impact-italic",
  "mega-discount",
  "glass-urgency",
]);

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

  if (accent === "glitch-headline") {
    return (
      <div className={`max-w-full ${alignClass(rule.align)}`}>
        <div
          className="inline-block"
          style={{
            textShadow: "2px 0 rgba(0,229,255,0.85), -2px 0 rgba(255,0,128,0.75), 0 2px 20px rgba(0,0,0,0.9)",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (accent === "impact-italic") {
    return (
      <div className={`max-w-full ${alignClass(rule.align)}`}>
        <div className="inline-block italic [text-shadow:0_4px_0_#000,0_8px_32px_rgba(0,0,0,0.85)]">
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
          style={{
            color: layout.palette.contrast,
            textShadow: "0 4px 0 rgba(0,0,0,0.9), 0 0 40px rgba(255,35,50,0.35)",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (accent === "glass-urgency") {
    return (
      <div className={`w-full ${alignClass(rule.align)}`}>
        <div className="text-white/95 font-bold tracking-widest">{children}</div>
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
  const isImpactAccent = IMPACT_ACCENT_SET.has(accent);
  const maxLines =
    accent === "mega-discount" ? 1 : accent === "impact-italic" ? 3 : slotMaxLines(slotKey);
  const maxChars =
    slotKey === "hook"
      ? accent === "impact-italic"
        ? 64
        : 48
      : slotKey === "subtext"
        ? accent === "mega-discount"
          ? 16
          : 120
        : 40;
  const text = ellipsisEditorial(rawText, maxChars);

  useLayoutEffect(() => {
    if (!text) return;
    if (accent === "mega-discount") {
      setFitPx(basePx);
      return;
    }
    const minRatio = accent === "impact-italic" ? 0.62 : accent === "glitch-headline" ? 0.75 : 0.45;
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

  return (
    <AccentWrapper rule={rule} layout={layout}>
      <p
        ref={pRef}
        style={{
          ...buildSlotStyle(token, layout.palette.accent, fitPx ?? basePx),
          WebkitLineClamp: maxLines,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
        className={[
          rule.className,
          "break-words",
          isTypographicCta || isImpactAccent
            ? ""
            : "drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]",
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
        <div className="absolute bottom-[22%] left-8 right-[42%] h-24 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    );
  }

  return <div className={layout.decorative.className} aria-hidden />;
}
