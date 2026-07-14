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

const PILLAR_ICONS = [Target, Lightbulb, FileText, BarChart3] as const;
const INTEL_ICONS = [Lightbulb, Bell, CalendarClock, BarChart3, Target, FileText] as const;

type Props = {
  content: Record<string, string>;
};

export function CentralMarkLanding({ content }: Props) {
  const c = (key: string) => content[key] ?? "";

  const pillars = parseJsonField<Array<{ title: string; description: string }>>(
    c("pillars.items"),
    []
  );
  const howto = parseJsonField<
    Array<{ title: string; description: string; image: string; imageAlt: string }>
  >(c("howto.steps"), []);
  const ecoBullets = parseJsonField<string[]>(c("ecosystem.bullets"), []);
  const intelligence = parseJsonField<Array<{ title: string; description: string }>>(
    c("intelligence.items"),
    []
  );
  const channels = parseJsonField<string[]>(c("channels.items"), []);
  const flowSteps = parseJsonField<string[]>(c("flow.steps"), []);
  const expansion = parseJsonField<Array<{ label: string; active: boolean }>>(
    c("expansion.items"),
    []
  );

  return (
    <div className="min-h-screen bg-[#F7F9FF] text-[#0B1B4D]">
      <LandingNavbar ctaLabel={c("nav.cta") || "Solicitar demo"} />

      <main>
        {/* Hero — brand-first, full-bleed image plane */}
        <section className="relative min-h-[min(100svh,920px)] overflow-hidden border-b border-slate-200/80">
          <div className="absolute inset-0">
            <Image
              src={c("hero.image") || "/landing/hero-command-center.png"}
              alt={c("hero.imageAlt") || "CentralMark"}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1B4D]/92 via-[#0B1B4D]/75 to-[#0B1B4D]/35" />
            <div
              className="absolute inset-0 opacity-40 mix-blend-overlay"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 20% 40%, rgba(0,194,255,0.35), transparent 55%), radial-gradient(ellipse 50% 50% at 85% 70%, rgba(192,38,255,0.3), transparent 50%)",
              }}
            />
          </div>

          <div className="relative mx-auto flex min-h-[min(100svh,920px)] max-w-7xl flex-col justify-center px-6 py-24">
            <div className="max-w-2xl cm-animate-fade-up">
              <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#00C2FF]">
                <Target className="h-3.5 w-3.5" />
                {c("hero.eyebrow")}
              </p>
              <h1
                className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {c("hero.headline")}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-200/95">
                {c("hero.subtitle")}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/tienda"
                  className="cm-btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-sm shadow-lg shadow-[#2F6BFF]/25"
                >
                  {c("hero.ctaPrimary")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  {c("hero.ctaSecondary")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Value pillars */}
        <section className="border-b border-slate-200/80 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center cm-animate-fade-in">
              <h2
                className="text-3xl font-bold tracking-tight text-[#0B1B4D] sm:text-4xl"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {c("pillars.title")}
              </h2>
              <p className="mt-4 text-lg text-slate-600">{c("pillars.subtitle")}</p>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((pillar, i) => {
                const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
                return (
                  <article key={pillar.title} className="group">
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md"
                      style={{ background: "var(--cm-grad)" }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0B1B4D]">{pillar.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {pillar.description}
                    </p>
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

        {/* How it works — image rich */}
        <section className="border-b border-slate-200/80 bg-[#F7F9FF] py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2
                className="text-3xl font-bold tracking-tight text-[#0B1B4D] sm:text-4xl"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {c("howto.title")}
              </h2>
              <p className="mt-4 text-lg text-slate-600">{c("howto.subtitle")}</p>
            </div>

            <div className="mt-14 space-y-16">
              {howto.map((step, index) => {
                const reverse = index % 2 === 1;
                return (
                  <article
                    key={step.title}
                    className={`grid items-center gap-10 lg:grid-cols-2 ${
                      reverse ? "" : ""
                    }`}
                  >
                    <div className={reverse ? "lg:order-2" : ""}>
                      <span
                        className="mb-3 inline-flex h-9 items-center rounded-full px-3 text-xs font-bold uppercase tracking-wider text-white"
                        style={{ background: "var(--cm-grad)" }}
                      >
                        Paso {index + 1}
                      </span>
                      <h3
                        className="text-2xl font-bold text-[#0B1B4D]"
                        style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                      >
                        {step.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-slate-600">
                        {step.description}
                      </p>
                    </div>
                    <div
                      className={`relative overflow-hidden rounded-2xl shadow-xl shadow-slate-200/80 cm-animate-float ${
                        reverse ? "lg:order-1" : ""
                      }`}
                      style={{ animationDelay: `${index * 0.4}s` }}
                    >
                      <div
                        className="absolute inset-0 z-10 pointer-events-none opacity-30"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(0,194,255,0.25), transparent 40%, rgba(192,38,255,0.2))",
                        }}
                      />
                      <Image
                        src={step.image}
                        alt={step.imageAlt || step.title}
                        width={1280}
                        height={800}
                        className="h-auto w-full object-cover"
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Ecosystem */}
        <section className="border-b border-slate-200/80 bg-white py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl shadow-lg shadow-slate-200/70">
              <Image
                src={c("ecosystem.image") || "/landing/ecosystem-connection.png"}
                alt={c("ecosystem.imageAlt") || "Ecosistema CentralMark"}
                width={1280}
                height={720}
                className="h-auto w-full object-cover"
              />
            </div>
            <div>
              <h2
                className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {c("ecosystem.title")}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                {c("ecosystem.subtitle")}
              </p>
              <ul className="mt-8 space-y-3">
                {ecoBullets.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6BFF]" />
                    {item}
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
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {c("intelligence.title")}
              </h2>
              <p className="mt-4 text-lg text-blue-100/90">{c("intelligence.subtitle")}</p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {intelligence.map((feature, i) => {
                const Icon = INTEL_ICONS[i % INTEL_ICONS.length];
                return (
                  <article
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#00C2FF]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-blue-100/80">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Analytics + report */}
        <section className="border-b border-slate-200/80 bg-[#F7F9FF] py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2
                  className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                  style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                >
                  {c("analytics.title")}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  {c("analytics.subtitle")}
                </p>
                <div className="mt-8 overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    src={c("analytics.image") || "/landing/analytics-insights.png"}
                    alt="Analítica CentralMark"
                    width={1280}
                    height={720}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>

              <div>
                <h2
                  className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                  style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                >
                  {c("report.title")}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  {c("report.subtitle")}
                </p>
                <div className="mt-8 overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    src={c("report.image") || "/landing/weekly-report.png"}
                    alt="Informe semanal CentralMark"
                    width={1024}
                    height={768}
                    className="h-auto w-full object-cover"
                  />
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
                <h2
                  className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
                  style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                >
                  {c("channels.title")}
                </h2>
                <p className="mt-4 text-lg text-slate-600">{c("channels.subtitle")}</p>
                <ul className="mt-8 space-y-3">
                  {channels.map((channel) => (
                    <li
                      key={channel}
                      className="flex items-center gap-3 border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2F6BFF]" />
                      {channel}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#F7F9FF] to-white p-8 shadow-sm">
                <div
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
                  style={{ background: "var(--cm-grad)" }}
                />
                <h3
                  className="relative text-xl font-semibold text-[#0B1B4D]"
                  style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                >
                  {c("flow.title")}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-slate-600">
                  {c("flow.subtitle")}
                </p>
                <div className="relative mt-6 space-y-4">
                  {flowSteps.map((text, i) => (
                    <div key={text} className="flex items-start gap-4">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: "var(--cm-grad)" }}
                      >
                        {i + 1}
                      </span>
                      <p className="pt-1 text-sm text-slate-700">{text}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/tienda"
                  className="relative mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2F6BFF] transition hover:text-[#C026FF]"
                >
                  Probar el flujo de tienda
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Expansion */}
        <section className="border-b border-slate-200/80 bg-[#F7F9FF] py-20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-[#0B1B4D]"
              style={{ fontFamily: "var(--font-outfit), sans-serif" }}
            >
              {c("expansion.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              {c("expansion.subtitle")}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {expansion.map((vertical) => (
                <span
                  key={vertical.label}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium ${
                    vertical.active
                      ? "border-transparent text-white"
                      : "border-slate-300 bg-white text-slate-600"
                  }`}
                  style={vertical.active ? { background: "var(--cm-grad)" } : undefined}
                >
                  {vertical.label}
                </span>
              ))}
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
            <h2
              className="text-3xl font-bold tracking-tight text-[#0B1B4D] sm:text-4xl"
              style={{ fontFamily: "var(--font-outfit), sans-serif" }}
            >
              {c("cta.title")}
            </h2>
            <p className="mt-4 text-lg text-slate-600">{c("cta.subtitle")}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/tienda"
                className="cm-btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm shadow-lg shadow-[#2F6BFF]/25"
              >
                {c("cta.primary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/vitrina"
                className="cm-btn-secondary inline-flex items-center gap-2 px-8 py-4 text-sm"
              >
                {c("cta.secondary")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter blurb={c("footer.blurb")} email={c("footer.email")} />
    </div>
  );
}
