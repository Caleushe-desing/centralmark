"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { AdEngine } from "@/components/design-engine";
import type { CompositionLayout } from "@/lib/design-engine/composition/rules";
import type { DesignDocument } from "@/lib/design-engine/schemas";
import type { VisualArchetype } from "@/lib/design-engine/archetypes";
import { DEFAULT_ARCHETYPE } from "@/lib/design-engine/archetypes";
import { Loader2 } from "lucide-react";

const POLL_MS = 1500;
const EXPORT_SIZE = 1080;

export interface DesignPreviewState {
  design: DesignDocument;
  layout: CompositionLayout;
  imageUrl: string;
  styleName: string;
  costoEstimado?: number;
}

interface DesignEnginePreviewProps {
  brief: string;
  archetype?: VisualArchetype;
  /** Incrementar para disparar nueva generación */
  trigger: number;
  onReady: (state: DesignPreviewState) => void;
  onExportReady: (exporter: (() => Promise<Blob>) | null) => void;
  onError: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function DesignEnginePreview({
  brief,
  archetype = DEFAULT_ARCHETYPE,
  trigger,
  onReady,
  onExportReady,
  onError,
  onLoadingChange,
}: DesignEnginePreviewProps) {
  const composerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [phaseLabel, setPhaseLabel] = useState<string | null>(null);
  const [preview, setPreview] = useState<DesignPreviewState | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const callbacksRef = useRef({ onReady, onError, onExportReady, onLoadingChange });
  callbacksRef.current = { onReady, onError, onExportReady, onLoadingChange };

  const briefRef = useRef(brief);
  briefRef.current = brief;

  const archetypeRef = useRef(archetype);
  archetypeRef.current = archetype;

  const setLoad = useCallback((v: boolean) => {
    setLoading(v);
    callbacksRef.current.onLoadingChange?.(v);
  }, []);

  const registerExport = useCallback(() => {
    const el = composerRef.current;
    if (!el || !preview) {
      onExportReady(null);
      return;
    }
    onExportReady(async () => {
      const dataUrl = await toPng(el, {
        width: EXPORT_SIZE,
        height: EXPORT_SIZE,
        pixelRatio: 1,
        cacheBust: true,
      });
      const res = await fetch(dataUrl);
      return res.blob();
    });
  }, [preview, onExportReady]);

  useEffect(() => {
    if (preview) registerExport();
  }, [preview, registerExport]);

  useEffect(() => {
    if (!trigger) return;

    const briefText = briefRef.current.trim();
    if (!briefText) return;

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout>;
    const callbacks = callbacksRef.current;

    async function poll(jobId: string) {
      const res = await fetch(`/api/campaign/generate/${jobId}`);
      const data = await res.json();
      if (cancelled) return;

      if (!res.ok) {
        setLoad(false);
        const msg = data.error ?? "Error al consultar generación";
        setLocalError(msg);
        callbacks.onError(msg);
        return;
      }

      setPhaseLabel(data.phaseLabel ?? data.phase);

      if (data.status === "COMPLETED" && data.result) {
        const state: DesignPreviewState = {
          design: data.result.design,
          layout: data.result.layout,
          imageUrl: data.result.imageUrl,
          styleName: data.result.styleName,
          costoEstimado: data.result.costoEstimado,
        };
        setPreview(state);
        callbacks.onReady(state);
        setLoad(false);
        setPhaseLabel(null);
        return;
      }

      if (data.status === "FAILED") {
        setLoad(false);
        const msg = data.error ?? "La generación falló";
        setLocalError(msg);
        callbacks.onError(msg);
        return;
      }

      pollTimer = setTimeout(() => poll(jobId), POLL_MS);
    }

    async function start() {
      setLoad(true);
      setPreview(null);
      setLocalError(null);
      callbacks.onExportReady(null);
      setPhaseLabel("Iniciando…");

      try {
        const res = await fetch("/api/campaign/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief: briefText, archetype: archetypeRef.current }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          throw new Error(data.error ?? "No se pudo iniciar la generación");
        }

        await poll(data.jobId);
      } catch (err) {
        if (!cancelled) {
          setLoad(false);
          const msg = err instanceof Error ? err.message : "Error desconocido";
          setLocalError(msg);
          callbacks.onError(msg);
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      clearTimeout(pollTimer);
    };
    // Solo re-disparar cuando el usuario pulsa "Generar" (trigger), no en cada re-render del padre.
  }, [trigger]);

  if (!preview && !loading && !localError) return null;

  return (
    <div className="space-y-3">
      {localError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {localError}
          {localError.includes("OPENAI") && (
            <p className="mt-2 text-xs text-red-200/80">
              El administrador del mall debe agregar una API key válida de OpenAI en el archivo{" "}
              <code className="text-red-100">.env</code> del servidor (
              <code className="text-red-100">OPENAI_API_KEY</code>).
            </p>
          )}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-mm-neon/90">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{phaseLabel ?? "Generando diseño premium…"}</span>
        </div>
      )}
      {preview && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black mx-auto max-w-full flex justify-center">
          <div className="scale-[0.36] sm:scale-[0.42] md:scale-[0.48] lg:scale-[0.38] xl:scale-[0.42] origin-top">
            <AdEngine
              ref={composerRef}
              imageUrl={preview.imageUrl}
              copy={{
                hook: preview.design.hook,
                badge: preview.design.badge,
                subtext: preview.design.subtext,
                cta: preview.design.cta,
              }}
              layout={preview.layout}
            />
          </div>
        </div>
      )}
    </div>
  );
}
