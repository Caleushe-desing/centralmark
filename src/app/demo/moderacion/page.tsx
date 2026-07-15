"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, XCircle } from "lucide-react";
import { DemoShell } from "@/components/demo/DemoShell";
import { StatusBadge } from "@/components/StatusBadge";
import {
  type DemoOffer,
  type DemoSettings,
  loadDemoState,
  saveDemoState,
} from "@/lib/demo/store";

export default function DemoModeracionPage() {
  const [settings, setSettings] = useState<DemoSettings | null>(null);
  const [offers, setOffers] = useState<DemoOffer[]>([]);

  const reload = useCallback(() => {
    const state = loadDemoState();
    setSettings(state.settings);
    setOffers(state.offers);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  function setStatus(id: string, status: "APPROVED" | "REJECTED") {
    const state = loadDemoState();
    state.offers = state.offers.map((o) => (o.id === id ? { ...o, status } : o));
    saveDemoState(state);
    reload();
  }

  if (!settings) {
    return (
      <div className="cm-app-bg flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
      </div>
    );
  }

  const pending = offers.filter((o) => o.status === "PENDING");
  const reviewed = offers.filter((o) => o.status !== "PENDING");

  return (
    <DemoShell storeName={settings.name} mallName={settings.mallName}>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="cm-page-title">Moderación</h1>
          <p className="cm-page-subtitle">
            Así ve el mall las publicaciones enviadas por la tienda. Aprueba o rechaza igual que en
            la app real.
          </p>
        </div>

        <section className="cm-card mb-8 p-6">
          <h2 className="text-lg font-semibold text-[#0B1B4D]">Pendientes</h2>
          {pending.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No hay pendientes. Crea una publicación en la pestaña Publicaciones.
            </p>
          ) : (
            <ul className="mt-5 space-y-4">
              {pending.map((offer) => (
                <li
                  key={offer.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center"
                >
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                    <Image
                      src={offer.imageDataUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#0B1B4D]">{offer.productName}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {offer.captionInstagram}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{settings.name}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus(offer.id, "APPROVED")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(offer.id, "REJECTED")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {reviewed.length > 0 && (
          <section className="cm-card p-6">
            <h2 className="text-lg font-semibold text-[#0B1B4D]">Revisadas</h2>
            <ul className="mt-4 space-y-3">
              {reviewed.map((offer) => (
                <li
                  key={offer.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#0B1B4D]">{offer.productName}</p>
                    <p className="text-xs text-slate-500">{offer.hashtags}</p>
                  </div>
                  <StatusBadge status={offer.status} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </DemoShell>
  );
}
