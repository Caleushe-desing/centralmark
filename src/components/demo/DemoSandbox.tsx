"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ImageIcon,
  Settings,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ContactDemoButton } from "@/components/contact/ContactDemoButton";
import { ArchetypeMicroPreview } from "@/components/design-engine/archetype-previews/ArchetypeMicroPreview";
import {
  ARCHETYPE_DEFINITIONS,
  type VisualArchetype,
  getArchetypeDefinition,
} from "@/lib/design-engine/archetypes";
import { COLOR_PRESETS } from "@/lib/brand/color-presets";

type DemoTab = "publicaciones" | "moderacion" | "marca";

type DemoPublication = {
  id: string;
  productName: string;
  discount: string;
  caption: string;
  archetype: VisualArchetype;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
};

const DEMO_STORE = {
  name: "Urban Sneakers",
  mall: "Mall Demo CentralMark",
};

const PHOTO_BY_ARCHETYPE: Record<VisualArchetype, string> = {
  drop: "/rubros/footwear.jpg",
  spotlight: "/rubros/fashion.jpg",
  editorial: "/rubros/fashion.jpg",
  promo: "/rubros/sports.jpg",
};

function newId() {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function DemoSandbox() {
  const [tab, setTab] = useState<DemoTab>("publicaciones");
  const [archetype, setArchetype] = useState<VisualArchetype>("drop");
  const [productName, setProductName] = useState("Zapatillas Runner Pro");
  const [discount, setDiscount] = useState("30% DTO");
  const [caption, setCaption] = useState(
    "Llega el Runner Pro a Urban Sneakers. Diseño urbano, amortiguación premium y stock limitado este fin de semana."
  );
  const [primaryColor, setPrimaryColor] = useState("#2F6BFF");
  const [publications, setPublications] = useState<DemoPublication[]>([
    {
      id: "seed-1",
      productName: "Chaqueta Denim",
      discount: "40% DTO",
      caption: "Abrigo urbano con lavado premium. Solo esta semana en el mall.",
      archetype: "spotlight",
      status: "pending",
      createdAt: Date.now() - 60_000,
    },
  ]);
  const [notice, setNotice] = useState<string | null>(null);

  const sample = getArchetypeDefinition(archetype);
  const photoUrl = PHOTO_BY_ARCHETYPE[archetype];

  const pending = useMemo(
    () => publications.filter((p) => p.status === "pending"),
    [publications]
  );
  const approved = useMemo(
    () => publications.filter((p) => p.status === "approved"),
    [publications]
  );

  function flash(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 2800);
  }

  function submitPublication() {
    const next: DemoPublication = {
      id: newId(),
      productName: productName.trim() || "Producto demo",
      discount: discount.trim() || "Promo",
      caption: caption.trim(),
      archetype,
      status: "pending",
      createdAt: Date.now(),
    };
    setPublications((prev) => [next, ...prev]);
    setTab("moderacion");
    flash("Publicación enviada a revisión del mall (sin IA).");
  }

  function setStatus(id: string, status: "approved" | "rejected") {
    setPublications((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
    flash(status === "approved" ? "Publicación aprobada." : "Publicación rechazada.");
  }

  const tabs: { id: DemoTab; label: string; icon: typeof ImageIcon }[] = [
    { id: "publicaciones", label: "Publicaciones", icon: ImageIcon },
    { id: "moderacion", label: "Moderación mall", icon: ShieldCheck },
    { id: "marca", label: "Marca", icon: Settings },
  ];

  return (
    <div className="cm-app-bg min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo className="h-9 w-auto shrink-0" href="/" />
            <div className="hidden min-w-0 border-l border-slate-200 pl-3 sm:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2F6BFF]">
                Demo interactiva
              </p>
              <p className="truncate text-sm font-medium text-slate-600">
                {DEMO_STORE.name} · {DEMO_STORE.mall}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver</span>
            </Link>
            <ContactDemoButton
              label="Solicitar demo real"
              className="cm-btn-primary hidden px-4 py-2 sm:inline-flex"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-950">
                  Modo demo — sin IA ni costos
                </p>
                <p className="mt-0.5 text-sm text-amber-900/80">
                  Recorre el flujo de tienda y mall con datos simulados. La generación con IA
                  queda desactivada a propósito.
                </p>
              </div>
            </div>
            <ContactDemoButton
              label="Hablar con ventas"
              className="cm-btn-secondary shrink-0 px-4 py-2 text-sm"
            />
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 cm-animate-fade-in"
          >
            {notice}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#2F6BFF]/40 hover:text-[#0B1B4D]"
                }`}
                style={active ? { background: "var(--cm-grad)" } : undefined}
              >
                <Icon className="h-4 w-4" />
                {label}
                {id === "moderacion" && pending.length > 0 ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? "bg-white/25 text-white" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {pending.length}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {tab === "publicaciones" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="cm-card space-y-5 p-6">
              <div>
                <h1 className="cm-page-title text-2xl">Crear publicación</h1>
                <p className="cm-page-subtitle text-sm">
                  Elige un estilo visual y completa los textos. No se llama a OpenAI.
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Estilo visual
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {ARCHETYPE_DEFINITIONS.map((def) => {
                    const active = archetype === def.id;
                    return (
                      <button
                        key={def.id}
                        type="button"
                        onClick={() => setArchetype(def.id)}
                        className={`overflow-hidden rounded-xl border text-left transition ${
                          active
                            ? "border-transparent ring-2 ring-[#2F6BFF]"
                            : "border-slate-200 hover:border-[#2F6BFF]/40"
                        }`}
                      >
                        <div className="aspect-square bg-slate-950">
                          <ArchetypeMicroPreview
                            archetype={def.id}
                            photoUrl={PHOTO_BY_ARCHETYPE[def.id]}
                          />
                        </div>
                        <div className="border-t border-slate-100 bg-white px-3 py-2">
                          <p className="text-sm font-semibold text-[#0B1B4D]">{def.label}</p>
                          <p className="line-clamp-2 text-[11px] leading-snug text-slate-500">
                            {def.marketingPurpose}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Producto</span>
                  <input
                    className="cm-input"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Promo / descuento</span>
                  <input
                    className="cm-input"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Caption (redes)</span>
                  <textarea
                    className="cm-input min-h-[96px]"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={submitPublication}
                className="cm-btn-primary inline-flex w-full items-center justify-center gap-2 py-3"
              >
                Enviar a revisión del mall
              </button>
              <p className="text-center text-xs text-slate-500">
                En producción, aquí se generaría la imagen con IA. En la demo usamos muestra fija.
              </p>
            </section>

            <section className="cm-card overflow-hidden p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Vista previa · {sample.label}
              </p>
              <div
                className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl shadow-lg"
                style={{ background: primaryColor }}
              >
                <Image
                  src={photoUrl}
                  alt="Vista previa demo"
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute left-4 top-4 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  {sample.sampleCopy.badge}
                </div>
                <div className="absolute inset-x-4 bottom-4 space-y-2 text-white">
                  <p
                    className="text-2xl font-extrabold leading-tight sm:text-3xl"
                    style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                  >
                    {productName || sample.sampleCopy.hook}
                  </p>
                  <p
                    className="inline-block rounded-md px-2 py-1 text-sm font-bold text-white"
                    style={{ background: primaryColor }}
                  >
                    {discount || sample.sampleCopy.subtext}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/90">
                    {sample.sampleCopy.cta}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Caption
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{caption}</p>
                <p className="mt-3 text-xs text-slate-500">
                  #{DEMO_STORE.name.replace(/\s/g, "")} #CentralMark #MallDemo
                </p>
              </div>
            </section>
          </div>
        )}

        {tab === "moderacion" && (
          <div className="space-y-6">
            <section className="cm-card p-6">
              <h2 className="text-xl font-bold text-[#0B1B4D]">Cola de revisión</h2>
              <p className="mt-1 text-sm text-slate-600">
                Así ve el mall las publicaciones enviadas por las tiendas.
              </p>
              {pending.length === 0 ? (
                <p className="mt-6 text-sm text-slate-500">
                  No hay pendientes. Crea una en la pestaña Publicaciones.
                </p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {pending.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                        <Image
                          src={PHOTO_BY_ARCHETYPE[p.archetype]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#0B1B4D]">{p.productName}</p>
                        <p className="text-xs text-[#2F6BFF]">{p.discount}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.caption}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {DEMO_STORE.name} · estilo {getArchetypeDefinition(p.archetype).label}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setStatus(p.id, "approved")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(p.id, "rejected")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="cm-card p-6">
              <h2 className="text-lg font-semibold text-[#0B1B4D]">Aprobadas en vitrina</h2>
              {approved.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Aún no hay publicaciones aprobadas.</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {approved.map((p) => (
                    <article key={p.id} className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={PHOTO_BY_ARCHETYPE[p.archetype]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="280px"
                        />
                      </div>
                      <div className="space-y-1 p-3">
                        <p className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                          Publicada
                        </p>
                        <p className="font-medium text-[#0B1B4D]">{p.productName}</p>
                        <p className="text-xs text-slate-500">{p.discount}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {tab === "marca" && (
          <section className="cm-card max-w-2xl space-y-5 p-6">
            <div>
              <h2 className="text-xl font-bold text-[#0B1B4D]">Identidad de la tienda</h2>
              <p className="mt-1 text-sm text-slate-600">
                En la app real estos colores alimentan las piezas con IA. Aquí solo previsualizas.
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-slate-600">Color acento</p>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.slice(0, 12).map((preset) => {
                  const active = primaryColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      title={preset.name}
                      onClick={() => setPrimaryColor(preset.hex)}
                      className={`h-9 w-9 rounded-full border-2 transition ${
                        active ? "scale-110 border-[#0B1B4D]" : "border-white shadow ring-1 ring-slate-200"
                      }`}
                      style={{ background: preset.hex }}
                    />
                  );
                })}
              </div>
            </div>
            <div
              className="rounded-xl p-5 text-white shadow-inner"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, #0B1B4D)` }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {DEMO_STORE.mall}
              </p>
              <p
                className="mt-1 text-2xl font-bold"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {DEMO_STORE.name}
              </p>
              <p className="mt-2 text-sm text-white/85">
                Así se vería tu acento de marca en portadas y botones.
              </p>
            </div>
            <ContactDemoButton
              label="Quiero esto en mi mall"
              className="cm-btn-primary inline-flex px-5 py-2.5"
            />
          </section>
        )}
      </main>
    </div>
  );
}
