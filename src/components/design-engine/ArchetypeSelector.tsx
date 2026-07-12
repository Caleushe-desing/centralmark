"use client";

import { ARCHETYPE_DEFINITIONS, type VisualArchetype } from "@/lib/design-engine/archetypes";
import { resolveArchetypeSampleImage, type StoreSampleContext } from "@/lib/design-engine/archetype-store-samples";
import { ArchetypeMicroPreview } from "./archetype-previews/ArchetypeMicroPreview";
import { Check } from "lucide-react";

interface ArchetypeSelectorProps {
  value: VisualArchetype;
  onChange: (archetype: VisualArchetype) => void;
  disabled?: boolean;
  storeContext: StoreSampleContext;
}

/**
 * Selector 2×2: micro-maqueta SVG (layout) + foto real del rubro de la tienda.
 * No llama a OpenAI.
 */
export function ArchetypeSelector({
  value,
  onChange,
  disabled,
  storeContext,
}: ArchetypeSelectorProps) {
  const photoUrl = resolveArchetypeSampleImage("drop", storeContext);

  return (
    <div className="space-y-2">
      <label className="block text-sm text-neutral-400">Arquetipo visual</label>
      <p className="text-xs text-neutral-600 leading-relaxed">
        La micro-maqueta muestra el peso tipográfico de cada estilo sobre una foto de tu rubro
        {storeContext.previewImageUrl ? " (tu imagen)" : ""}. Sin costo de IA hasta pulsar Generar.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {ARCHETYPE_DEFINITIONS.map((archetype) => {
          const selected = value === archetype.id;
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
              <div className="aspect-square p-2 bg-black/40">
                <ArchetypeMicroPreview archetype={archetype.id} photoUrl={photoUrl} />
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
