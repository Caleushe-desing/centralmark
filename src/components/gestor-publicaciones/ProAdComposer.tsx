"use client";

import { forwardRef } from "react";
import type { LayoutElement, LayoutZone, ProAdCopy } from "@/lib/pro-ad/schemas";
import { groupElementsByZone } from "@/lib/pro-ad/group-layout-zones";
import { LayoutElementBlock } from "./LayoutElementBlock";

interface ProAdComposerProps {
  imageUrl: string;
  copy: ProAdCopy;
}

const ZONE_JUSTIFY: Record<LayoutZone, string> = {
  top: "justify-start",
  center: "justify-center",
  bottom: "justify-end",
};

function ZoneStack({ elements }: { elements: LayoutElement[] }) {
  if (elements.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      {elements.map((element) => (
        <LayoutElementBlock key={element.id} element={element} />
      ))}
    </div>
  );
}

export const ProAdComposer = forwardRef<HTMLDivElement, ProAdComposerProps>(
  function ProAdComposer({ imageUrl, copy }, ref) {
    const zones = groupElementsByZone(copy.layoutElements);

    return (
      <div
        ref={ref}
        className="relative shrink-0 overflow-hidden bg-black"
        style={{ width: 1080, height: 1080 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />

        <div className="absolute inset-0 flex flex-col pointer-events-none">
          {(["top", "center", "bottom"] as const).map((zone) => (
            <div
              key={zone}
              className={`flex-1 flex flex-col ${ZONE_JUSTIFY[zone]} px-10 py-8 min-h-0`}
            >
              <ZoneStack elements={zones[zone]} />
            </div>
          ))}
        </div>
      </div>
    );
  }
);
