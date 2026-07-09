"use client";

import { CaptionEditor } from "@/components/CaptionEditor";
import { CensoredInput, CensoredTextarea } from "@/components/CensoredField";
import { OfferPreview } from "@/components/OfferPreview";
import { buildDefaultHashtags } from "@/lib/offer/default-copy";
import type { ImageCreationMode } from "@/lib/ai/image-generator";
import type { TextLayer } from "@/lib/image/text-layers";
import { ImagePlus, Layers, Scissors, Sparkles, Upload, Wand2, Zap } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface StoreBranding {
  name: string;
  mallName: string;
  logoUrl?: string | null;
  customHashtags?: string | null;
}

type ImageSource = "ai" | "upload";

export function OfferCreator({
  mallHashtags,
  storeBranding,
  onCreated,
}: {
  mallHashtags?: string;
  storeBranding?: StoreBranding;
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

  async function generatePreview() {
    if (!brief.trim()) {
      setError("Escribe qué quieres publicar");
      return;
    }
    setPreviewLoading(true);
    setError(null);
    resetPreview();

    const res = await fetch("/api/store/preview-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiBrief: brief, creationMode: aiCreationMode }),
    });

    setPreviewLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "No se pudo generar la vista previa");
      return;
    }

    const data = await res.json();
    setPreviewImageUrl(data.previewDataUrl ?? data.previewUrl);
    setActiveCreationMode(
      data.creationMode === "complete" ? "complete" : aiCreationMode
    );
    applyAiSuggestions(data);
  }

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
    if (!previewImageUrl || !exportImage) {
      setError("Primero prepara tu imagen (genera o sube una foto)");
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
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                ¿Cómo quieres crear la imagen?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAiCreationMode("complete");
                    if (previewImageUrl) resetPreview();
                  }}
                  className={`text-left p-3 rounded-xl border transition ${
                    aiCreationMode === "complete"
                      ? "border-mm-yellow/50 bg-mm-yellow/10"
                      : "border-white/10 hover:border-mm-yellow/25"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-white mb-1">
                    <Zap className="w-4 h-4 text-mm-yellow" />
                    Imagen completa (IA)
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Publicación lista para compartir: escena + textos integrados con ortografía
                    verificada.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiCreationMode("editor");
                    if (previewImageUrl) resetPreview();
                  }}
                  className={`text-left p-3 rounded-xl border transition ${
                    aiCreationMode === "editor"
                      ? "border-mm-neon/50 bg-mm-neon/10"
                      : "border-white/10 hover:border-mm-neon/25"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-white mb-1">
                    <Layers className="w-4 h-4 text-mm-neon" />
                    Escena + editor
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    La IA genera solo el fondo; tú editas textos, colores y posición encima.
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Idea para generar la imagen con IA *
              </label>
              <CensoredTextarea
                name="aiBrief"
                value={brief}
                onChange={(v) => {
                  setBrief(v);
                  if (previewImageUrl) resetPreview();
                }}
                rows={5}
                placeholder="Ej: Publicación Instagram, zapatillas Adidas outlet 30% en todos los pares, tienda deportiva…"
                className="w-full bg-mm-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 resize-none"
              />
            </div>

            <p className="text-xs text-neutral-600">
              En &quot;Imagen completa&quot; la IA arma la publicación lista para Instagram. Los textos
              se integran con tipografía real (no los dibuja la IA) para evitar errores de
              ortografía. Usa &quot;Escena + editor&quot; si prefieres armar los textos tú mismo.
            </p>

            <button
              type="button"
              disabled={previewLoading || loading}
              onClick={generatePreview}
              className="w-full py-2.5 rounded-xl bg-mm-neon/90 text-black text-sm hover:bg-mm-neon-dim disabled:opacity-50"
            >
              {previewLoading
                ? "Generando imagen…"
                : aiCreationMode === "complete"
                  ? "✨ Generar publicación completa"
                  : "✨ Generar escena con IA"}
            </button>
          </div>
        )}

        {previewImageUrl && (
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
          disabled={loading || previewLoading || !previewImageUrl}
          className="w-full py-3 rounded-xl mm-btn-primary mm-glow-neon disabled:opacity-50"
        >
          {loading ? "Subiendo publicación…" : "Subir publicación"}
        </button>
      </form>

      <div className="lg:sticky lg:top-24">
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
      </div>
    </div>
  );
}
