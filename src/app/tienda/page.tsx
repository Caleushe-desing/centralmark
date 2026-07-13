"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { OfferCard } from "@/components/OfferCard";
import { OfferCreator } from "@/components/OfferCreator";
import { CampaignStudio, type CampaignApplyPayload } from "@/components/CampaignStudio";

interface StoreSettings {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  customHashtags: string | null;
  rubro: string;
  category: string;
  previewImageUrl: string | null;
  mall: { name: string; fixedHashtags: string };
}

export default function TiendaPage() {
  const pathname = usePathname();
  const [offers, setOffers] = useState<never[]>([]);
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [campaignSeed, setCampaignSeed] = useState<CampaignApplyPayload | null>(null);

  const loadData = useCallback(async () => {
    const [offersRes, settingsRes] = await Promise.all([
      fetch("/api/store/offers", { cache: "no-store" }),
      fetch("/api/store/settings", { cache: "no-store" }),
    ]);
    if (offersRes.ok) setOffers(await offersRes.json());
    if (settingsRes.ok) setStore(await settingsRes.json());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, pathname]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadData]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="cm-page-title">Mis Ofertas</h1>
        <p className="cm-page-subtitle">
          Describe tu publicación en una sola instrucción. La IA crea imagen, textos y caption en español.
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
                key={`${store.rubro}-${store.previewImageUrl ?? "default"}`}
                mallHashtags={store.mall.fixedHashtags}
                storeBranding={{
                  name: store.name,
                  mallName: store.mall.name,
                  logoUrl: store.logoUrl,
                  primaryColor: store.primaryColor,
                  secondaryColor: store.secondaryColor,
                  customHashtags: store.customHashtags,
                  rubro: store.rubro,
                  category: store.category,
                  previewImageUrl: store.previewImageUrl,
                }}
                campaignSeed={campaignSeed}
                onCreated={loadData}
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[#0F2B5B]">Ofertas creadas</h2>
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
