"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";

interface LogoUploaderProps {
  currentLogoUrl: string | null;
  onFileChange: (file: File | null) => void;
}

export function LogoUploader({ currentLogoUrl, onFileChange }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const displayUrl = previewUrl ?? currentLogoUrl;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setPreviewUrl(null);
      onFileChange(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    onFileChange(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[#0F2B5B]">Logo de la tienda</h3>
        <p className="mt-1 text-sm text-slate-600">
          Sube el logo de tu marca. Aparecerá en la esquina superior derecha de cada publicación
          generada por la IA.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div
          className={`relative flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 bg-slate-50 ${
            displayUrl ? "border-slate-200" : "border-dashed border-slate-300"
          }`}
        >
          {displayUrl ? (
            <Image src={displayUrl} alt="Logo de la tienda" fill className="object-contain p-3" />
          ) : (
            <div className="text-center px-3">
              <ImagePlus className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-xs text-slate-500">Sin logo</p>
            </div>
          )}
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex-1 rounded-xl border-2 border-dashed p-6 transition ${
            dragOver
              ? "border-[#2563EB] bg-blue-50/50"
              : "border-slate-300 bg-white hover:border-slate-400"
          }`}
        >
          <input
            ref={inputRef}
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={onInputChange}
            className="sr-only"
          />
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <Upload className="h-8 w-8 text-[#2563EB] mb-3" />
            <p className="text-sm font-medium text-[#0F2B5B]">
              Arrastra tu logo aquí o selecciona un archivo
            </p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP o SVG · Recomendado fondo transparente</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="cm-btn-primary inline-flex items-center gap-2"
              >
                <ImagePlus className="h-4 w-4" />
                Subir logo
              </button>
              {displayUrl && (
                <button
                  type="button"
                  onClick={() => {
                    handleFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Quitar selección
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
