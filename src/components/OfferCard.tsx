"use client";

import { useState } from "react";
import Image from "next/image";
import { StatusBadge } from "./StatusBadge";
import { Sparkles, Check, X, Send, RefreshCw } from "lucide-react";

interface Offer {
  id: string;
  productName: string;
  discountPercent: number;
  status: string;
  startDate: string;
  endDate: string;
  store: { name: string; category: string; mall: { name: string } };
  content?: {
    imagePath: string;
    captionInstagram: string;
    hashtags: string;
    visualStyle: string | null;
  } | null;
  publications?: Array<{
    platform: string;
    status: string;
    errorMessage: string | null;
  }>;
}

interface OfferCardProps {
  offer: Offer;
  mode: "store" | "admin";
  onUpdate: () => void;
}

export function OfferCard({ offer, mode, onUpdate }: OfferCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: string) {
    setLoading(action);
    try {
      const res = await fetch(`/api/offers/${offer.id}/${action}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (action === "publish" && data.results) {
        const lines = data.results.map(
          (r: { platform: string; success: boolean; errorMessage?: string }) =>
            `${r.platform}: ${r.success ? "✓ Publicado" : `✗ ${r.errorMessage ?? "Error"}`}`
        );
        alert(`Resultado de publicación:\n\n${lines.join("\n")}`);
      } else if (!res.ok && data.error) {
        alert(data.error);
      }

      onUpdate();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="cm-card overflow-hidden">
      <div className="grid gap-0 md:grid-cols-2">
        {offer.content?.imagePath && (
          <div className="relative aspect-square bg-slate-100">
            <Image
              src={offer.content.imagePath}
              alt={offer.productName}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#2563EB]">{offer.store.name}</p>
              <h3 className="mt-1 text-xl font-bold text-[#0F2B5B]">{offer.productName}</h3>
              <p className="mt-2 text-3xl font-black text-[#2563EB]">
                {offer.discountPercent}% OFF
              </p>
            </div>
            <StatusBadge status={offer.status} />
          </div>

          <p className="text-sm text-slate-400">
            {new Date(offer.startDate).toLocaleDateString("es-CL")} —{" "}
            {new Date(offer.endDate).toLocaleDateString("es-CL")}
          </p>

          {offer.content && (
            <div className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {offer.content.captionInstagram}
              <p className="mt-2 text-xs text-[#2563EB]">{offer.content.hashtags}</p>
            </div>
          )}

          {offer.publications && offer.publications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {offer.publications.map((pub) => (
                <span
                  key={pub.platform}
                  className={`text-xs px-2 py-1 rounded ${
                    pub.status === "SUCCESS"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {pub.platform}: {pub.status === "SUCCESS" ? "✓" : pub.errorMessage ?? "Error"}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-auto">
            {mode === "admin" && offer.status === "PENDING" && (
              <>
                <button
                  onClick={() => handleAction("approve")}
                  disabled={!!loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-500 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {loading === "approve" ? "..." : "Aprobar"}
                </button>
                <button
                  onClick={() => handleAction("reject")}
                  disabled={!!loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/80 text-white text-sm hover:bg-red-500 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Rechazar
                </button>
              </>
            )}
            {mode === "admin" &&
              (offer.status === "APPROVED" || offer.status === "PUBLISHED") && (
                <button
                  onClick={() => handleAction("publish")}
                  disabled={!!loading}
                  className="flex items-center gap-2 rounded-lg bg-[#0F2B5B] px-4 py-2 text-sm text-white hover:bg-[#1E3A6E] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading === "publish" ? "Publicando..." : "Publicar en redes"}
                </button>
              )}
            <button
              onClick={() => handleAction("generate")}
              disabled={!!loading || offer.status === "GENERATING"}
              className="cm-btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${offer.status === "GENERATING" ? "animate-spin" : ""}`} />
              Regenerar IA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OfferForm({
  products,
  templates,
  defaultTemplateId,
  mallHashtags,
  storeHashtags,
  onCreated,
}: {
  products: Array<{ id: string; name: string; imageUrl: string }>;
  templates: Array<{ id: string; name: string; description: string; primaryColor: string }>;
  defaultTemplateId: string;
  mallHashtags?: string;
  storeHashtags?: string;
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCatalog, setUseCatalog] = useState(products.length > 0);
  const [checking, setChecking] = useState(false);
  const [moderationOk, setModerationOk] = useState<string | null>(null);

  async function checkModeration(form: HTMLFormElement) {
    setChecking(true);
    setModerationOk(null);
    const fd = new FormData(form);
    const res = await fetch("/api/moderate/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName: fd.get("productName") || undefined,
        description: fd.get("description") || undefined,
        offerHashtags: fd.get("offerHashtags") || undefined,
        aiBrief: fd.get("aiBrief") || undefined,
      }),
    });
    setChecking(false);
    if (res.ok) {
      setModerationOk("Texto revisado — listo para publicar");
      setError(null);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(
        (data as { issues?: string[]; error?: string }).issues?.join("\n") ??
          (data as { error?: string }).error ??
          "Contenido no permitido"
      );
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/store/offers", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al crear publicación");
      }
      form.reset();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-mm-neon" />
        <h2 className="text-lg font-semibold text-white">Nueva publicación</h2>
      </div>

      {products.length > 0 && (
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setUseCatalog(true)}
            className={`px-3 py-1.5 rounded-lg transition ${useCatalog ? "bg-mm-neon/15 text-mm-neon" : "text-slate-500 hover:text-slate-300"}`}
          >
            Del catálogo
          </button>
          <button
            type="button"
            onClick={() => setUseCatalog(false)}
            className={`px-3 py-1.5 rounded-lg transition ${!useCatalog ? "bg-mm-neon/15 text-mm-neon" : "text-slate-500 hover:text-slate-300"}`}
          >
            Manual
          </button>
        </div>
      )}

      {useCatalog && products.length > 0 ? (
        <div>
          <label className="block text-sm text-slate-400 mb-1">Producto del catálogo</label>
          <select
            name="productId"
            required
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Producto</label>
            <input
              name="productName"
              required
              placeholder="Ej: Zapatillas Nike Air Max"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Foto producto</label>
            <input
              name="productImage"
              type="file"
              accept="image/*"
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-mm-neon/20 file:text-mm-neon"
            />
          </div>
        </>
      )}

      {templates.length > 0 && (
        <div>
          <label className="block text-sm text-slate-400 mb-1">Plantilla visual</label>
          <select
            name="templateId"
            defaultValue={defaultTemplateId}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.description}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm text-slate-400 mb-1">Descuento (%)</label>
        <input
          name="discountPercent"
          type="number"
          min={1}
          max={99}
          required
          defaultValue={30}
          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Desde</label>
          <input
            name="startDate"
            type="date"
            required
            defaultValue={today}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Hasta</label>
          <input
            name="endDate"
            type="date"
            required
            defaultValue={tomorrow}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Descripción de la publicación</label>
        <textarea
          name="description"
          rows={2}
          placeholder="Ej: Todas las tallas disponibles, no acumulable con otras promociones"
          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">
          Revisado por IA: sin obscenidades, odio, política, racismo u homofobia
        </p>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Tus hashtags para esta publicación</label>
        <input
          name="offerHashtags"
          placeholder="#Liquidacion #Zapatillas #SoloHoy"
          defaultValue={storeHashtags ?? ""}
          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600"
        />
        {mallHashtags && (
          <p className="text-xs text-slate-500 mt-1">
            Se suman automáticamente los del mall:{" "}
            <span className="text-mm-neon/70">{mallHashtags}</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Instrucciones para la IA (opcional)
        </label>
        <textarea
          name="aiBrief"
          rows={3}
          placeholder="Ej: Quiero un estilo juvenil y dinámico, fondo urbano de noche, que transmita urgencia. El texto debe sonar emocionante y mencionar envío gratis."
          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">
          Describe cómo quieres la publicación: tono, estilo visual, mensaje clave. La IA lo usará para el texto y la imagen.
        </p>
      </div>

      {moderationOk && <p className="text-emerald-400 text-sm">{moderationOk}</p>}
      {error && <p className="text-red-400 text-sm whitespace-pre-wrap">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={checking || loading}
          onClick={(e) => checkModeration(e.currentTarget.closest("form")!)}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          {checking ? "Revisando..." : "Revisar texto"}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl mm-btn-primary mm-glow-neon disabled:opacity-50 transition"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 animate-pulse" />
            La IA está creando tu publicación...
          </span>
        ) : (
          "Generar con IA y enviar a revisión"
        )}
      </button>
    </form>
  );
}
