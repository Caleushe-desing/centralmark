"use client";

import { ImageTextEditor } from "@/components/ImageTextEditor";
import type { ImageCreationMode } from "@/lib/ai/image-generator";
import type { TextLayer } from "@/lib/image/text-layers";
import { Eye, ImageIcon, MessageSquare, Sparkles } from "lucide-react";

export interface OfferPreviewProps {
  previewImageUrl?: string | null;
  previewLoading?: boolean;
  creationMode?: ImageCreationMode;
  productName?: string;
  discountPercent?: number;
  caption?: string;
  offerHashtags?: string;
  mallHashtags?: string;
  storeName?: string;
  mallName?: string;
  logoUrl?: string | null;
  initialTextLayers?: TextLayer[];
  onRegisterExport?: (exporter: (() => Promise<Blob>) | null) => void;
}

export function OfferPreview({
  previewImageUrl,
  previewLoading,
  creationMode = "editor",
  productName,
  discountPercent,
  caption = "",
  offerHashtags = "",
  mallHashtags,
  storeName = "Tu tienda",
  mallName = "MarkMall",
  logoUrl,
  initialTextLayers,
  onRegisterExport,
}: OfferPreviewProps) {
  const fullHashtags = [offerHashtags.trim(), mallHashtags?.trim()]
    .filter(Boolean)
    .join(" ");

  const isComplete = creationMode === "complete";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <Eye className="w-4 h-4 text-mm-neon" />
        <span>Vista previa de la publicación</span>
        {isComplete && previewImageUrl && (
          <span className="ml-auto text-[10px] uppercase tracking-wide text-mm-yellow font-medium">
            Instagram · 1080×1080
          </span>
        )}
      </div>

      <div
        className={`rounded-2xl border border-mm-neon/15 overflow-hidden bg-mm-card mm-glow-neon ${
          isComplete ? "max-w-md mx-auto lg:max-w-none" : ""
        }`}
      >
        <div className="px-3 py-2 border-b border-mm-neon/10 flex items-center gap-2 text-xs text-neutral-500">
          <ImageIcon className="w-3.5 h-3.5 text-mm-neon" />
          {isComplete
            ? "Publicación lista para compartir"
            : "Foto — textos y logo editables"}
        </div>

        {previewImageUrl && onRegisterExport ? (
          <div className={isComplete ? "p-4 bg-gradient-to-b from-mm-card to-mm-black" : "p-3"}>
            <ImageTextEditor
              imageUrl={previewImageUrl}
              creationMode={creationMode}
              discountPercent={discountPercent}
              productName={productName}
              logoUrl={logoUrl}
              initialLayers={initialTextLayers}
              onRegisterExport={onRegisterExport}
            />
          </div>
        ) : (
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-mm-black via-mm-surface to-mm-black">
            {previewLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Sparkles className="w-10 h-10 text-mm-neon animate-pulse" />
                <p className="text-sm text-neutral-300">La IA está creando tu imagen…</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Sparkles className="w-10 h-10 text-mm-yellow/60 mb-4" />
                <p className="text-xs text-neutral-500">Genera la imagen para ver la vista previa</p>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-mm-neon/10">
          <div className="px-3 py-2 flex items-center gap-2 text-xs text-neutral-500 border-b border-mm-neon/10">
            <MessageSquare className="w-3.5 h-3.5" />
            Texto del post (fuera de la foto)
          </div>
          <div className="p-4 space-y-3">
            <pre className="text-sm text-neutral-200 whitespace-pre-wrap font-sans leading-relaxed min-h-[4rem]">
              {caption.trim() || "Escribe el texto de tu publicación en el formulario →"}
            </pre>
            <p className="text-sm text-mm-neon leading-relaxed">
              {fullHashtags || "#TusHashtags"}
            </p>
            <p className="text-xs text-neutral-600">
              📍 {storeName} · {mallName}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-600 text-center">
        {isComplete
          ? "Así se verá tu publicación en Instagram. Presiona «Subir publicación» cuando esté listo."
          : logoUrl
            ? "Toca tu logo en la imagen para moverlo, rotarlo o cambiar su tamaño"
            : "Sube el logo de tu tienda en Configuración para añadirlo a la imagen"}
      </p>
    </div>
  );
}
