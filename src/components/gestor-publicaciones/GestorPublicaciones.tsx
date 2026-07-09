"use client";

import { useRef, useState, useCallback } from "react";
import {
  Copy,
  Download,
  Loader2,
  Megaphone,
  Sparkles,
  Check,
  DollarSign,
} from "lucide-react";
import type { DesignDocument } from "@/lib/design-engine/schemas";
import type { CompositionLayout } from "@/lib/design-engine/composition/rules";
import { AdEngine } from "@/components/design-engine";
import { downloadDataUrl, exportProAdToPng } from "@/lib/gestor-publicaciones/export-ad";

type GenerationPhase = "idle" | "queued" | "processing" | "done";

const POLL_MS = 1500;

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
  const [phaseLabel, setPhaseLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [design, setDesign] = useState<DesignDocument | null>(null);
  const [layout, setLayout] = useState<CompositionLayout | null>(null);
  const [styleName, setStyleName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [costoEstimado, setCostoEstimado] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);

  const pollJob = useCallback(async (jobId: string): Promise<void> => {
    const res = await fetch(`/api/campaign/generate/${jobId}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error ?? "Error al consultar generación");
    }

    setPhaseLabel(data.phaseLabel ?? data.phase);

    if (data.status === "COMPLETED" && data.result) {
      setDesign(data.result.design);
      setLayout(data.result.layout);
      setStyleName(data.result.styleName);
      setImageUrl(data.result.imageUrl);
      setCostoEstimado(data.result.costoEstimado);
      setPhase("done");
      setLoading(false);
      return;
    }

    if (data.status === "FAILED") {
      throw new Error(data.error ?? "La generación falló");
    }

    await new Promise((r) => setTimeout(r, POLL_MS));
    return pollJob(jobId);
  }, []);

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
    setPhase("queued");
    setPhaseLabel("En cola…");

    try {
      const res = await fetch("/api/campaign/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo iniciar la generación");
      }

      setPhase("processing");
      await pollJob(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setPhase("idle");
      setLoading(false);
    }
  }

  async function handleExport() {
    if (!composerRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await exportProAdToPng(composerRef.current);
      downloadDataUrl(dataUrl, `markmall-ad-${Date.now()}.png`);
    } finally {
      setExporting(false);
    }
  }

  async function copyCaption() {
    if (!design?.caption) return;
    await navigator.clipboard.writeText(design.caption);
    setCaptionCopied(true);
    setTimeout(() => setCaptionCopied(false), 2000);
  }

  const copySlots = design
    ? { hook: design.hook, badge: design.badge, subtext: design.subtext, cta: design.cta }
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-mm-neon">
          <Megaphone className="w-6 h-6" />
          <h1 className="text-2xl font-bold text-white">Gestor de Publicaciones</h1>
        </div>
        <p className="text-neutral-400 text-sm max-w-2xl">
          Motor de diseño editorial unificado — misma calidad que la Tienda. Generación asíncrona con
          control de costos (~$0.17/imagen).
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <label className="block text-sm text-neutral-400">Brief creativo</label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={6}
            placeholder="Ej: Colección verano sneakers premium, 30% solo fin de semana, tono editorial urbano…"
            className="w-full bg-mm-surface border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
          />
          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="w-full py-3 rounded-xl mm-btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? (phaseLabel ?? "Generando…") : "Generar publicación premium"}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        <div className="flex flex-col items-center gap-4">
          {loading && !design && <PreviewSkeleton />}
          {design && layout && imageUrl && copySlots && (
            <>
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl scale-[0.39] origin-top">
                <AdEngine ref={composerRef} imageUrl={imageUrl} copy={copySlots} layout={layout} />
              </div>
              <div className="flex flex-wrap gap-2 justify-center -mt-[62%] pt-4">
                {styleName && (
                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-neutral-300">
                    {styleName}
                  </span>
                )}
                {costoEstimado != null && (
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {costoEstimado.toFixed(2)} USD
                  </span>
                )}
              </div>
              <div className="flex gap-2 w-full max-w-md">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex-1 py-2.5 rounded-xl border border-mm-neon/40 text-mm-neon text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? "Exportando…" : "PNG 1080"}
                </button>
                <button
                  type="button"
                  onClick={copyCaption}
                  className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm text-white flex items-center justify-center gap-2"
                >
                  {captionCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  Caption
                </button>
              </div>
              <p className="text-xs text-neutral-500 text-center max-w-md">{design.caption}</p>
            </>
          )}
          {!loading && !design && (
            <p className="text-neutral-600 text-sm text-center py-16">La vista previa aparecerá aquí</p>
          )}
        </div>
      </div>
    </div>
  );
}
