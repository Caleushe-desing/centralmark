import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  Lightbulb,
  Megaphone,
  Share2,
  Store,
  Target,
  Users,
} from "lucide-react";
import { LandingFooter } from "./LandingFooter";
import { LandingNavbar } from "./LandingNavbar";

const INTELLIGENCE_FEATURES = [
  {
    icon: Lightbulb,
    title: "Propone campañas",
    description:
      "La IA analiza el calendario comercial, estacionalidad y rubros del mall para sugerir campañas coordinadas entre tiendas.",
  },
  {
    icon: Store,
    title: "Detecta tiendas sin promociones",
    description:
      "Identifica qué locales aún no han subido ofertas y envía recordatorios para mantener la vitrina siempre activa.",
  },
  {
    icon: CalendarClock,
    title: "Recomienda horarios de publicación",
    description:
      "Sugiere los mejores momentos para publicar según audiencia, historial y comportamiento de cada canal.",
  },
  {
    icon: BarChart3,
    title: "Compara resultados entre campañas",
    description:
      "Cruza métricas de alcance, engagement y conversión para evaluar qué estrategias funcionan mejor en el mall.",
  },
  {
    icon: Bell,
    title: "Destaca publicaciones de alto rendimiento",
    description:
      "Alerta automáticamente sobre los posts con mejor desempeño para replicar el éxito en futuras campañas.",
  },
  {
    icon: FileText,
    title: "Informe semanal para administración",
    description:
      "Genera un resumen ejecutivo con KPIs, tendencias y recomendaciones listo para la gerencia del centro comercial.",
  },
] as const;

const CONTENT_CHANNELS = [
  "Publicaciones para Instagram y Facebook",
  "Historias y reels con identidad de marca",
  "Correos promocionales segmentados",
  "Anuncios y piezas para pantallas digitales",
  "Contenido coordinado en vitrina del mall",
] as const;

const EXPANSION_VERTICALS = [
  { label: "Centros comerciales", active: true },
  { label: "Cadenas de supermercados", active: false },
  { label: "Aeropuertos comerciales", active: false },
  { label: "Mercados gastronómicos", active: false },
  { label: "Strip centers", active: false },
  { label: "Franquicias multi-sucursal", active: false },
] as const;

const VALUE_PILLARS = [
  {
    icon: Building2,
    title: "Estrategia centralizada",
    description:
      "La administración del mall define la línea general, calendario y prioridades de marketing desde un solo panel.",
  },
  {
    icon: Users,
    title: "Identidad por tienda",
    description:
      "Cada local mantiene su logo, colores, tono de comunicación y redes sociales, respetando su marca propia.",
  },
  {
    icon: Megaphone,
    title: "Contenido generado por IA",
    description:
      "Publicaciones, historias, correos y piezas visuales creadas automáticamente a partir de instrucciones simples.",
  },
  {
    icon: Share2,
    title: "Publicación coordinada",
    description:
      "El sistema distribuye contenido en redes, vitrinas digitales y canales del mall con trazabilidad completa.",
  },
] as const;

export function CentralMarkLanding() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <LandingNavbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.08),transparent)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1E40AF]">
                <Target className="h-3.5 w-3.5" />
                Centro de Marketing Inteligente
              </p>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-[#0F2B5B] sm:text-5xl lg:text-[3.25rem]">
                CentralMark: IA que conecta al mall con todas sus tiendas
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Una plataforma de marketing inteligente para centros comerciales que conecta a la
                administración del mall con cada una de sus tiendas mediante IA generativa. No es solo
                un generador de publicaciones: es el gerente de marketing con IA de todo el centro
                comercial.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/tienda"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0F2B5B] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1E3A6E]"
                >
                  Probar demo interactiva
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#0F2B5B] transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Ver panel de administración
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xl shadow-slate-200/60">
                <Image
                  src="/landing/hero-command-center.png"
                  alt="Centro de comando de marketing inteligente para centros comerciales"
                  width={1280}
                  height={720}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg sm:block">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Propuesta de valor
                </p>
                <p className="mt-1 max-w-[220px] text-sm font-semibold text-[#0F2B5B]">
                  Todo el marketing del mall, coordinado desde un solo lugar
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Value pillars */}
        <section className="border-b border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#0F2B5B] sm:text-4xl">
                Más que publicar: coordinar el marketing de todo el centro comercial
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                La IA es relativamente fácil de conseguir. Lo difícil es diseñar un producto que
                resuelva el problema específico de coordinar el marketing de un mall completo. Esa
                integración es lo que hace destacar a CentralMark.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUE_PILLARS.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <pillar.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F2B5B]">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Ecosystem */}
        <section className="border-b border-slate-200 bg-white py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
                <Image
                  src="/landing/ecosystem-connection.png"
                  alt="Diagrama de conexión entre administración del mall y tiendas mediante CentralMark"
                  width={1280}
                  height={720}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold tracking-tight text-[#0F2B5B]">
                Un ecosistema conectado: administración y tiendas en sincronía
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                CentralMark une a la gerencia del centro comercial con cada local. La administración
                define estrategia, calendario y estándares; cada tienda aporta su identidad de marca
                y sus promociones. La IA traduce esa coordinación en contenido listo para publicar.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Usuario y acceso independiente para cada tienda",
                  "Logo, colores y tono de comunicación por marca",
                  "Redes sociales y canales conectados por local",
                  "Curaduría central de lo que se muestra en vitrina",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Intelligence features */}
        <section className="border-b border-slate-200 bg-[#0F2B5B] py-20 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Inteligencia de marketing, no solo generación de contenido
              </h2>
              <p className="mt-4 text-lg text-blue-100/90">
                CentralMark actúa como gerente de marketing del mall: propone, detecta, recomienda,
                compara, alerta e informa. Ese es el verdadero valor que pocas plataformas ofrecen en
                un solo lugar.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {INTELLIGENCE_FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-blue-100/80">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics + report */}
        <section className="border-b border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#0F2B5B]">
                  Decisiones basadas en datos, no en intuición
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  Compara el rendimiento entre campañas, identifica qué publicaciones generaron
                  mayor impacto y recibe recomendaciones de horarios óptimos. La administración del
                  mall obtiene visibilidad real sobre el marketing de todas sus tiendas.
                </p>
                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
                  <Image
                    src="/landing/analytics-insights.png"
                    alt="Panel de analítica y comparación de campañas de marketing"
                    width={1280}
                    height={720}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#0F2B5B]">
                  Informe semanal para la gerencia del mall
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  Cada semana, CentralMark entrega un resumen ejecutivo con métricas clave,
                  publicaciones destacadas, tiendas que requieren atención y recomendaciones para la
                  próxima campaña. Información accionable para la toma de decisiones.
                </p>
                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
                  <Image
                    src="/landing/weekly-report.png"
                    alt="Informe semanal de marketing generado por IA para ejecutivos del centro comercial"
                    width={1024}
                    height={768}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content channels */}
        <section className="border-b border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#0F2B5B]">
                  Contenido multicanal generado automáticamente
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  La IA de CentralMark produce piezas adaptadas a cada canal, respetando la identidad
                  visual de cada tienda y las directrices del mall.
                </p>
                <ul className="mt-8 space-y-3">
                  {CONTENT_CHANNELS.map((channel) => (
                    <li
                      key={channel}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2563EB]" />
                      {channel}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-[#0F2B5B]">
                  Flujo simplificado para las tiendas
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Cada local escribe una instrucción en lenguaje natural —por ejemplo, una promoción
                  de temporada— y CentralMark genera la pieza visual, el texto para redes y la
                  publicación coordinada. Sin diseñadores ni agencias para cada oferta.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    { step: "1", text: "La tienda describe su promoción en una sola instrucción" },
                    { step: "2", text: "La IA crea arte, copy y caption en español con su marca" },
                    { step: "3", text: "El mall cura y publica en vitrina y redes sociales" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F2B5B] text-sm font-bold text-white">
                        {item.step}
                      </span>
                      <p className="pt-1 text-sm text-slate-700">{item.text}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/tienda"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] transition hover:text-[#1E40AF]"
                >
                  Probar el flujo de tienda
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Expansion */}
        <section className="border-b border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F2B5B]">
              Diseñado para malls, preparado para crecer
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              CentralMark nace para centros comerciales, pero su arquitectura aplica a cualquier
              ecosistema retail con múltiples operadores bajo una administración central.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {EXPANSION_VERTICALS.map((vertical) => (
                <span
                  key={vertical.label}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium ${
                    vertical.active
                      ? "border-[#0F2B5B] bg-[#0F2B5B] text-white"
                      : "border-slate-300 bg-white text-slate-600"
                  }`}
                >
                  {vertical.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F2B5B] sm:text-4xl">
              CentralMark: la central de marketing inteligente para centros comerciales
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Coordina estrategia, contenido y resultados entre la administración del mall y cada una
              de sus tiendas. Un solo lugar para todo el marketing del centro comercial.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/tienda"
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-8 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#1D4ED8]"
              >
                Acceder a demo de tienda
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/vitrina"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-8 py-4 text-sm font-semibold text-[#0F2B5B] transition hover:bg-slate-50"
              >
                Ver vitrina digital
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
