"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Scissors, X } from "lucide-react";

export interface ProcessedPhoto {
  previewUrl: string;
  imageUrl: string;
  imageNoBgUrl: string;
  file: File;
}

interface ProductPhotoInputProps {
  onProcessed: (photo: ProcessedPhoto) => void;
  onClear?: () => void;
  context?: "promo" | "catalog";
  label?: string;
}

export function ProductPhotoInput({
  onProcessed,
  onClear,
  context = "promo",
  label = "Foto del producto",
}: ProductPhotoInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraCaptureRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedAi, setUsedAi] = useState<boolean | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function processFile(file: File) {
    setError(null);
    setProcessing(true);
    setOriginalUrl(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.set("image", file);
      formData.set("context", context);

      const res = await fetch("/api/image/remove-background", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Error al procesar imagen");
      }

      const data = await res.json();
      const noBgPreview = data.previewDataUrl ?? data.imageNoBgUrl;
      setPreviewUrl(noBgPreview);
      setUsedAi(data.usedAi ?? false);

      onProcessed({
        previewUrl: noBgPreview,
        imageUrl: data.imageUrl,
        imageNoBgUrl: data.imageNoBgUrl,
        file,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al quitar fondo");
      setPreviewUrl(null);
    } finally {
      setProcessing(false);
    }
  }

  async function openLiveCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setShowCamera(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
    } catch {
      cameraCaptureRef.current?.click();
    }
  }

  function captureFromCamera() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    stopCamera();

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
        processFile(file);
      },
      "image/jpeg",
      0.92
    );
  }

  function clearPhoto() {
    setPreviewUrl(null);
    setOriginalUrl(null);
    setUsedAi(null);
    setError(null);
    onClear?.();
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm text-slate-400">{label}</label>

      {!previewUrl && !processing && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5"
          >
            <ImagePlus className="w-4 h-4" />
            Galería
          </button>
          <button
            type="button"
            onClick={openLiveCamera}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mm-neon/20 text-sm text-mm-neon hover:bg-mm-neon/30"
          >
            <Camera className="w-4 h-4" />
            Tomar foto
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraCaptureRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
          e.target.value = "";
        }}
      />

      {processing && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/80 border border-white/10">
          {originalUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={originalUrl} alt="" className="w-16 h-16 object-cover rounded-lg opacity-60" />
          )}
          <div className="flex-1">
            <p className="text-sm text-white flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-mm-neon" />
              Quitando fondo con IA…
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Unos segundos y verás el producto listo</p>
          </div>
        </div>
      )}

      {previewUrl && !processing && (
        <div className="relative rounded-xl border border-emerald-500/30 bg-slate-900/50 p-3">
          <button
            type="button"
            onClick={clearPhoto}
            className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex gap-4 items-center">
            <div
              className="w-24 h-24 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background:
                  "repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%) 50% / 12px 12px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Sin fondo" className="max-w-full max-h-full object-contain p-1" />
            </div>
            <div>
              <p className="text-sm text-emerald-300 flex items-center gap-1.5">
                <Scissors className="w-4 h-4" />
                Fondo eliminado
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {usedAi ? "Procesado con IA (remove.bg)" : "Procesado — agrega REMOVEBG_API_KEY para mejor calidad"}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
          <video
            ref={videoRef}
            playsInline
            muted
            className="max-w-full max-h-[70vh] rounded-xl bg-black"
          />
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={captureFromCamera}
              className="px-6 py-3 rounded-full bg-mm-neon text-black font-semibold"
            >
              Capturar
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-6 py-3 rounded-full border border-white/20 text-slate-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
