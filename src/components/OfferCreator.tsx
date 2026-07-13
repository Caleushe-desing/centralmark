"use client";

import { CaptionEditor } from "@/components/CaptionEditor";
import { CensoredInput, CensoredTextarea } from "@/components/CensoredField";
import {
  DesignEnginePreview,
  type DesignGenerationRequest,
  type DesignPreviewState,
} from "@/components/design-engine/DesignEnginePreview";
import {
  PUBLICATION_INSTRUCTION_HINT,
  PUBLICATION_INSTRUCTION_PLACEHOLDER,
} from "@/lib/design-engine/publication-instruction";
import { buildDefaultHashtags } from "@/lib/offer/default-copy";
import { ImagePlus, Sparkles, Upload, AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CampaignApplyPayload } from "@/components/CampaignStudio";

interface StoreBranding {
  name: string;
  mallName: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  customHashtags?: string | null;
  rubro?: string | null;
  category?: string | null;
  previewImageUrl?: string | null;
}

type ImageSource = "ai" | "upload";

export function OfferCreator({
  mallHashtags,
  storeBranding,
  campaignSeed,
  onCreated,
}: {
  mallHashtags?: string;
  storeBranding?: StoreBranding;
  campaignSeed?: CampaignApplyPayload | null;
  onCreated: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateLockRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource>("ai");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [brief, setBrief] = useState("");
  const [caption, setCaption] = useState("");
  const [offerHashtags, setOfferHashtags] = useState("");
  const [exportImage, setExportImage] = useState<(() => Promise<Blob>) | null>(null);
  const [designTrigger, setDesignTrigger] = useState(0);
  const [generationRequest, setGenerationRequest] = useState<DesignGenerationRequest | null>(null);
  const [designPreview, setDesignPreview] = useState<DesignPreviewState | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [campaignImagePrompt, setCampaignImagePrompt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAiConfigured(Boolean(data?.hasOpenAI)))
      .catch(() => setAiConfigured(false));
  }, []);

  useEffect(() => {
    if (!campaignSeed?.applyId) return;
    setBrief(campaignSeed.brief);
    setCaption(campaignSeed.caption);
    setOfferHashtags(campaignSeed.hashtags);
    setCampaignImagePrompt(campaignSeed.imagePrompt ?? null);
    setError(null);
    setImageSource("ai");
  }, [campaignSeed?.applyId, campaignSeed]);

  const handleRegisterExport = useCallback(
    (exporter: (() => Promise<Blob>) | null) => setExportImage(() => exporter),
    []
  );

  function resetPreview() {
    setExportImage(null);
    setCaption("");
    setOfferHashtags("");
    setDesignPreview(null);
    setGenerationRequest(null);
  }

  function handleFileSelect(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen (JPG, PNG, WebP)");
      return;
    }
    setError(null);
    setUploadedFile(file);
    if (designPreview) resetPreview();
  }

  async function handleGenerate() {
    if (generateLockRef.current || previewLoading) return;

    if (!brief.trim() || brief.trim().length < 10) {
      setError("Describe tu publicación con más detalle (mínimo 10 caracteres)");
      return;
    }
    if (aiConfigured === false) {
      setError(
        "La generación con IA no está disponible. Pide al administrador del mall que configure OPENAI_API_KEY en el servidor."
      );
      return;
    }
    if (imageSource === "upload" && !uploadedFile) {
      setError("Sube una foto de tu producto o elige «Crear imagen con IA»");
      return;
    }

    generateLockRef.current = true;
    setError(null);
    setDesignPreview(null);
    setExportImage(null);

    try {
      let userImageUrl: string | undefined;

      if (imageSource === "upload" && uploadedFile) {
        const formData = new FormData();
        formData.set("image", uploadedFile);
        const uploadRes = await fetch("/api/store/upload-source-image", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error ?? "No se pudo subir la imagen");
        }
        userImageUrl = uploadData.imageUrl as string;
      }

      const clientRequestId = crypto.randomUUID();
      setGenerationRequest({
        clientRequestId,
        imageSource,
        userImageUrl,
      });
      setDesignTrigger((t) => t + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al preparar la generación");
    } finally {
      window.setTimeout(() => {
        generateLockRef.current = false;
      }, 800);
    }
  }

  const handleDesignReady = useCallback((state: DesignPreviewState) => {
    setDesignPreview(state);
    setCaption(state.design.caption);
    setOfferHashtags((prev) =>
      prev.trim() ? prev : buildDefaultHashtags(null, state.design.hook)
    );
  }, []);

  const handlePreviewLoadingChange = useCallback((v: boolean) => {
    setPreviewLoading(v);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exportImage) {
      setError("Primero genera tu publicación");
      return;
    }
    if (!caption.trim()) {
      setError("Falta el texto de la publicación para Instagram/Facebook");
      return;
    }
    if (!offerHashtags.trim()) {
      setError("Agrega al menos un hashtag");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const finalBlob = await exportImage();
      const formData = new FormData();
      formData.set("aiBrief", brief.trim());
      formData.set("caption", caption.trim());
      formData.set("offerHashtags", offerHashtags.trim());
      formData.set("finalImage", finalBlob, `offer-${Date.now()}.png`);

      const res = await fetch("/api/store/offers", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al crear oferta");
      }
      setBrief("");
      setUploadedFile(null);
      resetPreview();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const brandSwatch = storeBranding?.primaryColor ?? "#E11D48";

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <form onSubmit={handleSubmit} className="space-y-4">
        {aiConfigured === false && (
          <div
            role="alert"
            className="flex gap-3 p-4 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-100 text-sm"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-300 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-amber-50">Generación con IA no disponible</p>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Configura <code className="text-amber-100">OPENAI_API_KEY</code> en el servidor para
                crear publicaciones con IA.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-mm-neon" />
          <h2 className="text-lg font-semibold text-white">Nueva publicación</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-mm-surface border border-mm-neon/10">
          <button
            type="button"
            onClick={() => {
              setImageSource("ai");
              resetPreview();
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
              imageSource === "ai" ? "bg-mm-neon text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Crear imagen con IA
          </button>
          <button
            type="button"
            onClick={() => {
              setImageSource("upload");
              resetPreview();
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
              imageSource === "upload"
                ? "bg-mm-neon text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" />
            Usar mi foto
          </button>
        </div>

        {imageSource === "upload" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileSelect(e.dataTransfer.files?.[0] ?? null);
              }}
              className="w-full py-6 rounded-xl border-2 border-dashed border-white/15 hover:border-mm-neon/50 hover:bg-mm-neon/5 transition flex flex-col items-center gap-2"
            >
              <ImagePlus className="w-7 h-7 text-mm-neon" />
              <span className="text-sm text-white font-medium">
                {uploadedFile ? uploadedFile.name : "Arrastra o elige tu foto de producto"}
              </span>
              <span className="text-xs text-neutral-500">Sin costo de imagen IA · JPG, PNG o WebP</span>
            </button>
          </>
        )}

        <div>
          <label className="block text-sm text-neutral-400 mb-1">
            Describe tu publicación *
          </label>
          {campaignImagePrompt && (
            <p className="text-xs text-mm-yellow/90 bg-mm-yellow/5 border border-mm-yellow/20 rounded-lg px-3 py-2 mb-2 leading-relaxed">
              <strong className="text-mm-yellow">Sugerencia de campaña:</strong>{" "}
              {campaignImagePrompt.slice(0, 220)}
              {campaignImagePrompt.length > 220 ? "…" : ""}
            </p>
          )}
          <CensoredTextarea
            name="publicationInstruction"
            value={brief}
            onChange={(v) => {
              setBrief(v);
              if (designPreview) resetPreview();
            }}
            rows={6}
            placeholder={PUBLICATION_INSTRUCTION_PLACEHOLDER}
            className="w-full bg-mm-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 resize-none"
          />
          <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">{PUBLICATION_INSTRUCTION_HINT}</p>
        </div>

        {storeBranding && (
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span
              className="w-4 h-4 rounded-full border border-white/20 shrink-0"
              style={{ backgroundColor: brandSwatch }}
              aria-hidden
            />
            <span>
              La IA usará los colores de tu marca
              {storeBranding.logoUrl ? " y tu logo" : ""}. Configúralos en{" "}
              <a href="/tienda/configuracion" className="text-mm-neon/80 underline">
                Configuración
              </a>
              .
            </span>
          </div>
        )}

        <button
          type="button"
          disabled={previewLoading || loading || aiConfigured === false}
          onClick={handleGenerate}
          className="w-full py-2.5 rounded-xl bg-mm-neon/90 text-black text-sm font-medium hover:bg-mm-neon-dim disabled:opacity-50"
        >
          {previewLoading ? "Creando publicación…" : "✨ Generar publicación"}
        </button>

        {designPreview && (
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Texto para Instagram / Facebook (fuera de la foto) *
              </label>
              <CaptionEditor
                value={caption}
                onChange={setCaption}
                placeholder="La IA generará un caption profesional en español…"
                className="w-full bg-mm-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 resize-none"
              />
              <p className="text-xs text-neutral-600 mt-1">
                Generado por IA en español. Puedes editarlo antes de publicar.
              </p>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Hashtags *</label>
              <CensoredInput
                name="offerHashtags"
                value={offerHashtags}
                onChange={setOfferHashtags}
                placeholder="#Oferta #TuTienda"
                className="w-full bg-mm-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600"
              />
              {mallHashtags && (
                <p className="text-xs text-neutral-500 mt-1">
                  + mall al publicar: <span className="text-mm-neon/70">{mallHashtags}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm whitespace-pre-wrap">{error}</p>}

        {storeBranding && !storeBranding.logoUrl && (
          <p className="text-xs text-amber-400/80">
            Sube el logo en{" "}
            <a href="/tienda/configuracion" className="underline hover:text-amber-300">
              Configuración
            </a>{" "}
            para que aparezca en tus publicaciones.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || previewLoading || !exportImage}
          className="w-full py-3 rounded-xl mm-btn-primary mm-glow-neon disabled:opacity-50"
        >
          {loading ? "Publicando…" : "Publicar en vitrina"}
        </button>
      </form>

      <div className="lg:sticky lg:top-24 space-y-4">
        <DesignEnginePreview
          brief={brief}
          generationRequest={generationRequest}
          trigger={designTrigger}
          logoUrl={storeBranding?.logoUrl}
          onReady={handleDesignReady}
          onExportReady={handleRegisterExport}
          onError={setError}
          onLoadingChange={handlePreviewLoadingChange}
        />
        {!designPreview && !previewLoading && (
          <p className="text-neutral-600 text-sm text-center py-12">
            Escribe tu instrucción y pulsa Generar. La vista previa aparecerá aquí.
          </p>
        )}
      </div>
    </div>
  );
}
