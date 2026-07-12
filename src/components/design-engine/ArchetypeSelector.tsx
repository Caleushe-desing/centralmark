"use client";

import { AdEngine } from "@/components/design-engine";
import {
  ARCHETYPE_DEFINITIONS,
  buildArchetypeSampleCopy,
  getArchetypeSampleLayout,
  type VisualArchetype,
} from "@/lib/design-engine/archetypes";
import { Check } from "lucide-react";

interface ArchetypeSelectorProps {
  value: VisualArchetype;
  onChange: (archetype: VisualArchetype) => void;
  disabled?: boolean;
}

/**
 * Preview estática con AdEngine + fotos reales en /public/design-modes/.
 * No llama a OpenAI — solo render en el navegador.
 */
export function ArchetypeSelector({ value, onChange, disabled }: ArchetypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-neutral-400">Arquetipo visual</label>
      <p className="text-xs text-neutral-600 leading-relaxed">
        Elige la intención de marketing antes de generar. Cada tarjeta muestra un ejemplo real del
        motor (foto + textos), sin costo de IA.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {ARCHETYPE_DEFINITIONS.map((archetype) => {
          const selected = value === archetype.id;
          const layout = getArchetypeSampleLayout(archetype.id);
          const copy = buildArchetypeSampleCopy(archetype.id);

          return (
            <button
              key={archetype.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(archetype.id)}
              className={`relative text-left rounded-2xl border overflow-hidden transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mm-neon/60 disabled:opacity-50 ${
                selected
                  ? "border-mm-neon/70 bg-mm-neon/5 shadow-[0_0_20px_rgba(200,255,0,0.08)]"
                  : "border-white/10 bg-mm-surface hover:border-white/25"
              }`}
            >
              {selected && (
                <span className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-mm-neon text-black text-[10px] font-semibold px-2 py-0.5">
                  <Check className="w-3 h-3" />
                </span>
              )}

              <div className="bg-black flex justify-center overflow-hidden aspect-square">
                <div className="scale-[0.155] origin-top pointer-events-none select-none">
                  <AdEngine
                    imageUrl={archetype.sampleImageUrl}
                    copy={copy}
                    layout={layout}
                  />
                </div>
              </div>

              <div className="p-3 border-t border-white/10 space-y-1">
                <p className="text-sm font-semibold text-white">{archetype.label}</p>
                <p className="text-xs text-neutral-500 leading-snug">{archetype.marketingPurpose}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
