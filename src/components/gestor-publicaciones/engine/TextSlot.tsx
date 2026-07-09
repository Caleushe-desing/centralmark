import type { ReactNode } from "react";
import type { AdCopySlots, CompositionLayout, SlotKey, SlotRule } from "./compositionRules";
import { alignClass, buildSlotStyle, slotText } from "./engine-utils";

const GHOST_CTA_CLASS =
  "border border-white/55 bg-transparent px-10 py-3.5 tracking-[0.32em] text-[11px] uppercase backdrop-blur-[2px]";

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
        <div className="min-w-0">{children}</div>
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
        <div className="min-w-0">{children}</div>
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

  if (accent === "ghost-cta") {
    return (
      <div className={`max-w-full ${alignClass(rule.align)} ${GHOST_CTA_CLASS} ${rule.wrapperClassName ?? ""}`}>
        {children}
      </div>
    );
  }

  if (rule.wrapperClassName?.trim()) {
    return <div className={`max-w-full ${alignClass(rule.align)} ${rule.wrapperClassName}`}>{children}</div>;
  }

  return <div className={`w-fit max-w-full ${alignClass(rule.align)}`}>{children}</div>;
}

export function TextSlot({ slotKey, rule, copy, layout }: TextSlotProps) {
  const text = slotText(copy, slotKey);
  if (!text) return null;

  const token = layout.typography[slotKey];
  const isGhost = rule.accent === "ghost-cta";

  const content = (
    <p
      style={buildSlotStyle(token, layout.palette.accent)}
      className={[rule.className, isGhost ? "" : "drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)]"]
        .filter(Boolean)
        .join(" ")}
      data-slot={slotKey}
    >
      {text}
    </p>
  );

  return (
    <AccentWrapper rule={rule} layout={layout}>
      {content}
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
