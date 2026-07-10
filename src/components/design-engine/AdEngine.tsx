"use client";

import { forwardRef } from "react";
import type { AdCopySlots, CompositionLayout } from "@/lib/design-engine/composition/rules";
import { zoneScrimStylePlain } from "@/lib/design-engine/scrims/local-scrim";
import { paletteCssVars } from "./utils";
import { DecorativeLayer, TextSlot } from "./TextSlot";

export interface AdEngineProps {
  imageUrl: string;
  copy: AdCopySlots;
  layout: CompositionLayout;
}

export const AdEngine = forwardRef<HTMLDivElement, AdEngineProps>(function AdEngine(
  { imageUrl, copy, layout },
  ref
) {
  const topSlots = layout.slots.filter((s) => s.zone === "top");
  const bottomSlots = layout.slots.filter((s) => s.zone === "bottom");
  const isDrop = layout.archetype === "drop";
  const topScrim = zoneScrimStylePlain("top", isDrop ? 0.32 : layout.archetype === "spotlight" ? 0.2 : 0.48);
  const bottomScrim = zoneScrimStylePlain("bottom", isDrop ? 0.22 : layout.archetype === "spotlight" ? 0.15 : 0.5);

  return (
    <div
      ref={ref}
      className={`relative shrink-0 overflow-hidden ${layout.containerClass}`}
      style={{
        width: 1080,
        height: 1080,
        clipPath: layout.clipPath,
        ...paletteCssVars(layout.palette),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        crossOrigin={imageUrl.startsWith("http") ? "anonymous" : undefined}
      />

      <div style={topScrim} aria-hidden />
      <div style={bottomScrim} aria-hidden />
      <DecorativeLayer layout={layout} />

      <div className={layout.overlayClass}>
        <div className={layout.topZoneClass}>
          {topSlots.map((rule) => (
            <TextSlot key={rule.slotKey} slotKey={rule.slotKey} rule={rule} copy={copy} layout={layout} />
          ))}
        </div>

        <div className="flex-1 min-h-[28%] pointer-events-none" aria-hidden />

        <div className={layout.bottomZoneClass}>
          {bottomSlots.map((rule) => (
            <TextSlot key={rule.slotKey} slotKey={rule.slotKey} rule={rule} copy={copy} layout={layout} />
          ))}
        </div>
      </div>
    </div>
  );
});
