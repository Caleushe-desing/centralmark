"use client";

import { useMemo, useState } from "react";
import { Palette, Search } from "lucide-react";
import {
  COLOR_PRESET_GROUPS,
  COLOR_PRESETS,
  filterColorPresets,
  normalizeHexColor,
  type ColorPreset,
} from "@/lib/brand/color-presets";

type ColorField = "primary" | "secondary";

interface ColorPalettePickerProps {
  primaryColor: string;
  secondaryColor: string;
  onPrimaryChange: (hex: string) => void;
  onSecondaryChange: (hex: string) => void;
}

function ColorFieldEditor({
  label,
  description,
  value,
  active,
  onActivate,
  onChange,
  search,
  onSearchChange,
  filteredPresets,
  onPickPreset,
}: {
  label: string;
  description: string;
  value: string;
  active: boolean;
  onActivate: () => void;
  onChange: (hex: string) => void;
  search: string;
  onSearchChange: (q: string) => void;
  filteredPresets: ColorPreset[];
  onPickPreset: (hex: string) => void;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        active ? "border-[#2563EB] bg-blue-50/50 ring-2 ring-[#2563EB]/20" : "border-slate-200 bg-white"
      }`}
    >
      <button type="button" onClick={onActivate} className="w-full text-left">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#0F2B5B]">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
          <div
            className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 shadow-inner"
            style={{ backgroundColor: value }}
          />
        </div>
      </button>

      {active && (
        <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="h-10 w-14 cursor-pointer rounded border border-slate-300 bg-white p-1"
              aria-label={`Selector visual ${label}`}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => {
                const next = normalizeHexColor(e.target.value);
                if (next) onChange(next);
                else onChange(e.target.value);
              }}
              onBlur={(e) => {
                const next = normalizeHexColor(e.target.value);
                if (next) onChange(next);
              }}
              placeholder="#0F2B5B"
              className="cm-input max-w-[140px] font-mono text-sm"
            />
            <span className="text-xs text-slate-500">Hex manual o busca abajo</span>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar color por nombre, grupo o código…"
              className="cm-input pl-10 text-sm"
            />
          </div>

          {search.trim() ? (
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {filteredPresets.map((preset) => (
                <button
                  key={`${preset.hex}-${preset.name}`}
                  type="button"
                  title={`${preset.name} (${preset.hex})`}
                  onClick={() => onPickPreset(preset.hex)}
                  className={`group relative aspect-square rounded-lg border-2 transition hover:scale-105 ${
                    value.toUpperCase() === preset.hex.toUpperCase()
                      ? "border-[#2563EB] ring-2 ring-[#2563EB]/30"
                      : "border-white shadow-sm hover:border-slate-300"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                >
                  <span className="sr-only">{preset.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {COLOR_PRESET_GROUPS.map((group) => {
                const groupColors = COLOR_PRESETS.filter((p) => p.group === group);
                if (groupColors.length === 0) return null;
                return (
                  <div key={group}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {group}
                    </p>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                      {groupColors.map((preset) => (
                        <button
                          key={`${preset.hex}-${preset.name}`}
                          type="button"
                          title={`${preset.name} (${preset.hex})`}
                          onClick={() => onPickPreset(preset.hex)}
                          className={`aspect-square rounded-lg border-2 transition hover:scale-105 ${
                            value.toUpperCase() === preset.hex.toUpperCase()
                              ? "border-[#2563EB] ring-2 ring-[#2563EB]/30"
                              : "border-white shadow-sm hover:border-slate-300"
                          }`}
                          style={{ backgroundColor: preset.hex }}
                        >
                          <span className="sr-only">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {search.trim() && filteredPresets.length === 0 && (
            <p className="text-sm text-slate-500">No hay colores que coincidan con «{search}».</p>
          )}
        </div>
      )}
    </div>
  );
}

export function ColorPalettePicker({
  primaryColor,
  secondaryColor,
  onPrimaryChange,
  onSecondaryChange,
}: ColorPalettePickerProps) {
  const [activeField, setActiveField] = useState<ColorField>("primary");
  const [primarySearch, setPrimarySearch] = useState("");
  const [secondarySearch, setSecondarySearch] = useState("");

  const primaryFiltered = useMemo(() => filterColorPresets(primarySearch), [primarySearch]);
  const secondaryFiltered = useMemo(() => filterColorPresets(secondarySearch), [secondarySearch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[#0F2B5B]">
        <Palette className="h-5 w-5 text-[#2563EB]" />
        <h3 className="text-lg font-semibold">Paleta de marca</h3>
      </div>
      <p className="text-sm text-slate-600">
        Elige los colores que la IA usará en textos, acentos y composición. Puedes buscar por nombre
        o ingresar un código hexadecimal personalizado.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <ColorFieldEditor
          label="Color primario"
          description="Acento principal en ofertas y titulares"
          value={primaryColor}
          active={activeField === "primary"}
          onActivate={() => setActiveField("primary")}
          onChange={onPrimaryChange}
          search={primarySearch}
          onSearchChange={setPrimarySearch}
          filteredPresets={primaryFiltered}
          onPickPreset={onPrimaryChange}
        />
        <ColorFieldEditor
          label="Color secundario"
          description="Fondos, contrastes y elementos de apoyo"
          value={secondaryColor}
          active={activeField === "secondary"}
          onActivate={() => setActiveField("secondary")}
          onChange={onSecondaryChange}
          search={secondarySearch}
          onSearchChange={setSecondarySearch}
          filteredPresets={secondaryFiltered}
          onPickPreset={onSecondaryChange}
        />
      </div>

      <div
        className="rounded-xl border border-slate-200 p-4"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <p className="text-sm font-medium text-white drop-shadow-sm">Vista previa de combinación</p>
        <p className="text-xs text-white/80 mt-1">Así se verán los acentos en tus publicaciones</p>
      </div>
    </div>
  );
}
