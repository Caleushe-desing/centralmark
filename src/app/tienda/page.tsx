"use client";

import { useCallback, useEffect, useState } from "react";
import { OfferCard } from "@/components/OfferCard";
import { OfferCreator } from "@/components/OfferCreator";
import { CampaignStudio, type CampaignApplyPayload } from "@/components/CampaignStudio";

interface StoreSettings {
  name: string;
  logoUrl: string | null;
  customHashtags: string | null;
  mall: { name: string; fixedHashtags: string };
}

export default function TiendaPage() {
  const [offers, setOffers] = useState<never[]>([]);
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [campaignSeed, setCampaignSeed] = useState<CampaignApplyPayload | null>(null);

  const loadData = useCallback(async () => {
    const [offersRes, settingsRes] = await Promise.all([
      fetch("/api/store/offers"),
      fetch("/api/store/settings"),
    ]);
    if (offersRes.ok) setOffers(await offersRes.json());
    if (settingsRes.ok) setStore(await settingsRes.json());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Mis Ofertas</h1>
        <p className="text-neutral-400 mt-1">
          Genera la imagen con IA, edita textos sobre la foto, y escribe el post con sus hashtags.
        </p>
      </div>

      <div className="mb-10 space-y-6">
        {store && (
          <>
            <CampaignStudio
              storeName={store.name}
              onApply={setCampaignSeed}
            />
            <div className="p-6 mm-card">
              <OfferCreator
                mallHashtags={store.mall.fixedHashtags}
                storeBranding={{
                  name: store.name,
                  mallName: store.mall.name,
                  logoUrl: store.logoUrl,
                  customHashtags: store.customHashtags,
                }}
                campaignSeed={campaignSeed}
                onCreated={loadData}
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-white">Ofertas creadas</h2>
        {offers.length === 0 ? (
          <p className="text-slate-500">Aún no hay ofertas publicadas.</p>
        ) : (
          offers.map((offer) => (
            <OfferCard
              key={(offer as { id: string }).id}
              offer={offer as never}
              mode="store"
              onUpdate={loadData}
            />
          ))
        )}
      </div>
    </main>
  );
}
