"use client";

import { useRef, useState } from "react";
import { CensoredTextarea } from "@/components/CensoredField";
import { Smile, Sparkles, Type } from "lucide-react";

const EMOJIS = ["🔥", "✨", "🎉", "💥", "👟", "👕", "🛍️", "📍", "⏰", "💰", "✅", "👉"];

const SNIPPETS = [
  { label: "Oferta", text: "🔥 ¡Oferta por tiempo limitado!\n" },
  { label: "Stock", text: "⏰ Solo hasta agotar stock.\n" },
  { label: "Visítanos", text: "📍 Ven a visitarnos en el mall.\n" },
  { label: "CTA", text: "👉 ¡Aprovecha hoy!\n" },
];

const IG_CAPTION_MAX = 2200;

export function CaptionEditor({
  value,
  onChange,
  placeholder,
  className,
  onSuggest,
  suggestLoading = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSuggest?: () => void;
  suggestLoading?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojis, setShowEmojis] = useState(false);

  function insertAtCursor(text: string) {
    const el = textareaRef.current;
    if (!el) {
      onChange(value + text);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  }

  const chars = value.length;
  const nearLimit = chars > IG_CAPTION_MAX * 0.9;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-950/80 border border-white/10">
        {onSuggest && (
          <button
            type="button"
            onClick={onSuggest}
            disabled={suggestLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-mm-neon hover:bg-mm-neon/10 border border-mm-neon/30 disabled:opacity-50"
            title="Generar texto llamativo con IA según tu idea"
          >
            <Sparkles className={`w-3.5 h-3.5 ${suggestLoading ? "animate-pulse" : ""}`} />
            {suggestLoading ? "Sugiriendo…" : "Sugerir con IA"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowEmojis((v) => !v)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/10 border border-white/10"
          title="Insertar emoji"
        >
          <Smile className="w-3.5 h-3.5" />
          Emoji
        </button>
        {SNIPPETS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => insertAtCursor(s.text)}
            className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 border border-white/10"
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => insertAtCursor("\n")}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 border border-white/10"
          title="Nueva línea"
        >
          <Type className="w-3.5 h-3.5" />
          Salto de línea
        </button>
        <span
          className={`ml-auto text-xs tabular-nums ${
            chars > IG_CAPTION_MAX
              ? "text-red-400"
              : nearLimit
                ? "text-amber-400"
                : "text-slate-600"
          }`}
        >
          {chars}/{IG_CAPTION_MAX}
        </span>
      </div>

      {showEmojis && (
        <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-slate-950 border border-white/10">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertAtCursor(emoji)}
              className="w-9 h-9 rounded-lg hover:bg-white/10 text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <CensoredTextarea
        name="caption"
        value={value}
        onChange={onChange}
        rows={6}
        placeholder={placeholder}
        className={className}
        inputRef={textareaRef}
      />
    </div>
  );
}
