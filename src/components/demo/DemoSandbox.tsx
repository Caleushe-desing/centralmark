"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { OfferCreator } from "@/components/OfferCreator";
import { StatusBadge } from "@/components/StatusBadge";
import { DemoShell } from "@/components/demo/DemoShell";
import {
  type DemoOffer,
  type DemoSettings,
  loadDemoState,
  saveDemoState,
} from "@/lib/demo/store";

export function DemoSandbox() {
  const [settings, setSettings] = useState<DemoSettings | null>(null);
  const [offers, setOffers] = useState<DemoOffer[]>([]);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => {
    const state = loadDemoState();
    setSettings(state.settings);
    setOffers(state.offers);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (!settings) {
    return (
      <div className="cm-app-bg flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
      </div>
    );
  }

  return (
    <DemoShell storeName={settings.name} mallName={settings.mallName}>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="cm-page-title">Mis Publicaciones</h1>
        <p className="cm-page-subtitle">
          Describe tu publicación en una sola instrucción. Se crea imagen, textos y caption —
          mismos pasos que la app real, sin costo de IA.
        </p>
        </div>

        <div className="mb-10">
          <div className="mm-card p-6">
            <OfferCreator
              key={`${settings.rubro}-${settings.previewImageUrl ?? "default"}-${tick}`}
              demoMode
              configHref="/demo/configuracion"
              mallHashtags="#CentralMark #MallDemo"
              storeBranding={{
                name: settings.name,
                mallName: settings.mallName,
                logoUrl: settings.logoUrl,
                primaryColor: settings.primaryColor,
                secondaryColor: settings.secondaryColor,
                customHashtags: settings.customHashtags,
                rubro: settings.rubro,
                category: settings.category,
                previewImageUrl: settings.previewImageUrl,
              }}
              onCreated={reload}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-[#0B1B4D]">Publicaciones creadas</h2>
          {offers.length === 0 ? (
            <p className="text-slate-500">Aún no hay publicaciones.</p>
          ) : (
            offers.map((offer) => (
              <DemoOfferCard
                key={offer.id}
                offer={offer}
                storeName={settings.name}
                mallName={settings.mallName}
                onChange={reload}
              />
            ))
          )}
        </div>
      </main>
    </DemoShell>
  );
}

function DemoOfferCard({
  offer,
  storeName,
  mallName,
  onChange,
}: {
  offer: DemoOffer;
  storeName: string;
  mallName: string;
  onChange: () => void;
}) {
  function remove() {
    const state = loadDemoState();
    state.offers = state.offers.filter((o) => o.id !== offer.id);
    saveDemoState(state);
    onChange();
  }

  return (
    <div className="cm-card overflow-hidden">
      <div className="grid gap-0 md:grid-cols-2">
        <div className="relative aspect-square bg-slate-100">
          <Image src={offer.imageDataUrl} alt={offer.productName} fill className="object-cover" unoptimized />
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#2563EB]">{storeName}</p>
              <h3 className="mt-1 text-xl font-bold text-[#0F2B5B]">{offer.productName}</h3>
              {offer.discountPercent > 0 && (
                <p className="mt-2 text-3xl font-black text-[#2563EB]">{offer.discountPercent}% OFF</p>
              )}
            </div>
            <StatusBadge status={offer.status} />
          </div>
          <p className="text-sm text-slate-400">
            {new Date(offer.startDate).toLocaleDateString("es-CL")} —{" "}
            {new Date(offer.endDate).toLocaleDateString("es-CL")}
          </p>
          <div className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {offer.captionInstagram}
            <p className="mt-2 text-xs text-[#2563EB]">{offer.hashtags}</p>
          </div>
          <p className="text-xs text-slate-500">
            Enviada a {mallName} · {offer.visualStyle ?? "estilo demo"}
          </p>
          <button
            type="button"
            onClick={remove}
            className="self-start text-xs text-red-600 underline hover:text-red-700"
          >
            Eliminar de la demo
          </button>
        </div>
      </div>
    </div>
  );
}
