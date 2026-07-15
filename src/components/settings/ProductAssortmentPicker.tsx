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
    <div className="space-y-6">
      <div className="cm-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#2F6BFF]">
          Surtido de productos
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#0B1B4D]">
          ¿Qué productos vende tu tienda?
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Marcá con un click las líneas de cada categoría. La IA usará esta información al generar
          imágenes y textos.
        </p>
        {(selectedIds.length > 0 || otherText.trim()) && (
          <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2F6BFF]">
            {selectedIds.length} seleccionados
            {otherText.trim() ? " · + otros personalizados" : ""}
          </p>
        )}
      </div>

      {groups.map(({ group, items }) => {
        const countInGroup = items.filter((i) => selected.has(i.id)).length;
        return (
          <section key={group} className="cm-card p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-[#0B1B4D]">{group}</h3>
              <span className="text-xs text-slate-500">
                {countInGroup > 0
                  ? `${countInGroup} de ${items.length} marcados`
                  : `${items.length} opciones`}
              </span>
            </div>
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
          </section>
        );
      })}

      <section className="cm-card p-6">
        <h3 className="text-base font-semibold text-[#0B1B4D]">Otros</h3>
        <p className="mt-1 mb-3 text-sm text-slate-500">
          Si no está en las categorías de arriba, escribilo aquí (separá por comas).
        </p>
        <textarea
          className="cm-input min-h-[88px]"
          value={otherText}
          onChange={(e) => onChangeOther(e.target.value)}
          placeholder="Ej: velas artesanales, suplementos deportivos…"
        />
      </section>
    </div>
  );
}
