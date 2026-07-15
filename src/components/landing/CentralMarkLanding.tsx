"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  FileText,
  Lightbulb,
  Target,
} from "lucide-react";
import { LandingFooter } from "./LandingFooter";
import { LandingNavbar } from "./LandingNavbar";
import { parseJsonField } from "@/lib/cms/landing-defaults";
import {
  parseJsonArray,
  updateObjectArrayItem,
  updateStringArrayItem,
} from "@/lib/cms/json-edit";
import { EditableText } from "@/components/web-admin/EditableText";
import { EditableImage } from "@/components/web-admin/EditableImage";
import { ContactDemoButton } from "@/components/contact/ContactDemoButton";

const PILLAR_ICONS = [Target, Lightbulb, FileText, BarChart3] as const;
const INTEL_ICONS = [Lightbulb, Bell, CalendarClock, BarChart3, Target, FileText] as const;

export type LandingEditorApi = {
  onChange: (key: string, value: string) => void;
  onUploadImage: (key: string, file: File) => void;
  uploadingKey?: string | null;
};

type Props = {
  content: Record<string, string>;
  /** Si está definido, la landing se renderiza igual pero con edición in-situ */
  editor?: LandingEditorApi;
};

type TitleDesc = { title: string; description: string };
type HowStep = { title: string; description: string; image: string; imageAlt: string };
type ExpansionItem = { label: string; active: boolean };

function HowToArticle({
  step,
  index,
  reverse,
  showStepBadge,
  editing,
  uploadingKey,
  onChangeTitle,
  onChangeDescription,
  onUploadImage,
}: {
  step: HowStep;
  index: number;
  reverse: boolean;
  showStepBadge: boolean;
  editing: boolean;
  uploadingKey?: string | null;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onUploadImage: (file: File) => void;
}) {
  const editLabel = showStepBadge ? `Paso ${index + 1}` : "Sección";

  return (
    <article className="grid items-center gap-10 lg:grid-cols-2">
      <div className={reverse ? "lg:order-2" : ""}>
        {showStepBadge ? (
          <span
            className="mb-3 inline-flex h-9 items-center rounded-full px-3 text-xs font-bold uppercase tracking-wider text-white"
            style={{ background: "var(--cm-grad)" }}
          >
            Paso {index + 1}
          </span>
        ) : null}
        {editing ? (
          <>
            <EditableText
              value={step.title}
              onChange={onChangeTitle}
              label={`${editLabel} · título`}
              className="text-2xl font-bold text-[#0B1B4D] sm:text-3xl"
              style={{ fontFamily: "var(--font-outfit), sans-serif" }}
            />
            <EditableText
              value={step.description}
              onChange={onChangeDescription}
              multiline
              label={`${editLabel} · texto`}
              className="mt-3 text-base leading-relaxed text-slate-600"
            />
          </>
        ) : (
          <>
            <h3
              className={`font-bold text-[#0B1B4D] ${
                showStepBadge ? "text-2xl" : "text-3xl sm:text-4xl"
              }`}
              style={{ fontFamily: "var(--font-outfit), sans-serif" }}
            >
              {step.title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-slate-600 whitespace-pre-line">
              {step.description}
            </p>
          </>
        )}
      </div>
      <div
        className={`relative overflow-hidden rounded-2xl shadow-xl shadow-slate-200/80 ${
          editing ? "" : "cm-animate-float"
        } ${reverse ? "lg:order-1" : ""}`}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-30"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,194,255,0.25), transparent 40%, rgba(192,38,255,0.2))",
          }}
        />
        {editing ? (
          <EditableImage
            src={step.image}
            alt={step.imageAlt || step.title}
            width={1280}
            height={800}
            className="h-auto w-full object-cover"
            uploading={uploadingKey === `howto.steps.${index}.image`}
            label={
              showStepBadge
                ? `Cambiar foto paso ${index + 1}`
                : "Cambiar foto de la sección"
            }
            onUpload={onUploadImage}
          />
        ) : (
          <Image
            src={step.image}
            alt={step.imageAlt || step.title}
            width={1280}
            height={800}
            className="h-auto w-full object-cover"
          />
        )}
      </div>
    </article>
  );
}

export function CentralMarkLanding({ content, editor }: Props) {
  const editing = !!editor;
  const c = (key: string) => content[key] ?? "";
  const set = (key: string, value: string) => editor?.onChange(key, value);
  const upload = (key: string, file: File) => editor?.onUploadImage(key, file);

  const pillars = parseJsonField<TitleDesc[]>(c("pillars.items"), []);
  const howto = parseJsonField<HowStep[]>(c("howto.steps"), []);
  /** Primeros 3 = pasos numerados; el resto = secciones independientes (sin “Paso N”) */
  const howtoNumbered = howto.slice(0, 3);
  const howtoIndependent = howto.slice(3).map((step, i) => ({
    step,
    originalIndex: i + 3,
  }));
  const ecoBullets = parseJsonField<string[]>(c("ecosystem.bullets"), []);
  const intelligence = parseJsonField<TitleDesc[]>(c("intelligence.items"), []);
  const channels = parseJsonField<string[]>(c("channels.items"), []);
  const flowSteps = parseJsonField<string[]>(c("flow.steps"), []);
  const expansion = parseJsonField<ExpansionItem[]>(c("expansion.items"), []);

  const text = (
    key: string,
    className: string,
    opts?: { multiline?: boolean; label?: string; style?: React.CSSProperties }
  ) =>
    editing ? (
      <EditableText
        value={c(key)}
        onChange={(v) => set(key, v)}
        className={className}
        multiline={opts?.multiline}
        label={opts?.label}
        style={opts?.style}
      />
    ) : (
      <span className={className} style={opts?.style}>
        {c(key)}
      </span>
    );

  const img = (
    key: string,
    altKey: string | null,
    fallback: string,
    opts: {
      fill?: boolean;
      width?: number;
      height?: number;
      className?: string;
      sizes?: string;
      priority?: boolean;
      label?: string;
      wrapperClassName?: string;
    } = {}
  ) => {
    const src = c(key) || fallback;
    const alt = (altKey ? c(altKey) : "") || "CentralMark";
    if (editing) {
      return (
        <div className={opts.wrapperClassName ?? (opts.fill ? "absolute inset-0" : "relative")}>
          <EditableImage
            src={src}
            alt={alt}
            onUpload={(file) => upload?.(key, file)}
            uploading={editor?.uploadingKey === key}
            fill={opts.fill}
            width={opts.width}
            height={opts.height}
            className={opts.className ?? "h-auto w-full object-cover"}
            sizes={opts.sizes}
            priority={opts.priority}
            label={opts.label ?? "Cambiar foto"}
          />
        </div>
      );
    }
    if (opts.fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          priority={opts.priority}
          className={opts.className ?? "object-cover object-center"}
          sizes={opts.sizes}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={opts.width ?? 1280}
        height={opts.height ?? 720}
        priority={opts.priority}
        className={opts.className ?? "h-auto w-full object-cover"}
        sizes={opts.sizes}
      />
    );
  };

  const CtaPrimary = ({
    href,
    labelKey,
    className,
  }: {
    href: string;
    labelKey: string;
    className: string;
  }) =>
    editing ? (
      <div className={`${className} cursor-default`}>
        <EditableText
          value={c(labelKey)}
          onChange={(v) => set?.(labelKey, v)}
          className="text-center text-inherit"
          label="Botón"
        />
        <ArrowRight className="h-4 w-4 shrink-0" />
      </div>
    ) : (
      <Link href={href} className={className}>
        {c(labelKey)}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );

  const CtaSecondary = ({
    href,
    labelKey,
    className,
  }: {
    href: string;
    labelKey: string;
    className: string;
  }) =>
    editing ? (
      <div className={`${className} cursor-default`}>
        <EditableText
          value={c(labelKey)}
          onChange={(v) => set?.(labelKey, v)}
          className="text-center text-inherit"
          label="Botón"
        />
      </div>
    ) : (
      <Link href={href} className={className}>
        {c(labelKey)}
      </Link>
    );

  return (
    <div className="min-h-screen bg-[#F7F9FF] text-[#0B1B4D]">
      <LandingNavbar
        ctaLabel={c("nav.cta") || "Solicitar una demo"}
        disableLinks={editing}
        ctaSlot={
          editing ? (
            <div className="cm-btn-primary px-4 py-2">
              <EditableText
                value={c("nav.cta")}
                onChange={(v) => set?.("nav.cta", v)}
                className="text-center text-sm font-semibold text-white"
                label="CTA menú"
              />
            </div>
          ) : undefined
        }
      />

      <main>
        {/* Hero */}
        <section className="relative min-h-[min(100svh,920px)] overflow-hidden border-b border-slate-200/80">
          <div className="absolute inset-0">
            {img("hero.image", "hero.imageAlt", "/landing/hero-command-center.png", {
              fill: true,
              className: "object-cover object-center",
              sizes: "100vw",
              priority: true,
              label: "Cambiar imagen del hero",
            })}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0B1B4D]/92 via-[#0B1B4D]/75 to-[#0B1B4D]/35" />
            <div
              className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 20% 40%, rgba(0,194,255,0.35), transparent 55%), radial-gradient(ellipse 50% 50% at 85% 70%, rgba(192,38,255,0.3), transparent 50%)",
              }}
            />
          </div>

          <div className="relative mx-auto flex min-h-[min(100svh,920px)] max-w-7xl flex-col justify-center px-6 py-24">
            <div className="max-w-2xl cm-animate-fade-up">
              <div className="mb-5 inline-flex max-w-full items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#00C2FF]">
                <Target className="h-3.5 w-3.5 shrink-0" />
                {text("hero.eyebrow", "bg-transparent uppercase tracking-[0.22em] text-[#00C2FF]", {
                  label: "Etiqueta",
                })}
              </div>
              {editing ? (
                <EditableText
                  value={c("hero.headline")}
                  onChange={(v) => set?.("hero.headline", v)}
                  multiline
                  label="Titular"
                  className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
                  style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                />
              ) : (
                <h1
                  className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
                  style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                >
                  {c("hero.headline")}
                </h1>
              )}
              {editing ? (
                <EditableText
                  value={c("hero.subtitle")}
                  onChange={(v) => set?.("hero.subtitle", v)}
                  multiline
                  label="Subtítulo"
                  className="mt-6 max-w-xl text-lg leading-relaxed text-slate-200/95"
                />
              ) : (
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-200/95">
                  {c("hero.subtitle")}
                </p>
              )}
              <div className="mt-10 flex flex-wrap gap-4">
                {editing ? (
                  <div className="cm-btn-primary inline-flex cursor-default items-center gap-2 px-7 py-3.5 text-sm shadow-lg shadow-[#2F6BFF]/25">
                    <EditableText
                      value={c("hero.ctaPrimary")}
                      onChange={(v) => set?.("hero.ctaPrimary", v)}
                      className="text-center text-inherit"
                      label="Botón"
                    />
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </div>
                ) : (
                  <ContactDemoButton
                    label={c("hero.ctaPrimary") || "Solicitar una demo"}
                    className="cm-btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-sm shadow-lg shadow-[#2F6BFF]/25"
                  />
                )}
                <CtaSecondary
                  href="/demo"
                  labelKey="hero.ctaSecondary"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="border-b border-slate-200/80 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center cm-animate-fade-in">
              {editing ? (
                <>
                  <EditableText
                    value={c("pillars.title")}
                    onChange={(v) => set?.("pillars.title", v)}
                    multiline
                    label="Título sección"
                    className="text-center text-3xl font-bold tracking-tight text-[#0B1B4D] sm:text-4xl"
                    style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                  />
                  <EditableText
                    value={c("pillars.subtitle")}
                    onChange={(v) => set?.("pillars.subtitle", v)}
                    multiline
                    label="Subtítulo"
                    className="mt-4 text-center text-lg text-slate-600"
                  />
                </>
              ) : (
                <>
                  <h2
                    className="text-3xl font-bold tracking-tight text-[#0B1B4D] sm:text-4xl"
                    style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                  >
                    {c("pillars.title")}
                  </h2>
                  <p className="mt-4 text-lg text-slate-600">{c("pillars.subtitle")}</p>
                </>
              )}
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((pillar, i) => {
                const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
                return (
                  <article key={`pillar-${i}`} className="group">
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md"
                      style={{ background: "var(--cm-grad)" }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    {editing ? (
                      <>
                        <EditableText
                          value={pillar.title}
                          onChange={(v) =>
                            set?.(
                              "pillars.items",
                              updateObjectArrayItem<TitleDesc>(
                                c("pillars.items"),
                                i,
                                { title: v },
                                pillars
                              )
                            )
                          }
                          label={`Pilar ${i + 1} · título`}
                          className="text-lg font-semibold text-[#0B1B4D]"
                        />
                        <EditableText
                          value={pillar.description}
                          onChange={(v) =>
                            set?.(
                              "pillars.items",
                              updateObjectArrayItem<TitleDesc>(
                                c("pillars.items"),
                                i,
                                { description: v },
                                pillars
                              )
                            )
                          }
                          multiline
                          label={`Pilar ${i + 1} · texto`}
                          className="mt-2 text-sm leading-relaxed text-slate-600"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-[#0B1B4D]">{pillar.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {pillar.description}
                        </p>
                      </>
                    )}
                    <div
                      className="mt-4 h-0.5 w-10 origin-left scale-x-100 transition group-hover:scale-x-150"
                      style={{ background: "var(--cm-grad)" }}
                    />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* How to */}
        <section className="border-b border-slate-200/80 bg-[#F7F9FF] py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              {editing ? (
                <>
                  <EditableText
                    value={c("howto.title")}
                    onChange={(v) => set?.("howto.title", v)}
                    multiline
                    label="Título"
                    className="text-center text-3xl font-bold tracking-tight text-[#0B1B4D] sm:text-4xl"
                    style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                  />
                  <EditableText
                    value={c("howto.subtitle")}
                    onChange={(v) => set?.("howto.subtitle", v)}
                    multiline
                    label="Subtítulo"
                    className="mt-4 text-center text-lg text-slate-600"
                  />
                </>
              ) : (
                <>
                  <h2
                    className="text-3xl font-bold tracking-tight text-[#0B1B4D] sm:text-4xl"
                    style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                  >
                    {c("howto.title")}
                  </h2>
                  <p className="mt-4 text-lg text-slate-600">{c("howto.subtitle")}</p>
                </>
              )}
            </div>

            <div className="mt-14 space-y-16">
              {howtoNumbered.map((step, index) => {
                const reverse = index % 2 === 1;
                return (
                  <HowToArticle
                    key={`howto-${index}`}
                    step={step}
                    index={index}
                    reverse={reverse}
                    showStepBadge
                    editing={editing}
                    uploadingKey={editor?.uploadingKey}
                    onChangeTitle={(v) =>
                      set?.(
                        "howto.steps",
                        updateObjectArrayItem<HowStep>(
                          c("howto.steps"),
                          index,
                          { title: v },
                          howto
                        )
                      )
                    }
                    onChangeDescription={(v) =>
                      set?.(
                        "howto.steps",
                        updateObjectArrayItem<HowStep>(
                          c("howto.steps"),
                          index,
                          { description: v },
                          howto
                        )
                      )
                    }
                    onUploadImage={(file) =>
                      editor?.onUploadImage(`howto.steps.${index}.image`, file)
                    }
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Bloques independientes (antes “Paso 4+”) — mismo sitio, sin número de paso */}
        {howtoIndependent.map(({ step, originalIndex }, i) => {
          const reverse = originalIndex % 2 === 1;
          return (
            <section
              key={`howto-independent-${originalIndex}`}
              className={`border-b border-slate-200/80 py-20 ${
                i % 2 === 0 ? "bg-white" : "bg-[#F7F9FF]"
              }`}
            >
              <div className="mx-auto max-w-7xl px-6">
                <HowToArticle
                  step={step}
                  index={originalIndex}
                  reverse={reverse}
                  showStepBadge={false}
                  editing={editing}
                  uploadingKey={editor?.uploadingKey}
                  onChangeTitle={(v) =>
                    set?.(
                      "howto.steps",
                      updateObjectArrayItem<HowStep>(
                        c("howto.steps"),
                        originalIndex,
                        { title: v },
                        howto
                      )
                    )
                  }
                  onChangeDescription={(v) =>
                    set?.(
                      "howto.steps",
                      updateObjectArrayItem<HowStep>(
                        c("howto.steps"),
                        originalIndex,
                        { description: v },
                        howto
                      )
                    )
                  }
                  onUploadImage={(file) =>
                    editor?.onUploadImage(`howto.steps.${originalIndex}.image`, file)
                  }
                />
              </div>
            </section>
          );
        })}

        {/* Ecosystem */}
        <section className="border-b border-slate-200/80 bg-white py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl shadow-lg shadow-slate-200/70">
              {img("ecosystem.image", "ecosystem.imageAlt", "/landing/ecosystem-connection.png", {
                width: 1280,
                height: 720,
                label: "Cambiar foto ecosistema",
              })}
            </div>
            <div>
              {editing ? (
                <>
                  <EditableText
                    value={c("ecosystem.title")}
                    onChange={(v) => set?.("ecosystem.title", v)}
                    multiline
                    label="Título"
                    className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                    style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                  />
                  <EditableText
                    value={c("ecosystem.subtitle")}
                    onChange={(v) => set?.("ecosystem.subtitle", v)}
                    multiline
                    label="Texto"
                    className="mt-4 text-lg leading-relaxed text-slate-600"
                  />
                </>
              ) : (
                <>
                  <h2
                    className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                    style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                  >
                    {c("ecosystem.title")}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-slate-600">
                    {c("ecosystem.subtitle")}
                  </p>
                </>
              )}
              <ul className="mt-8 space-y-3">
                {ecoBullets.map((item, i) => (
                  <li key={`eco-${i}`} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6BFF]" />
                    {editing ? (
                      <EditableText
                        value={item}
                        onChange={(v) =>
                          set?.(
                            "ecosystem.bullets",
                            updateStringArrayItem(c("ecosystem.bullets"), i, v, ecoBullets)
                          )
                        }
                        className="flex-1 text-sm text-slate-700"
                        label={`Beneficio ${i + 1}`}
                      />
                    ) : (
                      item
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Intelligence */}
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-[#0B1B4D] py-20 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 10% 20%, rgba(0,194,255,0.25), transparent), radial-gradient(ellipse 50% 50% at 90% 80%, rgba(192,38,255,0.22), transparent)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              {editing ? (
                <>
                  <EditableText
                    value={c("intelligence.title")}
                    onChange={(v) => set?.("intelligence.title", v)}
                    multiline
                    label="Título"
                    className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
                    style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                  />
                  <EditableText
                    value={c("intelligence.subtitle")}
                    onChange={(v) => set?.("intelligence.subtitle", v)}
                    multiline
                    label="Subtítulo"
                    className="mt-4 text-center text-lg text-blue-100/90"
                  />
                </>
              ) : (
                <>
                  <h2
                    className="text-3xl font-bold tracking-tight sm:text-4xl"
                    style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                  >
                    {c("intelligence.title")}
                  </h2>
                  <p className="mt-4 text-lg text-blue-100/90">{c("intelligence.subtitle")}</p>
                </>
              )}
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {intelligence.map((feature, i) => {
                const Icon = INTEL_ICONS[i % INTEL_ICONS.length];
                return (
                  <article
                    key={`intel-${i}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#00C2FF]">
                      <Icon className="h-5 w-5" />
                    </div>
                    {editing ? (
                      <>
                        <EditableText
                          value={feature.title}
                          onChange={(v) =>
                            set?.(
                              "intelligence.items",
                              updateObjectArrayItem<TitleDesc>(
                                c("intelligence.items"),
                                i,
                                { title: v },
                                intelligence
                              )
                            )
                          }
                          label={`Capacidad ${i + 1}`}
                          className="text-lg font-semibold text-white"
                        />
                        <EditableText
                          value={feature.description}
                          onChange={(v) =>
                            set?.(
                              "intelligence.items",
                              updateObjectArrayItem<TitleDesc>(
                                c("intelligence.items"),
                                i,
                                { description: v },
                                intelligence
                              )
                            )
                          }
                          multiline
                          label="Descripción"
                          className="mt-2 text-sm leading-relaxed text-blue-100/80"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-blue-100/80">
                          {feature.description}
                        </p>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section className="border-b border-slate-200/80 bg-[#F7F9FF] py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                {editing ? (
                  <>
                    <EditableText
                      value={c("analytics.title")}
                      onChange={(v) => set?.("analytics.title", v)}
                      multiline
                      label="Título analítica"
                      className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                      style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                    />
                    <EditableText
                      value={c("analytics.subtitle")}
                      onChange={(v) => set?.("analytics.subtitle", v)}
                      multiline
                      label="Texto"
                      className="mt-4 text-lg leading-relaxed text-slate-600"
                    />
                  </>
                ) : (
                  <>
                    <h2
                      className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                      style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                    >
                      {c("analytics.title")}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-slate-600">
                      {c("analytics.subtitle")}
                    </p>
                  </>
                )}
                <div className="mt-8 overflow-hidden rounded-2xl shadow-lg">
                  {img("analytics.image", null, "/landing/analytics-insights.png", {
                    width: 1280,
                    height: 720,
                    label: "Cambiar foto analítica",
                  })}
                </div>
              </div>

              <div>
                {editing ? (
                  <>
                    <EditableText
                      value={c("report.title")}
                      onChange={(v) => set?.("report.title", v)}
                      multiline
                      label="Título informe"
                      className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                      style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                    />
                    <EditableText
                      value={c("report.subtitle")}
                      onChange={(v) => set?.("report.subtitle", v)}
                      multiline
                      label="Texto"
                      className="mt-4 text-lg leading-relaxed text-slate-600"
                    />
                  </>
                ) : (
                  <>
                    <h2
                      className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                      style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                    >
                      {c("report.title")}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-slate-600">
                      {c("report.subtitle")}
                    </p>
                  </>
                )}
                <div className="mt-8 overflow-hidden rounded-2xl shadow-lg">
                  {img("report.image", null, "/landing/weekly-report.png", {
                    width: 1024,
                    height: 768,
                    label: "Cambiar foto informe",
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Channels */}
        <section className="border-b border-slate-200/80 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                {editing ? (
                  <>
                    <EditableText
                      value={c("channels.title")}
                      onChange={(v) => set?.("channels.title", v)}
                      multiline
                      label="Título"
                      className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                      style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                    />
                    <EditableText
                      value={c("channels.subtitle")}
                      onChange={(v) => set?.("channels.subtitle", v)}
                      multiline
                      label="Subtítulo"
                      className="mt-4 text-lg text-slate-600"
                    />
                  </>
                ) : (
                  <>
                    <h2
                      className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                      style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                    >
                      {c("channels.title")}
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">{c("channels.subtitle")}</p>
                  </>
                )}
                <ul className="mt-8 space-y-3">
                  {channels.map((channel, i) => (
                    <li
                      key={`ch-${i}`}
                      className="flex items-center gap-3 border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2F6BFF]" />
                      {editing ? (
                        <EditableText
                          value={channel}
                          onChange={(v) =>
                            set?.(
                              "channels.items",
                              updateStringArrayItem(c("channels.items"), i, v, channels)
                            )
                          }
                          className="flex-1 text-sm font-medium text-slate-700"
                          label={`Canal ${i + 1}`}
                        />
                      ) : (
                        channel
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#F7F9FF] to-white p-8 shadow-sm">
                <div
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
                  style={{ background: "var(--cm-grad)" }}
                />
                {editing ? (
                  <>
                    <EditableText
                      value={c("flow.title")}
                      onChange={(v) => set?.("flow.title", v)}
                      label="Título flujo"
                      className="relative text-xl font-semibold text-[#0B1B4D]"
                      style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                    />
                    <EditableText
                      value={c("flow.subtitle")}
                      onChange={(v) => set?.("flow.subtitle", v)}
                      multiline
                      label="Texto flujo"
                      className="relative mt-3 text-sm leading-relaxed text-slate-600"
                    />
                  </>
                ) : (
                  <>
                    <h3
                      className="relative text-xl font-semibold text-[#0B1B4D]"
                      style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                    >
                      {c("flow.title")}
                    </h3>
                    <p className="relative mt-3 text-sm leading-relaxed text-slate-600">
                      {c("flow.subtitle")}
                    </p>
                  </>
                )}
                <div className="relative mt-6 space-y-4">
                  {flowSteps.map((stepText, i) => (
                    <div key={`flow-${i}`} className="flex items-start gap-4">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: "var(--cm-grad)" }}
                      >
                        {i + 1}
                      </span>
                      {editing ? (
                        <EditableText
                          value={stepText}
                          onChange={(v) =>
                            set?.(
                              "flow.steps",
                              updateStringArrayItem(c("flow.steps"), i, v, flowSteps)
                            )
                          }
                          className="flex-1 pt-1 text-sm text-slate-700"
                          label={`Paso ${i + 1}`}
                        />
                      ) : (
                        <p className="pt-1 text-sm text-slate-700">{stepText}</p>
                      )}
                    </div>
                  ))}
                </div>
                {editing ? (
                  <span className="relative mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2F6BFF]">
                    Ver plataforma
                    <ArrowRight className="h-4 w-4" />
                  </span>
                ) : (
                  <Link
                    href="/demo"
                    className="relative mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2F6BFF] transition hover:text-[#C026FF]"
                  >
                    Ver plataforma
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Expansion */}
        <section className="border-b border-slate-200/80 bg-[#F7F9FF] py-20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            {editing ? (
              <>
                <EditableText
                  value={c("expansion.title")}
                  onChange={(v) => set?.("expansion.title", v)}
                  multiline
                  label="Título"
                  className="text-center text-3xl font-bold tracking-tight text-[#0B1B4D]"
                  style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                />
                <EditableText
                  value={c("expansion.subtitle")}
                  onChange={(v) => set?.("expansion.subtitle", v)}
                  multiline
                  label="Subtítulo"
                  className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600"
                />
              </>
            ) : (
              <>
                <h2
                  className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                  style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                >
                  {c("expansion.title")}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                  {c("expansion.subtitle")}
                </p>
              </>
            )}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {expansion.map((vertical, i) =>
                editing ? (
                  <div
                    key={`exp-${i}`}
                    className={`min-w-[160px] rounded-full border px-5 py-2.5 text-sm font-medium ${
                      vertical.active
                        ? "border-transparent text-white"
                        : "border-slate-300 bg-white text-slate-600"
                    }`}
                    style={vertical.active ? { background: "var(--cm-grad)" } : undefined}
                  >
                    <EditableText
                      value={vertical.label}
                      onChange={(v) =>
                        set?.(
                          "expansion.items",
                          updateObjectArrayItem<ExpansionItem>(
                            c("expansion.items"),
                            i,
                            { label: v },
                            expansion
                          )
                        )
                      }
                      className={`text-center text-sm font-medium ${
                        vertical.active ? "text-white" : "text-slate-600"
                      }`}
                      label={vertical.active ? "Activo" : "Próximo"}
                    />
                  </div>
                ) : (
                  <span
                    key={`exp-${i}`}
                    className={`rounded-full border px-5 py-2.5 text-sm font-medium ${
                      vertical.active
                        ? "border-transparent text-white"
                        : "border-slate-300 bg-white text-slate-600"
                    }`}
                    style={vertical.active ? { background: "var(--cm-grad)" } : undefined}
                  >
                    {vertical.label}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-white py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(47,107,255,0.12), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            {editing ? (
              <>
                <EditableText
                  value={c("cta.title")}
                  onChange={(v) => set?.("cta.title", v)}
                  multiline
                  label="Título CTA"
                  className="text-center text-3xl font-bold tracking-tight text-[#0B1B4D] sm:text-4xl"
                  style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                />
                <EditableText
                  value={c("cta.subtitle")}
                  onChange={(v) => set?.("cta.subtitle", v)}
                  multiline
                  label="Subtítulo CTA"
                  className="mt-4 text-center text-lg text-slate-600"
                />
              </>
            ) : (
              <>
                <h2
                  className="text-3xl font-bold tracking-tight text-[#0B1B4D] sm:text-4xl"
                  style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                >
                  {c("cta.title")}
                </h2>
                <p className="mt-4 text-lg text-slate-600">{c("cta.subtitle")}</p>
              </>
            )}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {editing ? (
                <div className="cm-btn-primary inline-flex cursor-default items-center gap-2 px-8 py-4 text-sm shadow-lg shadow-[#2F6BFF]/25">
                  <EditableText
                    value={c("cta.primary")}
                    onChange={(v) => set?.("cta.primary", v)}
                    className="text-center text-inherit"
                    label="Botón"
                  />
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </div>
              ) : (
                <ContactDemoButton
                  label={c("cta.primary") || "Solicitar una demo"}
                  className="cm-btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm shadow-lg shadow-[#2F6BFF]/25"
                />
              )}
              <CtaSecondary
                href="/demo"
                labelKey="cta.secondary"
                className="cm-btn-secondary inline-flex items-center gap-2 px-8 py-4 text-sm"
              />
            </div>
          </div>
        </section>
      </main>

      <LandingFooter
        blurb={c("footer.blurb")}
        email={c("footer.email") || "ventas@centralmark.cl"}
        disableLinks={editing}
        blurbSlot={
          editing ? (
            <EditableText
              value={c("footer.blurb")}
              onChange={(v) => set?.("footer.blurb", v)}
              multiline
              label="Descripción footer"
              className="max-w-md text-sm leading-relaxed text-slate-400"
            />
          ) : undefined
        }
        emailSlot={
          editing ? (
            <EditableText
              value={c("footer.email")}
              onChange={(v) => set?.("footer.email", v)}
              label="Email"
              className="mt-2 text-sm font-medium text-[#00C2FF]"
            />
          ) : undefined
        }
      />
    </div>
  );
}

/** Usado por el editor al subir fotos de pasos howto */
export function patchHowtoStepImage(
  rawSteps: string,
  index: number,
  imageUrl: string
): string {
  const steps = parseJsonArray<HowStep>(rawSteps, []);
  return updateObjectArrayItem<HowStep>(rawSteps, index, { image: imageUrl }, steps);
}
