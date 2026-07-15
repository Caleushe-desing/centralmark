"use client";

import Image from "next/image";
import { ImageIcon, Loader2 } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  onUpload: (file: File) => void;
  uploading?: boolean;
  label?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Imagen con overlay “Cambiar foto” — mismo aspecto que en la web. */
export function EditableImage({
  src,
  alt,
  onUpload,
  uploading,
  label = "Cambiar foto",
  fill,
  width,
  height,
  className = "h-auto w-full object-cover",
  sizes,
  priority,
}: Props) {
  return (
    <div className={`group/img relative overflow-hidden ${fill ? "absolute inset-0" : ""}`}>
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className={className}
          sizes={sizes}
          unoptimized={src.startsWith("/uploads/")}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width ?? 1280}
          height={height ?? 720}
          priority={priority}
          className={className}
          sizes={sizes}
          unoptimized={src.startsWith("/uploads/")}
        />
      )}

      <label
        className="absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-2 bg-[#0B1B4D]/0 text-white opacity-0 transition group-hover/img:bg-[#0B1B4D]/45 group-hover/img:opacity-100"
        title={label}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <>
            <span
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-lg"
              style={{ background: "var(--cm-grad)" }}
            >
              <ImageIcon className="h-4 w-4" />
              {label}
            </span>
            <span className="text-xs text-white/80">Haz clic para reemplazar esta imagen</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
