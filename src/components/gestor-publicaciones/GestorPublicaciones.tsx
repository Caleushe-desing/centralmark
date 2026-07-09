"use client";

import { useRef, useState } from "react";
import {
  Copy,
  Download,
  Loader2,
  Megaphone,
  Sparkles,
  Check,
  DollarSign,
} from "lucide-react";
import type { ProAdDesign } from "@/lib/pro-ad/schemas";
import type { CompositionLayout } from "@/components/gestor-publicaciones/engine/compositionRules";
import { AdEngine } from "@/components/gestor-publicaciones/engine/AdEngine";
import { downloadDataUrl, exportProAdToPng } from "@/lib/gestor-publicaciones/export-ad";

type GenerationPhase = "idle" | "design" | "image" | "done";

interface ProAdResponse {
  success: boolean;
  design: ProAdDesign;
  layout: CompositionLayout;
  styleName: string;
  imageUrl: string;
  costoEstimado: number;
  error?: string;
}

function PreviewSkeleton() {
  return (
    <div className="w-full max-w-[420px] aspect-square rounded-2xl border border-mm-neon/15 bg-mm-card animate-pulse overflow-hidden">
      <div className="h-full flex flex-col justify-between p-6">
        <div className="space-y-3">
          <div className="h-14 w-3/4 rounded-2xl bg-white/5" />
          <div className="h-8 w-1/3 rounded-xl bg-white/5 ml-auto" />
        </div>
        <div className="h-16 w-full rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

export function GestorPublicaciones() {
  const composerRef = useRef<HTMLDivElement>(null);
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [design, setDesign] = useState<ProAdDesign | null>(null);
  const [layout, setLayout] = useState<CompositionLayout | null>(null);
  const [styleName, setStyleName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [costoEstimado, setCostoEstimado] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);

  async function handleGenerate() {
    const trimmed = brief.trim();
    if (trimmed.length < 3) {
      setError("Escribe al menos 3 caracteres describiendo tu oferta");
      return;
    }

    setLoading(true);
    setError(null);
    setDesign(null);
    setLayout(null);
    setStyleName(null);
    setImageUrl(null);
    setCostoEstimado(null);
    setPhase("design");

    try {
      const res = await fetch("/api/generate-pro-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmed }),
      });

      const data: ProAdResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Error al generar la campaña");
      }

      setPhase("image");
      setDesign(data.design);
      setLayout(data.layout);
      setStyleName(data.styleName);
      setImageUrl(data.imageUrl);
      setCostoEstimado(data.costoEstimado);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setPhase("idle");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    if (!composerRef.current) return;

    setExporting(true);
    try {
      const dataUrl = await exportProAdToPng(composerRef.current);
      downloadDataUrl(dataUrl, `campaña-pro-${Date.now()}.png`);
    } catch {
      setError("No se pudo exportar la imagen. Intenta de nuevo.");
    } finally {
      setExporting(false);
    }
  }

  async function handleCopyCaption() {
    if (!design?.caption) return;
    await navigator.clipboard.writeText(design.caption);
    setCaptionCopied(true);
    setTimeout(() => setCaptionCopied(false), 2000);
  }

  const phaseLabel =
    phase === "design"
      ? "Seleccionando estilo y copy…"
      : phase === "image"
        ? "Renderizando fotografía comercial…"
        : "Generando Campaña Pro…";

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mm-neon/20 bg-mm-neon/5 text-mm-neon text-sm font-medium mb-4">
          <Megaphone className="w-4 h-4" />
          Gestor de Publicaciones
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-3">
          Un texto. <span className="mm-gradient-text">Portada editorial.</span>
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto">
          Estética de revista de moda premium: tipografía serif, acentos finos y ghost buttons.
          La IA elige el layout del Composition Engine y genera la fotografía editorial.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <section className="space-y-6">
          <div className="mm-card p-6 space-y-4">
            <label htmlFor="brief" className="block text-sm font-semibold text-neutral-300">
              Tu brief (un solo texto)
            </label>
            <textarea
              id="brief"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder='Ej: "Zapatillas con 20% descuento solo este fin de semana"'
              rows={5}
              disabled={loading}
              className="w-full rounded-2xl border border-white/10 bg-mm-black/80 px-5 py-4 text-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-mm-neon/40 focus:ring-1 focus:ring-mm-neon/20 resize-none disabled:opacity-50"
            />

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || brief.trim().length < 3}
              className="w-full mm-btn-primary rounded-2xl py-4 text-lg font-black tracking-tight flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {phaseLabel}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generar Campaña Pro
                </>
              )}
            </button>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
          </div>

          {design && layout && styleName && costoEstimado !== null && (
            <div className="mm-card p-6 space-y-4">
              <div className="rounded-xl bg-mm-neon/5 border border-mm-neon/20 px-4 py-3">
                <p className="text-sm text-white font-semibold">
                  Diseño generado estilo <span className="text-mm-neon">{styleName}</span>
                </p>
                <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Costo operativo:{" "}
                  <span className="text-mm-yellow font-mono">${costoEstimado.toFixed(2)} USD</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Categoría: {design.compositionCategory} · Layout: {design.compositionLayoutId}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Copy ensamblado
                </h2>
                <ul className="space-y-2 text-sm">
                  {(["hook", "badge", "subtext", "cta"] as const).map((key) => (
                    <li key={key} className="bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-mm-neon font-mono text-xs uppercase">{key}</span>
                      <span className="text-neutral-300 ml-2">{design[key]}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                    Caption Instagram
                  </h2>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="flex items-center gap-1.5 text-xs text-mm-neon hover:text-mm-yellow transition"
                  >
                    {captionCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {design.caption}
                </p>
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={!imageUrl || exporting}
                className="w-full mm-btn-outline rounded-2xl py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exportando PNG…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exportar PNG 1080×1080
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        <section className="flex flex-col items-center">
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-4 self-start lg:self-center">
            Vista previa
          </p>

          {loading && <PreviewSkeleton />}

          {!loading && design && layout && imageUrl && (
            <div className="relative w-full flex justify-center">
              <div
                className="overflow-hidden rounded-2xl border border-mm-neon/20 shadow-[0_0_60px_rgba(184,255,0,0.08)]"
                style={{ width: 420, height: 420 }}
              >
                <div
                  style={{
                    transform: "scale(0.3889)",
                    transformOrigin: "top left",
                    width: 1080,
                    height: 1080,
                  }}
                >
                  <AdEngine
                    ref={composerRef}
                    imageUrl={imageUrl}
                    copy={{
                      hook: design.hook,
                      badge: design.badge,
                      subtext: design.subtext,
                      cta: design.cta,
                    }}
                    layout={layout}
                  />
                </div>
              </div>
            </div>
          )}

          {!loading && !design && (
            <div className="w-full max-w-[420px] aspect-square rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-neutral-600">
              <Sparkles className="w-10 h-10 opacity-30" />
              <p className="text-sm text-center px-6">
                El Composition Engine ensamblará tu anuncio con reglas profesionales
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
