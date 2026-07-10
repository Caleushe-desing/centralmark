"use client";

import { AdEngine } from "@/components/design-engine";
import {
  COPY_MODES,
  buildSampleDesignDocument,
  getSampleLayout,
  type CopyMode,
} from "@/lib/design-engine/copy-modes";
import { Check } from "lucide-react";

interface DesignModePickerProps {
  value: CopyMode;
  onChange: (mode: CopyMode) => void;
  disabled?: boolean;
}

export function DesignModePicker({ value, onChange, disabled }: DesignModePickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-neutral-400">Estilo de publicación</label>
      <p className="text-xs text-neutral-600 leading-relaxed">
        Elige cómo se verán los textos sobre la imagen. Cada modo muestra un ejemplo real del motor.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {COPY_MODES.map((mode) => {
          const selected = value === mode.id;
          const layout = getSampleLayout(mode.id);
          const copy = buildSampleDesignDocument(mode.id);

          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(mode.id)}
              className={`relative text-left rounded-2xl border overflow-hidden transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mm-neon/60 disabled:opacity-50 ${
                selected
                  ? "border-mm-neon/70 bg-mm-neon/5 shadow-[0_0_24px_rgba(200,255,0,0.08)]"
                  : "border-white/10 bg-mm-surface hover:border-white/25"
              }`}
            >
              {selected && (
                <span className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-mm-neon text-black text-[10px] font-semibold px-2 py-0.5">
                  <Check className="w-3 h-3" />
                  Elegido
                </span>
              )}

              <div className="bg-black flex justify-center overflow-hidden h-[200px]">
                <div className="scale-[0.185] origin-top pointer-events-none select-none">
                  <AdEngine
                    imageUrl={mode.sampleImageUrl}
                    copy={copy}
                    layout={layout}
                  />
                </div>
              </div>

              <div className="p-3 border-t border-white/10 space-y-1">
                <p className="text-sm font-semibold text-white">{mode.label}</p>
                <p className="text-xs text-neutral-500 leading-snug">{mode.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
