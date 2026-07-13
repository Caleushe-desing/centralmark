import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Sparkles, Zap, Share2, Monitor, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-mm-black">
      <Navbar />
      <main>
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mm-neon/10 border border-mm-neon/25 text-mm-neon text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            Marketing con IA para malls
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
            De la oferta al post
            <br />
            <span className="mm-gradient-text">en segundos</span>
          </h1>
          <p className="text-xl text-neutral-400 mt-6 max-w-2xl mx-auto">
            Las tiendas de tu mall suben sus ofertas. MarkAI genera el arte visual,
            los textos y publica en redes sociales y vitrinas digitales.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link
              href="/tienda"
              className="flex items-center gap-2 px-8 py-4 rounded-xl mm-btn-primary mm-glow-neon"
            >
              Crear oferta demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/15 text-neutral-300 hover:bg-white/5 transition"
            >
              Panel admin
            </Link>
            <Link
              href="/vitrina"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-mm-yellow/30 text-mm-yellow hover:bg-mm-yellow/10 transition"
            >
              <Monitor className="w-5 h-5" />
              Ver vitrina
            </Link>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Oferta en 30 segundos",
              desc: "La tienda ingresa producto, descuento y fechas. Nada más.",
            },
            {
              icon: Sparkles,
              title: "IA crea el arte visual",
              desc: "Genera fondo, composición, textos y hashtags listos para publicar.",
            },
            {
              icon: Share2,
              title: "Publicación real",
              desc: "Instagram, Facebook y vitrina digital del mall, todo automático.",
            },
          ].map((item) => (
            <div key={item.title} className="mm-card p-8 hover:border-mm-neon/25 transition">
              <item.icon className="w-10 h-10 text-mm-neon mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-neutral-400">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
