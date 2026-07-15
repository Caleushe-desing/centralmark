"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Activity, Megaphone, Store, Wand2 } from "lucide-react";

type StatsPayload = {
  summary: {
    stores: number;
    publishedTotal: number;
    offersLast7d: number;
    designJobsLast7d: number;
    offersByStatus: Record<string, number>;
  };
  byStore: Array<{
    id: string;
    name: string;
    loginId: string;
    offersTotal: number;
    published: number;
    pending: number;
    offersLast7d: number;
    designJobs: number;
    designJobsLast7d: number;
  }>;
  generatedAt: string;
};

function Card({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="cm-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
          style={{ background: "var(--cm-grad)" }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#0B1B4D]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default function AdminEstadisticasPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        if (!cancelled) setError("No se pudieron cargar las estadísticas");
        return;
      }
      const data = await res.json();
      if (!cancelled) setStats(data);
    }
    load();
    const id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="cm-app-bg">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="cm-page-title">Estadísticas del mall</h1>
          <p className="cm-page-subtitle">
            Actividad de tus tiendas departamentales: publicaciones, pendientes y generación IA.
          </p>
        </div>

        {error ? <p className="text-red-600">{error}</p> : null}
        {!stats && !error ? <p className="text-slate-500">Cargando…</p> : null}

        {stats ? (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card icon={Store} label="Tiendas" value={stats.summary.stores} />
              <Card
                icon={Megaphone}
                label="Publicadas"
                value={stats.summary.publishedTotal}
                hint="Total histórico"
              />
              <Card
                icon={Activity}
                label="Ofertas (7 días)"
                value={stats.summary.offersLast7d}
              />
              <Card
                icon={Wand2}
                label="Jobs IA (7 días)"
                value={stats.summary.designJobsLast7d}
              />
            </div>

            <div className="cm-card overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-[#0B1B4D]">Por tienda</h2>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Tienda</th>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Ofertas</th>
                    <th className="px-4 py-3">Publicadas</th>
                    <th className="px-4 py-3">Pendientes</th>
                    <th className="px-4 py-3">Últimos 7d</th>
                    <th className="px-4 py-3">Jobs IA</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byStore.map((s) => (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-[#0B1B4D]">{s.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{s.loginId}</td>
                      <td className="px-4 py-3">{s.offersTotal}</td>
                      <td className="px-4 py-3">{s.published}</td>
                      <td className="px-4 py-3">{s.pending}</td>
                      <td className="px-4 py-3">{s.offersLast7d}</td>
                      <td className="px-4 py-3">
                        {s.designJobs}{" "}
                        <span className="text-xs text-slate-400">({s.designJobsLast7d} 7d)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400">
              Actualizado {new Date(stats.generatedAt).toLocaleString("es-CL")}
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
