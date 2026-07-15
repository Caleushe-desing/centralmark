"use client";

import { groupDepartmentProducts } from "@/lib/store/department-products";

type Props = {
  selectedIds: string[];
  otherText: string;
  onChangeIds: (ids: string[]) => void;
  onChangeOther: (text: string) => void;
};

export function ProductAssortmentPicker({
  selectedIds,
  otherText,
  onChangeIds,
  onChangeOther,
}: Props) {
  const groups = groupDepartmentProducts();
  const selected = new Set(selectedIds);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChangeIds(Array.from(next));
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[#0B1B4D]">¿Qué productos vende tu tienda?</h3>
        <p className="mt-1 text-sm text-slate-500">
          Marcá con un click las líneas que comercializás. La IA usará esta información al generar
          imágenes y textos.
        </p>
      </div>

      <div className="space-y-6">
        {groups.map(({ group, items }) => (
          <div key={group}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {group}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const active = selected.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "border-transparent text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#2F6BFF]/40 hover:bg-slate-50"
                    }`}
                    style={active ? { background: "var(--cm-grad)" } : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#0B1B4D]">Otros</label>
        <p className="mb-2 text-xs text-slate-500">
          Si no está en la lista, escribilo aquí (separá por comas).
        </p>
        <textarea
          className="cm-input min-h-[88px]"
          value={otherText}
          onChange={(e) => onChangeOther(e.target.value)}
          placeholder="Ej: velas artesanales, suplementos deportivos…"
        />
      </div>

      {selectedIds.length > 0 || otherText.trim() ? (
        <p className="text-xs text-slate-500">
          Seleccionados: {selectedIds.length}
          {otherText.trim() ? " + otros personalizados" : ""}
        </p>
      ) : null}
    </div>
  );
}
