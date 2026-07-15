"use client";

import { useEffect, useId, useRef } from "react";
import { Mail, MessageCircle, PlayCircle, X } from "lucide-react";
import Link from "next/link";
import {
  SALES_EMAIL,
  salesMailtoHref,
  salesWhatsAppHref,
} from "@/lib/contact/sales";
import { BrandLogo } from "@/components/brand/BrandLogo";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ContactDemoModal({ open, onClose }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#0B1B4D]/55 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl cm-animate-fade-up"
      >
        <div
          className="h-1.5 w-full"
          style={{ background: "var(--cm-grad)" }}
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3 px-6 pt-5">
          <div>
            <BrandLogo className="h-8 w-auto" href={null} />
            <h2
              id={titleId}
              className="mt-4 text-xl font-bold tracking-tight text-[#0B1B4D]"
              style={{ fontFamily: "var(--font-outfit), sans-serif" }}
            >
              Solicitar una demo
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Cuéntanos sobre tu centro comercial. Te respondemos por WhatsApp o correo.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#0B1B4D]"
            aria-label="Cerrar diálogo"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-6 py-5">
          <a
            href={salesWhatsAppHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3.5 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm">
              <MessageCircle className="h-5 w-5" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-semibold text-[#0B1B4D]">WhatsApp</span>
              <span className="block truncate text-xs text-slate-600">
                Escríbenos y agenda una demostración
              </span>
            </span>
          </a>

          <a
            href={salesMailtoHref()}
            className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3.5 transition hover:border-[#2F6BFF]/40 hover:bg-blue-50"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ background: "var(--cm-grad)" }}
            >
              <Mail className="h-5 w-5" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-semibold text-[#0B1B4D]">Correo electrónico</span>
              <span className="block truncate text-xs text-slate-600">{SALES_EMAIL}</span>
            </span>
          </a>

          <div className="relative py-1 text-center text-xs text-slate-400">
            <span className="bg-white px-2">o</span>
            <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-slate-100" />
          </div>

          <Link
            href="/demo"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 transition hover:border-[#2F6BFF]/35 hover:bg-white"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#2F6BFF]">
              <PlayCircle className="h-5 w-5" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-semibold text-[#0B1B4D]">
                Probar la demo interactiva
              </span>
              <span className="block text-xs text-slate-600">
                Sin IA ni costos — recorre el flujo de tienda y mall
              </span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
