"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { AdEngine } from "@/components/design-engine";
import type { CompositionLayout } from "@/lib/design-engine/composition/rules";
import type { DesignDocument } from "@/lib/design-engine/schemas";
import { shapeCopyForLayout } from "@/lib/design-engine/copy/shape-slot-copy";
import { buildDemoGeneration } from "@/lib/demo/mock-generate";
import { Loader2 } from "lucide-react";

const POLL_MS = 1500;
const EXPORT_SIZE = 1080;

export interface DesignGenerationRequest {
  clientRequestId: string;
  imageSource: "ai" | "upload";
  userImageUrl?: string;
}

export interface DesignPreviewState {
  design: DesignDocument;
  layout: CompositionLayout;
  imageUrl: string;
  styleName: string;
  costoEstimado?: number;
}

interface DesignEnginePreviewProps {
  brief: string;
  generationRequest: DesignGenerationRequest | null;
  trigger: number;
  logoUrl?: string | null;
  onReady: (state: DesignPreviewState) => void;
  onExportReady: (exporter: (() => Promise<Blob>) | null) => void;
  onError: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  /** Simula el motor real sin OpenAI (misma composición AdEngine). */
  demoMode?: boolean;
  demoBrand?: {
    name: string;
    mallName: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string | null;
    rubro?: string | null;
    previewImageUrl?: string | null;
  };
}

export function DesignEnginePreview({
  brief,
  generationRequest,
  trigger,
  logoUrl,
  onReady,
  onExportReady,
  onError,
  onLoadingChange,
  demoMode = false,
  demoBrand,
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

  const requestRef = useRef(generationRequest);
  requestRef.current = generationRequest;

  const inflightRef = useRef(false);
  const lastStartedRequestId = useRef<string | null>(null);

  const demoModeRef = useRef(demoMode);
  demoModeRef.current = demoMode;
  const demoBrandRef = useRef(demoBrand);
  demoBrandRef.current = demoBrand;

  const setLoad = useCallback((v: boolean) => {
    setLoading(v);
    inflightRef.current = v;
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
    if (!trigger || !generationRequest) return;

    const req = requestRef.current;
    if (!req) return;

    const captured = { ...req };
    const requestKey = captured.clientRequestId;

    if (lastStartedRequestId.current === requestKey) return;
    if (inflightRef.current) return;

    const briefText = briefRef.current.trim();
    if (!briefText) return;

    lastStartedRequestId.current = requestKey;

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let completed = false;
    const callbacks = callbacksRef.current;
    const useDemo = demoModeRef.current;

    async function poll(jobId: string) {
      const res = await fetch(`/api/campaign/generate/${jobId}`);
      const data = await res.json();
      if (cancelled) return;

      if (!res.ok) {
        setLoad(false);
        lastStartedRequestId.current = null;
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
        completed = true;
        return;
      }

      if (data.status === "FAILED") {
        setLoad(false);
        lastStartedRequestId.current = null;
        const msg = data.error ?? "La generación falló";
        setLocalError(msg);
        callbacks.onError(msg);
        return;
      }

      pollTimer = setTimeout(() => poll(jobId), POLL_MS);
    }

    async function startDemo() {
      setLoad(true);
      setPreview(null);
      setLocalError(null);
      callbacks.onExportReady(null);
      setPhaseLabel("Analizando tu instrucción…");
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;
      setPhaseLabel("Componiendo la pieza…");
      await new Promise((r) => setTimeout(r, 600));
      if (cancelled) return;
      setPhaseLabel("Renderizando vista previa…");
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;

      const brand = demoBrandRef.current ?? {
        name: "Tienda demo",
        mallName: "Mall Demo",
        primaryColor: "#2F6BFF",
        secondaryColor: "#0B1B4D",
      };

      try {
        const state = buildDemoGeneration({
          brief: briefText,
          imageSource: captured.imageSource,
          userImageUrl: captured.userImageUrl,
          brand,
        });
        if (cancelled) return;
        setPreview(state);
        callbacks.onReady(state);
        setLoad(false);
        setPhaseLabel(null);
        completed = true;
      } catch (err) {
        if (!cancelled) {
          setLoad(false);
          lastStartedRequestId.current = null;
          const msg = err instanceof Error ? err.message : "Error en demo";
          setLocalError(msg);
          callbacks.onError(msg);
        }
      }
    }

    async function start() {
      setLoad(true);
      setPreview(null);
      setLocalError(null);
      callbacks.onExportReady(null);
      setPhaseLabel("Analizando tu instrucción…");

      try {
        const res = await fetch("/api/campaign/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brief: briefText,
            imageSource: captured.imageSource,
            userImageUrl: captured.userImageUrl,
            clientRequestId: captured.clientRequestId,
          }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          lastStartedRequestId.current = null;
          throw new Error(data.error ?? "No se pudo iniciar la generación");
        }

        await poll(data.jobId);
      } catch (err) {
        if (!cancelled) {
          setLoad(false);
          lastStartedRequestId.current = null;
          const msg = err instanceof Error ? err.message : "Error desconocido";
          setLocalError(msg);
          callbacks.onError(msg);
        }
      }
    }

    if (useDemo) {
      void startDemo();
    } else {
      void start();
    }

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
      if (!completed) {
        // Permite reintentar el mismo requestId si el efecto se reinicia antes de terminar
        if (lastStartedRequestId.current === requestKey) {
          lastStartedRequestId.current = null;
        }
        setLoad(false);
      }
    };
  }, [trigger, generationRequest, setLoad]);

  if (!preview && !loading && !localError) return null;

  return (
    <div className="space-y-3">
      {localError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {localError}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-mm-neon/90">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{phaseLabel ?? "Creando tu publicación…"}</span>
        </div>
      )}
      {preview && (
        <div className="mx-auto flex max-w-full justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
          <div className="origin-top scale-[0.36] sm:scale-[0.42] md:scale-[0.48] lg:scale-[0.38] xl:scale-[0.42]">
            <AdEngine
              ref={composerRef}
              imageUrl={preview.imageUrl}
              logoUrl={logoUrl}
              copy={shapeCopyForLayout(
                {
                  hook: preview.design.hook,
                  badge: preview.design.badge,
                  subtext: preview.design.subtext,
                  cta: preview.design.cta,
                },
                preview.layout
              )}
              layout={preview.layout}
            />
          </div>
        </div>
      )}
    </div>
  );
}
