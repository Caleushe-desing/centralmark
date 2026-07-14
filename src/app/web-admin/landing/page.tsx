"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  ImageIcon,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";

type CmsField = {
  key: string;
  type: string;
  label: string;
  section: string;
  sectionLabel: string;
  value: string;
  sortOrder: number;
};

type SectionGroup = {
  section: string;
  sectionLabel: string;
  fields: CmsField[];
};

function groupSections(fields: CmsField[]): SectionGroup[] {
  const map = new Map<string, SectionGroup>();
  for (const f of fields) {
    const g = map.get(f.section) ?? {
      section: f.section,
      sectionLabel: f.sectionLabel,
      fields: [],
    };
    g.fields.push(f);
    map.set(f.section, g);
  }
  return Array.from(map.values());
}

function PreviewCard({
  title,
  subtitle,
  image,
  active,
  onClick,
}: {
  title: string;
  subtitle?: string;
  image?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full overflow-hidden rounded-xl border text-left transition ${
        active
          ? "border-transparent shadow-lg ring-2 ring-[#2F6BFF]/40"
          : "border-slate-200 hover:border-[#2F6BFF]/40 hover:shadow-md"
      }`}
      style={active ? { background: "linear-gradient(white, white) padding-box, var(--cm-grad) border-box" } : undefined}
    >
      {image ? (
        <div className="relative h-28 w-full bg-slate-100">
          <Image src={image} alt="" fill className="object-cover" sizes="320px" unoptimized />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,194,255,0.35), transparent 50%, rgba(192,38,255,0.3))",
            }}
          />
        </div>
      ) : (
        <div
          className="flex h-16 items-center justify-center text-white"
          style={{ background: "var(--cm-grad)" }}
        >
          <Sparkles className="h-5 w-5" />
        </div>
      )}
      <div className="bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#2F6BFF]">
          Sección
        </p>
        <p className="mt-0.5 text-sm font-semibold text-[#0B1B4D]">{title}</p>
        {subtitle ? (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>
    </button>
  );
}

export default function WebAdminLandingEditorPage() {
  const [fields, setFields] = useState<CmsField[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string>("hero");
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
    if (list[0]) setActiveSection(list[0].section);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sections = useMemo(() => groupSections(fields), [fields]);
  const activeFields = useMemo(
    () => fields.filter((f) => f.section === activeSection),
    [fields, activeSection]
  );

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
    setMessage("Cambios guardados. Ya se ven en la página principal.");
  }

  async function uploadImage(key: string, file: File) {
    setUploadingKey(key);
    setError(null);
    const fd = new FormData();
    fd.set("image", file);
    fd.set("fieldKey", key);
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
    setValue(key, data.imageUrl);
  }

  function previewMeta(section: string) {
    const titleKey =
      section === "hero"
        ? "hero.headline"
        : section === "nav"
          ? "nav.cta"
          : `${section}.title`;
    const subKey =
      section === "hero"
        ? "hero.subtitle"
        : section === "analytics"
          ? "analytics.subtitle"
          : `${section}.subtitle`;
    const imageKey =
      section === "hero"
        ? "hero.image"
        : section === "ecosystem"
          ? "ecosystem.image"
          : section === "howto"
            ? "howto.steps"
            : section === "analytics"
              ? "analytics.image"
              : undefined;

    let image: string | undefined;
    if (imageKey === "howto.steps") {
      try {
        const steps = JSON.parse(draft["howto.steps"] || "[]") as Array<{ image?: string }>;
        image = steps[0]?.image;
      } catch {
        image = undefined;
      }
    } else if (imageKey) {
      image = draft[imageKey];
    }

    return {
      title: draft[titleKey] || section,
      subtitle: draft[subKey],
      image,
    };
  }

  if (loading) {
    return <p className="text-slate-500">Cargando editor…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="cm-page-title">Editor visual de la página principal</h1>
          <p className="cm-page-subtitle">
            Elegí una sección a la izquierda, editá textos e imágenes a la derecha. Todo lo que
            ves en la home se puede cambiar aquí.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving || dirtyKeys.length === 0}
          className="cm-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar {dirtyKeys.length > 0 ? `(${dirtyKeys.length})` : ""}
        </button>
      </div>

      {message ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Check className="h-4 w-4" />
          {message}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Visual section picker */}
        <aside className="space-y-3 lg:max-h-[75vh] lg:overflow-y-auto lg:pr-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Vista previa de secciones
          </p>
          {sections.map((s) => {
            const meta = previewMeta(s.section);
            return (
              <PreviewCard
                key={s.section}
                title={s.sectionLabel}
                subtitle={meta.subtitle || meta.title}
                image={meta.image}
                active={activeSection === s.section}
                onClick={() => setActiveSection(s.section)}
              />
            );
          })}
        </aside>

        {/* Field editor */}
        <div className="cm-card p-6">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2F6BFF]">
              Editando ahora
            </p>
            <h2 className="text-xl font-bold text-[#0B1B4D]">
              {sections.find((s) => s.section === activeSection)?.sectionLabel}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Los cambios aparecen en la home al guardar. Las fotos se pueden reemplazar desde
              aquí.
            </p>
          </div>

          <div className="space-y-6">
            {activeFields.map((field) => {
              const value = draft[field.key] ?? "";
              const dirty = value !== field.value;

              return (
                <div key={field.key} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#0B1B4D]">
                    {field.label}
                    {dirty ? (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                        sin guardar
                      </span>
                    ) : null}
                  </label>

                  {field.type === "textarea" || field.type === "json" ? (
                    <textarea
                      className="cm-input min-h-[120px] font-mono text-sm"
                      value={value}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      spellCheck={field.type !== "json"}
                    />
                  ) : field.type === "image" ? (
                    <div className="space-y-3">
                      <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {value ? (
                          <Image
                            src={value}
                            alt={field.label}
                            fill
                            className="object-cover"
                            sizes="640px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="cm-btn-secondary inline-flex cursor-pointer items-center gap-2 text-sm">
                          {uploadingKey === field.key ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ImageIcon className="h-4 w-4" />
                          )}
                          Cambiar fotografía
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadImage(field.key, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <input
                          className="cm-input max-w-md text-xs"
                          value={value}
                          onChange={(e) => setValue(field.key, e.target.value)}
                          placeholder="/landing/..."
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      className="cm-input"
                      value={value}
                      onChange={(e) => setValue(field.key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
