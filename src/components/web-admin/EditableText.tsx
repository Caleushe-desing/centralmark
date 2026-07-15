"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  placeholder?: string;
  label?: string;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
};

/**
 * Campo de texto que hereda tipografía del sitio.
 * En hover/focus muestra borde sutil para indicar “editable”.
 */
export function EditableText({
  value,
  onChange,
  className = "",
  style,
  multiline = false,
  placeholder = "Escribe aquí…",
  label,
  as = "div",
}: Props) {
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !multiline) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, multiline]);

  const shared =
    `w-full bg-transparent outline-none transition ` +
    `rounded-md ring-0 hover:ring-2 hover:ring-[#2F6BFF]/35 focus:ring-2 focus:ring-[#2F6BFF]/55 ` +
    `hover:bg-[#2F6BFF]/5 focus:bg-[#2F6BFF]/8 ` +
    className;

  return (
    <div className="relative group/edit">
      {label ? (
        <span className="pointer-events-none absolute -top-5 left-0 z-10 rounded bg-[#0B1B4D] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white opacity-0 transition group-hover/edit:opacity-100 group-focus-within/edit:opacity-100">
          {label}
        </span>
      ) : null}
      {multiline ? (
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={1}
          className={`${shared} resize-none overflow-hidden`}
          style={style}
          data-editable-as={as}
        />
      ) : (
        <input
          ref={ref as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={shared}
          style={style}
          data-editable-as={as}
        />
      )}
    </div>
  );
}
