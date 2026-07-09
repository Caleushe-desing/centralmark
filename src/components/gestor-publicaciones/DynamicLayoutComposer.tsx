"use client";

import { forwardRef } from "react";
import type { ProAdCopy } from "@/lib/pro-ad/schemas";
import { LayoutElementBlock } from "./LayoutElementBlock";

interface DynamicLayoutComposerProps {
  imageUrl: string;
  copy: ProAdCopy;
}

export const DynamicLayoutComposer = forwardRef<HTMLDivElement, DynamicLayoutComposerProps>(
  function DynamicLayoutComposer({ imageUrl, copy }, ref) {
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
        <div className="absolute inset-0 pointer-events-none">
          {copy.layoutElements.map((element) => (
            <LayoutElementBlock key={element.id} element={element} />
          ))}
        </div>
      </div>
    );
  }
);
