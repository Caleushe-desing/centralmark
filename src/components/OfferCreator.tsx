"use client";

import { CaptionEditor } from "@/components/CaptionEditor";
import { CensoredInput, CensoredTextarea } from "@/components/CensoredField";
import { OfferPreview } from "@/components/OfferPreview";
import { DesignEnginePreview } from "@/components/design-engine/DesignEnginePreview";
import { ArchetypeSelector } from "@/components/design-engine/ArchetypeSelector";
import type { DesignPreviewState } from "@/components/design-engine/DesignEnginePreview";
import type { VisualArchetype } from "@/lib/design-engine/archetypes";
import { DEFAULT_ARCHETYPE } from "@/lib/design-engine/archetypes";
import { buildDefaultHashtags } from "@/lib/offer/default-copy";
import type { ImageCreationMode } from "@/lib/ai/image-generator";
import type { TextLayer } from "@/lib/image/text-layers";
import { ImagePlus, Scissors, Sparkles, Upload, Wand2, AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CampaignApplyPayload } from "@/components/CampaignStudio";

interface StoreBranding {
  name: string;
  mallName: string;
  logoUrl?: string | null;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource>("ai");
  const [aiCreationMode, setAiCreationMode] = useState<ImageCreationMode>("complete");
  const [activeCreationMode, setActiveCreationMode] = useState<ImageCreationMode>("editor");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [brief, setBrief] = useState("");
  const [caption, setCaption] = useState("");
  const [offerHashtags, setOfferHashtags] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMeta, setPreviewMeta] = useState<{
    productName?: string;
    discountPercent?: number | null;
  } | null>(null);
  const [exportImage, setExportImage] = useState<(() => Promise<Blob>) | null>(null);
  const [previewTextLayers, setPreviewTextLayers] = useState<TextLayer[] | undefined>();
  const [captionSuggestLoading, setCaptionSuggestLoading] = useState(false);
  const [campaignImagePrompt, setCampaignImagePrompt] = useState<string | null>(null);
  const [designTrigger, setDesignTrigger] = useState(0);
  const [archetype, setArchetype] = useState<VisualArchetype>(DEFAULT_ARCHETYPE);
  const [designPreview, setDesignPreview] = useState<DesignPreviewState | null>(null);
  const [generationPhase, setGenerationPhase] = useState<string | null>(null);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);

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
    setPreviewMeta({ productName: campaignSeed.productName, discountPercent: null });
    setCampaignImagePrompt(campaignSeed.imagePrompt ?? null);
    setError(null);
    setImageSource("ai");
    setAiCreationMode("complete");
  }, [campaignSeed?.applyId, campaignSeed]);

  const handleRegisterExport = useCallback(
    (exporter: (() => Promise<Blob>) | null) => setExportImage(() => exporter),
    []
  );

  function resetPreview() {
    setPreviewImageUrl(null);
    setPreviewMeta(null);
    setPreviewTextLayers(undefined);
    setExportImage(null);
    setActiveCreationMode("editor");
    setCaption("");
    setOfferHashtags("");
    setUploadedFile(null);
    setDesignPreview(null);
    setGenerationPhase(null);
  }

  function applyAiSuggestions(data: {
    productName?: string;
    discountPercent?: number | null;
    caption?: string;
    suggestedCaption?: string;
    suggestedHashtags?: string;
    offerHashtags?: string;
    textLayers?: TextLayer[];
  }) {
    const meta = {
      productName: data.productName,
      discountPercent: data.discountPercent,
    };
    setPreviewMeta(meta);
    if (data.textLayers?.length) {
      setPreviewTextLayers(data.textLayers);
    }

    if (storeBranding) {
      setCaption(
        data.caption?.trim() || data.suggestedCaption?.trim() || ""
      );
      setOfferHashtags(
        data.offerHashtags?.trim() ||
          data.suggestedHashtags?.trim() ||
          buildDefaultHashtags(null, meta.productName)
      );
    }
  }

  async function suggestCaption() {
    if (!brief.trim()) {
      setError("Escribe primero la idea para la imagen");
      return;
    }
    setCaptionSuggestLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/store/suggest-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiBrief: brief,
          productName: previewMeta?.productName,
          discountPercent: previewMeta?.discountPercent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo sugerir texto");
      setCaption(data.caption);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al sugerir texto");
    } finally {
      setCaptionSuggestLoading(false);
    }
  }

  function generatePreview() {
    if (!brief.trim()) {
      setError("Escribe qué quieres publicar");
      return;
    }
    if (aiConfigured === false) {
      setError(
        "La generación con IA no está disponible. Pide al administrador del mall que configure OPENAI_API_KEY en el servidor."
      );
      return;
    }
    setError(null);
    setDesignPreview(null);
    setPreviewImageUrl(null);
    setExportImage(null);
    setDesignTrigger((t) => t + 1);
  }

  const handleDesignReady = useCallback((state: DesignPreviewState) => {
    setDesignPreview(state);
    setPreviewMeta({ productName: state.design.hook, discountPercent: null });
    setCaption(state.design.caption);
    setOfferHashtags((prev) =>
      prev.trim() ? prev : buildDefaultHashtags(null, state.design.hook)
    );
  }, []);

  const handlePreviewLoadingChange = useCallback((v: boolean) => {
    setPreviewLoading(v);
    if (!v) setGenerationPhase(null);
  }, []);

type UploadMode = "default" | "enhance" | "removeBg";

  async function processUpload(mode: UploadMode = "default") {
    if (!uploadedFile) {
      setError("Selecciona una imagen de tu computador");
      return;
    }

    setPreviewLoading(true);
    setError(null);
    if (mode === "default") {
      setPreviewImageUrl(null);
      setPreviewMeta(null);
      setExportImage(null);
    }

    const formData = new FormData();
    formData.set("image", uploadedFile);
    if (brief.trim()) formData.set("aiBrief", brief);
    if (mode === "enhance") formData.set("enhance", "true");
    if (mode === "removeBg") formData.set("removeBg", "true");

    const res = await fetch("/api/store/upload-offer-image", {
      method: "POST",
      body: formData,
    });

    setPreviewLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "No se pudo procesar la imagen");
      return;
    }

    const data = await res.json();
    setPreviewImageUrl(data.previewDataUrl ?? data.previewUrl);
    setActiveCreationMode("editor");
    applyAiSuggestions(data);

    if (mode === "enhance" && !data.enhanced) {
      setError("La IA no pudo mejorar la imagen — se usó tu foto original.");
    }
  }

  function handleFileSelect(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen (JPG, PNG, WebP)");
      return;
    }
    setError(null);
    setPreviewImageUrl(null);
    setPreviewMeta(null);
    setExportImage(null);
    setCaption("");
    setOfferHashtags("");
    setUploadedFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exportImage) {
      setError("Primero genera tu publicación con el motor de diseño");
      return;
    }
    if (!caption.trim()) {
      setError("Escribe el texto de la publicación");
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
      resetPreview();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

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
                Falta configurar <code className="text-amber-100">OPENAI_API_KEY</code> en el servidor.
                Mientras tanto puedes crear publicaciones subiendo tu propia imagen en la pestaña
                &quot;Subir foto&quot;.
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
              imageSource === "ai"
                ? "bg-mm-neon text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generar con IA
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
            Subir mi foto
          </button>
        </div>

        {imageSource === "upload" ? (
          <div className="space-y-3">
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
              className="w-full py-8 rounded-xl border-2 border-dashed border-white/15 hover:border-mm-neon/50 hover:bg-mm-neon/5 transition flex flex-col items-center gap-2"
            >
              <ImagePlus className="w-8 h-8 text-mm-neon" />
              <span className="text-sm text-white font-medium">
                {uploadedFile ? uploadedFile.name : "Arrastra o elige una imagen"}
              </span>
              <span className="text-xs text-neutral-500">JPG, PNG o WebP · máx. 12 MB</span>
            </button>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Qué quieres comunicar (la IA lee tu foto + este texto)
              </label>
              <CensoredTextarea
                name="uploadBrief"
                value={brief}
                onChange={setBrief}
                rows={3}
                placeholder="Ej: 35% off en zapatos de fútbol, outlet, solo esta semana…"
                className="w-full bg-mm-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                disabled={previewLoading || !uploadedFile}
                onClick={() => processUpload("default")}
                className="py-2.5 rounded-xl bg-mm-neon/90 text-black text-sm hover:bg-mm-neon-dim disabled:opacity-50"
              >
                {previewLoading ? "Procesando…" : "Usar foto + IA"}
              </button>
              <button
                type="button"
                disabled={previewLoading || !uploadedFile}
                onClick={() => processUpload("removeBg")}
                className="py-2.5 rounded-xl border border-emerald-500/40 text-emerald-300 text-sm hover:bg-emerald-500/10 disabled:opacity-50 flex items-center justify-center gap-1"
                title="Recorta el producto y lo pone sobre fondo limpio"
              >
                <Scissors className="w-4 h-4" />
                Quitar fondo
              </button>
              <button
                type="button"
                disabled={previewLoading || !uploadedFile}
                onClick={() => processUpload("enhance")}
                className="py-2.5 rounded-xl border border-mm-yellow/40 text-mm-yellow hover:bg-mm-yellow/10 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Wand2 className="w-4 h-4" />
                Mejorar IA
              </button>
            </div>
            <p className="text-xs text-neutral-600">
              <strong className="text-emerald-400/80">Quitar fondo:</strong> recorta el producto y lo
              centra en fondo blanco tipo catálogo. Mejor calidad con{" "}
              <code className="text-neutral-500">REMOVEBG_API_KEY</code> en .env.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <ArchetypeSelector
              value={archetype}
              onChange={(next) => {
                setArchetype(next);
                if (designPreview) {
                  setDesignPreview(null);
                  setExportImage(null);
                }
              }}
              disabled={previewLoading || loading}
              storeContext={{
                storeName: storeBranding?.name ?? "Tu tienda",
                rubro: storeBranding?.rubro,
                category: storeBranding?.category,
                previewImageUrl: storeBranding?.previewImageUrl,
              }}
            />

            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Idea para tu publicación *
              </label>
              {campaignImagePrompt && (
                <p className="text-xs text-mm-yellow/90 bg-mm-yellow/5 border border-mm-yellow/20 rounded-lg px-3 py-2 mb-2 leading-relaxed">
                  <strong className="text-mm-yellow">Sugerencia de campaña:</strong>{" "}
                  {campaignImagePrompt.slice(0, 220)}
                  {campaignImagePrompt.length > 220 ? "…" : ""}
                </p>
              )}
              <CensoredTextarea
                name="aiBrief"
                value={brief}
                onChange={(v) => {
                  setBrief(v);
                  if (designPreview || previewImageUrl) resetPreview();
                }}
                rows={5}
                placeholder="Ej: Zapatillas Nike outlet 30%, estética editorial premium, urgencia fin de semana…"
                className="w-full bg-mm-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 resize-none"
              />
            </div>

            <p className="text-xs text-neutral-600">
              El Design Engine aplica las reglas del arquetipo elegido a imagen y textos.
            </p>

            <button
              type="button"
              disabled={previewLoading || loading || aiConfigured === false}
              onClick={generatePreview}
              className="w-full py-2.5 rounded-xl bg-mm-neon/90 text-black text-sm hover:bg-mm-neon-dim disabled:opacity-50"
            >
              {previewLoading ? (generationPhase ?? "Generando…") : "✨ Generar con Design Engine"}
            </button>
          </div>
        )}

        {(designPreview || previewImageUrl || caption.trim()) && (
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Texto de la publicación (Instagram/Facebook, fuera de la foto) *
              </label>
              <CaptionEditor
                value={caption}
                onChange={setCaption}
                onSuggest={suggestCaption}
                suggestLoading={captionSuggestLoading}
                placeholder="Ej: 🔥 35% OFF en zapatos de fútbol. Solo hasta agotar stock…"
                className="w-full bg-mm-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 resize-none"
              />
              <p className="text-xs text-neutral-600">
                La IA propone un texto según tu idea; puedes editarlo libremente.
              </p>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Hashtags *</label>
              <CensoredInput
                name="offerHashtags"
                value={offerHashtags}
                onChange={setOfferHashtags}
                placeholder="#Outlet #Futbol #Zapatillas"
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
            Sube el logo de tu tienda en{" "}
            <a href="/tienda/configuracion" className="underline hover:text-amber-300">
              Configuración
            </a>{" "}
            para que aparezca en tus publicaciones (esquina superior derecha).
          </p>
        )}

        <button
          type="submit"
          disabled={loading || previewLoading || !exportImage}
          className="w-full py-3 rounded-xl mm-btn-primary mm-glow-neon disabled:opacity-50"
        >
          {loading ? "Subiendo publicación…" : "Subir publicación"}
        </button>
      </form>

      <div className="lg:sticky lg:top-24">
        {imageSource === "ai" ? (
          <div className="space-y-4">
            <DesignEnginePreview
              brief={brief}
              archetype={archetype}
              trigger={designTrigger}
              onReady={handleDesignReady}
              onExportReady={handleRegisterExport}
              onError={setError}
              onLoadingChange={handlePreviewLoadingChange}
            />
            {!designPreview && !previewLoading && (
              <p className="text-neutral-600 text-sm text-center py-12">
                La vista previa aparecerá aquí al generar
              </p>
            )}
          </div>
        ) : (
          <OfferPreview
            previewImageUrl={previewImageUrl}
            previewLoading={previewLoading}
            creationMode={activeCreationMode}
            productName={previewMeta?.productName}
            discountPercent={previewMeta?.discountPercent ?? undefined}
            caption={caption}
            offerHashtags={offerHashtags}
            mallHashtags={mallHashtags}
            storeName={storeBranding?.name}
            mallName={storeBranding?.mallName}
            logoUrl={storeBranding?.logoUrl}
            initialTextLayers={previewTextLayers}
            onRegisterExport={handleRegisterExport}
          />
        )}
      </div>
    </div>
  );
}
