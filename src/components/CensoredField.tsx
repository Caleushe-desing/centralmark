"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { censorBadWords } from "@/lib/moderation/censor";

interface CensoredTextareaProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
}

export function CensoredTextarea({
  name,
  value,
  onChange,
  rows = 2,
  placeholder,
  className,
  inputRef,
}: CensoredTextareaProps) {
  const [hint, setHint] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!value) {
      setHint(null);
      return;
    }
    const t = setTimeout(() => {
      const result = censorBadWords(value);
      if (result.blocked) {
        setHint(result.blockedReason ?? "Contenido no permitido");
        return;
      }
      if (result.censored && result.text !== value) {
        setHint("Palabra no permitida — reemplazada automáticamente por xxx");
        onChangeRef.current(result.text);
      } else {
        setHint(null);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div>
      <textarea
        ref={inputRef}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={className}
      />
      {hint && (
        <p className={`text-xs mt-1 ${hint.includes("no permitido") && hint.includes("Elimínalo") ? "text-red-400" : "text-amber-400/90"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}

interface CensoredInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CensoredInput({
  name,
  value,
  onChange,
  placeholder,
  className,
}: CensoredInputProps) {
  const [hint, setHint] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!value) {
      setHint(null);
      return;
    }
    const t = setTimeout(() => {
      const result = censorBadWords(value);
      if (result.blocked) {
        setHint(result.blockedReason ?? "Contenido no permitido");
        return;
      }
      if (result.censored && result.text !== value) {
        setHint("Censurado automáticamente (xxx)");
        onChangeRef.current(result.text);
      } else {
        setHint(null);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div>
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      {hint && <p className="text-xs mt-1 text-amber-400/90">{hint}</p>}
    </div>
  );
}
