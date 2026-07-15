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
import { DEMO_PRESETS } from "@/lib/design-engine/demo-presets";
import { buildDefaultHashtags } from "@/lib/offer/default-copy";
import { createClientId } from "@/lib/id";
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
  demoMode = false,
  configHref = "/tienda/configuracion",
}: {
  mallHashtags?: string;
  storeBranding?: StoreBranding;
  campaignSeed?: CampaignApplyPayload | null;
  onCreated: () => void;
  /** Misma UI; generación y guardado locales sin OpenAI ni API. */
  demoMode?: boolean;
  configHref?: string;
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
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(demoMode ? true : null);
  const [campaignImagePrompt, setCampaignImagePrompt] = useState<string | null>(null);

  useEffect(() => {
    if (demoMode) {
      setAiConfigured(true);
      return;
    }
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAiConfigured(Boolean(data?.hasOpenAI)))
      .catch(() => setAiConfigured(false));
  }, [demoMode]);

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
    if (!demoMode && aiConfigured === false) {
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
        if (demoMode) {
          userImageUrl = URL.createObjectURL(uploadedFile);
        } else {
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
      }

      const clientRequestId = createClientId();
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

      if (demoMode) {
        const { loadDemoState, saveDemoState, newDemoOfferId } = await import("@/lib/demo/store");
        const reader = new FileReader();
        const imageDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
          reader.readAsDataURL(finalBlob);
        });

        const pctMatch = brief.match(/(\d{1,2})\s*%/);
        const discountPercent = pctMatch ? Number(pctMatch[1]) : 0;
        const productName =
          designPreview?.design.hook?.slice(0, 48) ||
          brief.trim().split(/[.!\n]/)[0]?.trim().slice(0, 48) ||
          "Publicación demo";

        const state = loadDemoState();
        const now = new Date();
        const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        state.offers = [
          {
            id: newDemoOfferId(),
            productName,
            discountPercent,
            status: "PENDING",
            startDate: now.toISOString(),
            endDate: end.toISOString(),
            aiBrief: brief.trim(),
            imageDataUrl,
            captionInstagram: caption.trim(),
            hashtags: offerHashtags.trim(),
            visualStyle: designPreview?.styleName ?? null,
            createdAt: Date.now(),
          },
          ...state.offers,
        ];
        saveDemoState(state);
        setBrief("");
        setUploadedFile(null);
        resetPreview();
        onCreated();
        return;
      }

      const formData = new FormData();
      formData.set("aiBrief", brief.trim());
      formData.set("caption", caption.trim());
      formData.set("offerHashtags", offerHashtags.trim());
      formData.set("finalImage", finalBlob, `offer-${Date.now()}.png`);

      const res = await fetch("/api/store/offers", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al crear publicación");
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
        {aiConfigured === false && !demoMode && (
          <div
            role="alert"
            className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="font-medium text-amber-900">Generación con IA no disponible</p>
              <p className="text-xs leading-relaxed text-amber-800">
                Configura <code className="text-amber-900">OPENAI_API_KEY</code> en el servidor para
                crear publicaciones con IA.
              </p>
            </div>
          </div>
        )}

        {demoMode && (
          <div
            role="status"
            className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs text-blue-900"
          >
            Modo demo: mismos pasos y visual AdEngine. Usa un brief de zapatillas, audífonos o
            café (o escribe libre) — se elige un preset estático, sin OpenAI ni DB.
          </div>
        )}

        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#2563EB]" />
          <h2 className="text-lg font-semibold text-[#0F2B5B]">Nueva publicación</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => {
              setImageSource("ai");
              resetPreview();
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
              imageSource === "ai"
                ? "bg-[#0F2B5B] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0F2B5B]"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {demoMode ? "Crear imagen" : "Crear imagen con IA"}
          </button>
          <button
            type="button"
            onClick={() => {
              setImageSource("upload");
              resetPreview();
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
              imageSource === "upload"
                ? "bg-[#0F2B5B] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0F2B5B]"
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
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-6 transition hover:border-[#2563EB] hover:bg-blue-50/50"
            >
              <ImagePlus className="h-7 w-7 text-[#2563EB]" />
              <span className="text-sm font-medium text-[#0F2B5B]">
                {uploadedFile ? uploadedFile.name : "Arrastra o elige tu foto de producto"}
              </span>
              <span className="text-xs text-slate-500">Sin costo de imagen IA · JPG, PNG o WebP</span>
            </button>
          </>
        )}

        <div>
          <label className="mb-1 block text-sm text-slate-600">
            Describe tu publicación *
          </label>
          {campaignImagePrompt && (
            <p className="mb-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-900">
              <strong className="text-[#0F2B5B]">Sugerencia de campaña:</strong>{" "}
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
            placeholder={
              demoMode
                ? DEMO_PRESETS[0]?.userBriefExample ?? PUBLICATION_INSTRUCTION_PLACEHOLDER
                : PUBLICATION_INSTRUCTION_PLACEHOLDER
            }
            className="cm-input resize-none"
          />
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{PUBLICATION_INSTRUCTION_HINT}</p>
        </div>

        {storeBranding && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-slate-200"
              style={{ backgroundColor: brandSwatch }}
              aria-hidden
            />
            <span>
              La IA usará los colores de tu marca
              {storeBranding.logoUrl ? " y tu logo" : ""}. Configúralos en{" "}
              <a href={configHref} className="text-[#2563EB] underline">
                Configuración
              </a>
              .
            </span>
          </div>
        )}

        <button
          type="button"
          disabled={previewLoading || loading || (!demoMode && aiConfigured === false)}
          onClick={handleGenerate}
          className="cm-btn-primary w-full py-2.5 text-sm disabled:opacity-50"
        >
          {previewLoading
            ? "Creando publicación…"
            : demoMode
              ? "✨ Generar publicación"
              : "✨ Generar publicación"}
        </button>

        {designPreview && (
          <div className="space-y-4 border-t border-slate-200 pt-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600">
                Texto para Instagram / Facebook (fuera de la foto) *
              </label>
              <CaptionEditor
                value={caption}
                onChange={setCaption}
                placeholder="La IA generará un caption profesional en español…"
                className="cm-input resize-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                {demoMode
                  ? "Puedes editar el texto antes de publicar."
                  : "Generado por IA en español. Puedes editarlo antes de publicar."}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-600">Hashtags *</label>
              <CensoredInput
                name="offerHashtags"
                value={offerHashtags}
                onChange={setOfferHashtags}
                placeholder="#Publicacion #TuTienda"
                className="cm-input"
              />
              {mallHashtags && (
                <p className="mt-1 text-xs text-slate-500">
                  + mall al publicar: <span className="text-[#2563EB]">{mallHashtags}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {error && <p className="whitespace-pre-wrap text-sm text-red-600">{error}</p>}

        {storeBranding && !storeBranding.logoUrl && (
          <p className="text-xs text-amber-700">
            Sube el logo en{" "}
            <a href={configHref} className="underline hover:text-amber-900">
              Configuración
            </a>{" "}
            para que aparezca en tus publicaciones.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || previewLoading || !exportImage}
          className="cm-btn-primary mm-glow-neon w-full py-3 disabled:opacity-50"
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
          demoMode={demoMode}
          demoBrand={
            storeBranding
              ? {
                  name: storeBranding.name,
                  mallName: storeBranding.mallName,
                  primaryColor: storeBranding.primaryColor ?? "#2F6BFF",
                  secondaryColor: storeBranding.secondaryColor ?? "#0B1B4D",
                  logoUrl: storeBranding.logoUrl,
                  rubro: storeBranding.rubro,
                  previewImageUrl: storeBranding.previewImageUrl,
                }
              : undefined
          }
        />
        {!designPreview && !previewLoading && (
          <p className="py-12 text-center text-sm text-slate-500">
            Escribe tu instrucción y presiona Generar. La vista previa aparecerá aquí.
          </p>
        )}
      </div>
    </div>
  );
}
