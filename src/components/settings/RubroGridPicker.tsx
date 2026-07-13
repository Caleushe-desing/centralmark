"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { STORE_RUBROS, getStoreRubroDefinition } from "@/lib/store/rubros";

interface RubroGridPickerProps {
  value: string;
  onChange: (rubroId: string) => void;
}

export function RubroGridPicker({ value, onChange }: RubroGridPickerProps) {
  const selected = getStoreRubroDefinition(value);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[#0F2B5B]">Rubro de tu tienda</h3>
        <p className="mt-1 text-sm text-slate-600">
          Selecciona el tipo de negocio. La IA adaptará textos, estilo y fotos de referencia a tu
          rubro — sin costo adicional de generación.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {STORE_RUBROS.map((rubro) => {
          const isSelected = value === rubro.id;
          return (
            <button
              key={rubro.id}
              type="button"
              onClick={() => onChange(rubro.id)}
              className={`group relative overflow-hidden rounded-xl border-2 text-left transition ${
                isSelected
                  ? "border-[#2563EB] ring-2 ring-[#2563EB]/25 shadow-md"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <Image
                  src={rubro.defaultSampleImageUrl}
                  alt={rubro.label}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2B5B]/80 via-transparent to-transparent" />
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-white shadow">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div className="p-3 bg-white">
                <p className="text-sm font-semibold text-[#0F2B5B] leading-tight">{rubro.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{rubro.categoryLabel}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        Rubro seleccionado: <strong className="text-[#0F2B5B]">{selected.label}</strong>
      </p>
    </div>
  );
}
