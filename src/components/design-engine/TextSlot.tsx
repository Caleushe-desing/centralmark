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
  const maxLines = slotMaxLines(slotKey);
  const maxChars = slotKey === "hook" ? 48 : slotKey === "subtext" ? 120 : 40;
  const text = ellipsisEditorial(rawText, maxChars);

  useLayoutEffect(() => {
    if (!text) return;
    const fitted = computeFitFontSizePx({
      text,
      baseFontSizePx: basePx,
      minFontSizePx: Math.max(10, basePx * 0.45),
      maxWidthPx: maxWidth,
      maxLines,
      fontFamily: token.fontFamily,
      fontWeight: token.fontWeight,
      letterSpacingPx: token.letterSpacing ? parseFontSizePx(token.letterSpacing, 1) : 0,
    });
    setFitPx(fitted);
  }, [text, basePx, maxWidth, maxLines, token.fontFamily, token.fontWeight, token.letterSpacing]);

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
          isTypographicCta ? "" : "drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]",
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
  return <div className={layout.decorative.className} aria-hidden />;
}
