"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, MousePointerClick, Save } from "lucide-react";
import {
  CentralMarkLanding,
  patchHowtoStepImage,
} from "@/components/landing/CentralMarkLanding";

type CmsField = {
  key: string;
  type: string;
  label: string;
  section: string;
  sectionLabel: string;
  value: string;
  sortOrder: number;
};

export default function WebAdminLandingEditorPage() {
  const [fields, setFields] = useState<CmsField[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/web-admin/landing");
    if (!res.ok) {
      setError("No se pudo cargar el contenido");
      setLoading(false);
      return;
    }
    const data = await res.json();
    const list = (data.fields ?? []) as CmsField[];
    setFields(list);
    setDraft(Object.fromEntries(list.map((f) => [f.key, f.value])));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirtyKeys = useMemo(() => {
    return fields
      .filter((f) => (draft[f.key] ?? "") !== f.value)
      .map((f) => f.key);
  }, [fields, draft]);

  function setValue(key: string, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  async function save() {
    if (dirtyKeys.length === 0) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const updates = dirtyKeys.map((key) => ({ key, value: draft[key] ?? "" }));
    const res = await fetch("/api/web-admin/landing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Error al guardar");
      return;
    }
    const data = await res.json();
    const list = (data.fields ?? []) as CmsField[];
    setFields(list);
    setDraft(Object.fromEntries(list.map((f) => [f.key, f.value])));
    setMessage("Guardado. La página principal ya refleja estos cambios.");
  }

  async function uploadImage(key: string, file: File) {
    setUploadingKey(key);
    setError(null);

    // Claves especiales: howto.steps.N.image → sube y parchea JSON
    const howtoMatch = /^howto\.steps\.(\d+)\.image$/.exec(key);
    const fieldKey = howtoMatch ? "howto.steps" : key;

    const fd = new FormData();
    fd.set("image", file);
    fd.set("fieldKey", fieldKey.replace(/\W+/g, "_"));
    const res = await fetch("/api/web-admin/landing/upload", {
      method: "POST",
      body: fd,
    });
    setUploadingKey(null);
    if (!res.ok) {
      setError("No se pudo subir la imagen");
      return;
    }
    const data = await res.json();
    const imageUrl = data.imageUrl as string;

    if (howtoMatch) {
      const index = Number(howtoMatch[1]);
      setValue("howto.steps", patchHowtoStepImage(draft["howto.steps"] ?? "[]", index, imageUrl));
    } else {
      setValue(key, imageUrl);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Cargando editor visual…
      </div>
    );
  }

  if (error && fields.length === 0) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  return (
    <div className="relative">
      {/* Barra de acciones fija — no forma parte del layout de la landing */}
      <div className="sticky top-[53px] z-[55] border-b border-slate-200/80 bg-[#0B1B4D] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-start gap-3">
            <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-[#00C2FF]" />
            <div>
              <p className="text-sm font-semibold">Estás editando la página real</p>
              <p className="text-xs text-slate-300">
                Click en cualquier texto o pasá el mouse sobre una foto para cambiarla. Guarda
                cuando termines.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {dirtyKeys.length > 0 ? (
              <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-semibold text-amber-200">
                {dirtyKeys.length} sin guardar
              </span>
            ) : (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-300">
                Al día
              </span>
            )}
            <button
              type="button"
              onClick={save}
              disabled={saving || dirtyKeys.length === 0}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-40"
              style={{ background: "var(--cm-grad)" }}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </button>
          </div>
        </div>
        {message ? (
          <div className="border-t border-white/10 bg-emerald-500/15 px-4 py-2 text-center text-xs text-emerald-100 sm:px-6">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              {message}
            </span>
          </div>
        ) : null}
        {error ? (
          <div className="border-t border-white/10 bg-red-500/15 px-4 py-2 text-center text-xs text-red-100">
            {error}
          </div>
        ) : null}
      </div>

      {/* Misma web, modo edición */}
      <CentralMarkLanding
        content={draft}
        editor={{
          onChange: setValue,
          onUploadImage: uploadImage,
          uploadingKey,
        }}
      />
    </div>
  );
}
