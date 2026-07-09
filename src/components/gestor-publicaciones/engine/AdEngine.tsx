"use client";

import { forwardRef } from "react";
import type { AdCopySlots, CompositionLayout } from "./compositionRules";
import { paletteCssVars } from "./engine-utils";
import { DecorativeLayer, TextSlot } from "./TextSlot";

export interface AdEngineProps {
  imageUrl: string;
  copy: AdCopySlots;
  layout: CompositionLayout;
}

/** Viñeta editorial suave — legibilidad sin cajas pesadas */
const EDITORIAL_SCRIM =
  "absolute inset-0 pointer-events-none bg-gradient-to-b from-black/25 via-transparent via-45% to-black/55";

export const AdEngine = forwardRef<HTMLDivElement, AdEngineProps>(function AdEngine(
  { imageUrl, copy, layout },
  ref
) {
  const topSlots = layout.slots.filter((s) => s.zone === "top");
  const bottomSlots = layout.slots.filter((s) => s.zone === "bottom");

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
        crossOrigin="anonymous"
      />

      <div className={EDITORIAL_SCRIM} aria-hidden />
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
