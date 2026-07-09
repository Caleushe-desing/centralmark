"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { AdEngine } from "@/components/design-engine";
import type { CompositionLayout } from "@/lib/design-engine/composition/rules";
import type { DesignDocument } from "@/lib/design-engine/schemas";
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
  /** Incrementar para disparar nueva generación */
  trigger: number;
  onReady: (state: DesignPreviewState) => void;
  onExportReady: (exporter: (() => Promise<Blob>) | null) => void;
  onError: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function DesignEnginePreview({
  brief,
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

  const setLoad = useCallback(
    (v: boolean) => {
      setLoading(v);
      onLoadingChange?.(v);
    },
    [onLoadingChange]
  );

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
    if (!trigger || !brief.trim()) return;

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout>;

    async function poll(jobId: string) {
      const res = await fetch(`/api/campaign/generate/${jobId}`);
      const data = await res.json();
      if (cancelled) return;

      if (!res.ok) {
        setLoad(false);
        onError(data.error ?? "Error al consultar generación");
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
        onReady(state);
        setLoad(false);
        setPhaseLabel(null);
        return;
      }

      if (data.status === "FAILED") {
        setLoad(false);
        onError(data.error ?? "La generación falló");
        return;
      }

      pollTimer = setTimeout(() => poll(jobId), POLL_MS);
    }

    async function start() {
      setLoad(true);
      setPreview(null);
      onExportReady(null);
      setPhaseLabel("Iniciando…");

      try {
        const res = await fetch("/api/campaign/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief: brief.trim() }),
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
          onError(err instanceof Error ? err.message : "Error desconocido");
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      clearTimeout(pollTimer);
    };
  }, [trigger, brief, onReady, onExportReady, onError, setLoad]);

  if (!preview && !loading) return null;

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-mm-neon/90">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{phaseLabel ?? "Generando diseño premium…"}</span>
        </div>
      )}
      {preview && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black mx-auto max-w-full">
          <div
            className="origin-top-left scale-[0.36] sm:scale-[0.42] md:scale-[0.48] lg:scale-[0.38] xl:scale-[0.42]"
            style={{ width: 1080, height: 1080 * 0.42 }}
          >
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
