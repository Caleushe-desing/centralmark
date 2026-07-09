"use client";

import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { OfferCard } from "@/components/OfferCard";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ConfigStatus {
  hasOpenAI: boolean;
  hasMetaApp: boolean;
  hasMetaToken: boolean;
  hasInstagram: boolean;
  hasFacebook: boolean;
  hasPublicUrl: boolean;
  hasFtp: boolean;
  supportsStoreOAuth: boolean;
}

export default function AdminPage() {
  const [offers, setOffers] = useState<never[]>([]);
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [filter, setFilter] = useState("PENDING");

  const loadData = useCallback(async () => {
    const [offersRes, configRes] = await Promise.all([
      fetch(`/api/offers?status=${filter}`),
      fetch("/api/config"),
    ]);
    setOffers(await offersRes.json());
    setConfig(await configRes.json());
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const configItems = config
    ? [
        { label: "OpenAI API", ok: config.hasOpenAI },
        { label: "Meta App (OAuth tiendas)", ok: config.hasMetaApp },
        { label: "Meta token legacy (.env)", ok: config.hasMetaToken },
        { label: "Instagram Account", ok: config.hasInstagram },
        { label: "Facebook Page", ok: config.hasFacebook },
        { label: "URL pública (mizo.cl)", ok: config.hasPublicUrl },
        { label: "FTP mizo.cl", ok: config.hasFtp },
      ]
    : [];

  return (
    <div className="min-h-screen bg-mm-black">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Panel Admin del Mall</h1>
            <p className="text-slate-400 mt-1">
              Aprueba ofertas y publícalas en las redes del mall
            </p>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/auth/admin/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
            className="text-sm text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Cerrar sesión
          </button>
        </div>

        {config && (
          <div className="mb-8 p-4 rounded-xl border border-white/10 bg-white/5">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Estado de integraciones</h3>
            <div className="flex flex-wrap gap-3">
              {configItems.map((item) => (
                <span
                  key={item.label}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
                    item.ok
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {item.ok ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {["PENDING", "APPROVED", "PUBLISHED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === s
                  ? "bg-mm-neon text-black font-semibold"
                  : "text-slate-400 hover:bg-white/5"
              }`}
            >
              {s === "PENDING" && "Pendientes"}
              {s === "APPROVED" && "Aprobadas"}
              {s === "PUBLISHED" && "Publicadas"}
              {s === "REJECTED" && "Rechazadas"}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {offers.length === 0 ? (
            <p className="text-slate-500">No hay ofertas con este estado.</p>
          ) : (
            offers.map((offer) => (
              <OfferCard
                key={(offer as { id: string }).id}
                offer={offer as never}
                mode="admin"
                onUpdate={loadData}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
