"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Mail, MessageCircle, X } from "lucide-react";
import {
  DEMO_REQUEST_MESSAGE,
  SALES_EMAIL,
  salesMailtoHref,
  salesWhatsAppHref,
} from "@/lib/contact/sales";
import { BrandLogo } from "@/components/brand/BrandLogo";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Channel = "whatsapp" | "email" | "form";

type FormState = {
  name: string;
  mall: string;
  city: string;
  phone: string;
  email: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  mall: "",
  city: "",
  phone: "",
  email: "",
  message: "",
};

function buildRequestBody(form: FormState): string {
  const lines = [
    DEMO_REQUEST_MESSAGE,
    "",
    `Nombre: ${form.name.trim() || "—"}`,
    `Centro comercial: ${form.mall.trim() || "—"}`,
    `Ciudad: ${form.city.trim() || "—"}`,
    `Teléfono: ${form.phone.trim() || "—"}`,
    `Correo: ${form.email.trim() || "—"}`,
  ];
  if (form.message.trim()) {
    lines.push("", `Mensaje: ${form.message.trim()}`);
  }
  return lines.join("\n");
}

export function ContactDemoModal({ open, onClose }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [channel, setChannel] = useState<Channel>("form");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [sentHint, setSentHint] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (!open) {
      setChannel("form");
      setForm(EMPTY_FORM);
      setSentHint(null);
    }
  }, [open]);

  if (!open || !mounted) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openWhatsApp(body: string) {
    window.open(salesWhatsAppHref(body), "_blank", "noopener,noreferrer");
    setSentHint("Se abrió WhatsApp con tu solicitud.");
  }

  function openEmail(body: string) {
    window.location.href = salesMailtoHref("Solicitar demo CentralMark", body);
    setSentHint("Se abrió tu cliente de correo con el mensaje a ventas@centralmark.cl.");
  }

  function handleFormSubmit(e: FormEvent, via: "whatsapp" | "email") {
    e.preventDefault();
    if (!form.name.trim() || !form.mall.trim()) {
      setSentHint("Completa al menos tu nombre y el centro comercial.");
      return;
    }
    const body = buildRequestBody(form);
    if (via === "whatsapp") openWhatsApp(body);
    else openEmail(body);
  }

  const tabs: { id: Channel; label: string }[] = [
    { id: "form", label: "Formulario" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "email", label: "Correo" },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
        className="relative z-10 max-h-[min(90vh,880px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl cm-animate-fade-up"
      >
        <div className="h-1.5 w-full" style={{ background: "var(--cm-grad)" }} aria-hidden />
        <div className="flex items-start justify-between gap-3 px-6 pt-5">
          <div>
            <BrandLogo className="h-8 w-auto" href={null} />
            <h2
              id={titleId}
              className="mt-4 text-xl font-bold tracking-tight text-[#0B1B4D]"
              style={{ fontFamily: "var(--font-outfit), sans-serif" }}
            >
              Conseguir una demo
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Elige WhatsApp, correo o completa el formulario. Te responde el equipo de ventas.
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

        <div className="px-6 pt-4">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {tabs.map((tab) => {
              const active = channel === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setChannel(tab.id);
                    setSentHint(null);
                  }}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                    active
                      ? "bg-white text-[#0B1B4D] shadow-sm"
                      : "text-slate-500 hover:text-[#0B1B4D]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          {channel === "whatsapp" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Te abrimos WhatsApp con un mensaje listo para enviar a ventas.
              </p>
              <button
                type="button"
                onClick={() => openWhatsApp(DEMO_REQUEST_MESSAGE)}
                className="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3.5 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block text-sm font-semibold text-[#0B1B4D]">Abrir WhatsApp</span>
                  <span className="block text-xs text-slate-600">
                    Agenda una demostración con el equipo
                  </span>
                </span>
              </button>
            </div>
          )}

          {channel === "email" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Te abrimos el correo dirigido a{" "}
                <span className="font-medium text-[#0B1B4D]">{SALES_EMAIL}</span>.
              </p>
              <button
                type="button"
                onClick={() =>
                  openEmail(
                    `${DEMO_REQUEST_MESSAGE}\n\nNombre:\nCentro comercial:\nCiudad:\nTeléfono:\n`
                  )
                }
                className="flex w-full items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3.5 transition hover:border-[#2F6BFF]/40 hover:bg-blue-50"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{ background: "var(--cm-grad)" }}
                >
                  <Mail className="h-5 w-5" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block text-sm font-semibold text-[#0B1B4D]">
                    Escribir a ventas
                  </span>
                  <span className="block truncate text-xs text-slate-600">{SALES_EMAIL}</span>
                </span>
              </button>
            </div>
          )}

          {channel === "form" && (
            <form className="space-y-3" onSubmit={(e) => handleFormSubmit(e, "email")}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-1">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Nombre *</span>
                  <input
                    className="cm-input"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    placeholder="Tu nombre"
                  />
                </label>
                <label className="block sm:col-span-1">
                  <span className="mb-1 block text-xs font-medium text-slate-600">
                    Centro comercial *
                  </span>
                  <input
                    className="cm-input"
                    value={form.mall}
                    onChange={(e) => update("mall", e.target.value)}
                    required
                    placeholder="Ej: Mall Plaza"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Ciudad</span>
                  <input
                    className="cm-input"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Ej: Santiago"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Teléfono</span>
                  <input
                    className="cm-input"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+56 9 …"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Correo</span>
                  <input
                    type="email"
                    className="cm-input"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="tu@empresa.cl"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Mensaje</span>
                  <textarea
                    className="cm-input min-h-[72px]"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Cuéntanos brevemente qué necesitas…"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={(e) => handleFormSubmit(e, "whatsapp")}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar por WhatsApp
                </button>
                <button
                  type="submit"
                  className="cm-btn-primary inline-flex flex-1 items-center justify-center gap-2 px-4 py-2.5"
                >
                  <Mail className="h-4 w-4" />
                  Enviar por correo
                </button>
              </div>
            </form>
          )}

          {sentHint && (
            <p
              role="status"
              className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800"
            >
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {sentHint}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
