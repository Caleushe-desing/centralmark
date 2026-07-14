"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  Server,
  Store,
  Wand2,
} from "lucide-react";

type StatsPayload = {
  product: {
    malls: number;
    stores: number;
    products: number;
    offersByStatus: Record<string, number>;
    offersTotal: number;
    designJobsByStatus: Record<string, number>;
    designJobsTotal: number;
    offersLast7d: number;
    designJobsLast7d: number;
    designEngineCostUsd: number;
    designEngineJobs: number;
    proAdCostUsd: number;
    proAdJobs: number;
  };
  server: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    memory: {
      rssLabel: string;
      heapUsedLabel: string;
      heapTotalLabel: string;
    };
    disk: {
      uploadsLabel: string;
      generatedLabel: string;
      landingLabel: string;
      databaseLabel: string;
    };
    env: { nodeEnv: string; publicUrl: string | null };
  };
  generatedAt: string;
};

function formatUptime(sec: number) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StatCard({
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

function StatusBars({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="cm-card p-6">
      <h3 className="mb-4 text-sm font-semibold text-[#0B1B4D]">{title}</h3>
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">Sin datos aún</p>
        ) : (
          entries.map(([status, count]) => (
            <div key={status}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-slate-700">{status}</span>
                <span className="text-slate-500">
                  {count} ({Math.round((count / total) * 100)}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(count / total) * 100}%`,
                    background: "var(--cm-grad)",
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function WebAdminStatsPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/web-admin/stats");
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

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!stats) {
    return <p className="text-slate-500">Cargando estadísticas…</p>;
  }

  const p = stats.product;
  const s = stats.server;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="cm-page-title">Estadísticas</h1>
        <p className="cm-page-subtitle">
          Métricas de CentralMark y del servidor · actualizado{" "}
          {new Date(stats.generatedAt).toLocaleString("es-CL")}
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          CentralMark
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Store} label="Tiendas" value={p.stores} hint={`${p.malls} mall(s)`} />
          <StatCard icon={Database} label="Productos" value={p.products} />
          <StatCard
            icon={Activity}
            label="Ofertas"
            value={p.offersTotal}
            hint={`${p.offersLast7d} en últimos 7 días`}
          />
          <StatCard
            icon={Wand2}
            label="Jobs de diseño"
            value={p.designJobsTotal}
            hint={`${p.designJobsLast7d} en últimos 7 días`}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <StatusBars title="Ofertas por estado" data={p.offersByStatus} />
        <StatusBars title="Design Engine por estado" data={p.designJobsByStatus} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="cm-card p-6">
          <h3 className="mb-2 text-sm font-semibold text-[#0B1B4D]">Costos de IA (USD)</h3>
          <p className="text-3xl font-bold cm-gradient-text">
            ${(p.designEngineCostUsd + p.proAdCostUsd).toFixed(4)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Design Engine: ${p.designEngineCostUsd.toFixed(4)} ({p.designEngineJobs} jobs)
          </p>
          <p className="text-sm text-slate-600">
            Pro Ads: ${p.proAdCostUsd.toFixed(4)} ({p.proAdJobs} generaciones)
          </p>
        </div>
        <div className="cm-card p-6">
          <h3 className="mb-2 text-sm font-semibold text-[#0B1B4D]">Entorno</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">NODE_ENV</dt>
              <dd className="font-medium text-[#0B1B4D]">{s.env.nodeEnv}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">URL pública</dt>
              <dd className="truncate font-medium text-[#0B1B4D]">
                {s.env.publicUrl ?? "—"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Servidor
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Server}
            label="Uptime"
            value={formatUptime(s.uptimeSeconds)}
            hint={`${s.platform} · ${s.nodeVersion}`}
          />
          <StatCard
            icon={Cpu}
            label="Memoria RSS"
            value={s.memory.rssLabel}
            hint={`Heap ${s.memory.heapUsedLabel} / ${s.memory.heapTotalLabel}`}
          />
          <StatCard
            icon={HardDrive}
            label="Uploads"
            value={s.disk.uploadsLabel}
            hint={`Generated ${s.disk.generatedLabel}`}
          />
          <StatCard
            icon={Database}
            label="Base de datos"
            value={s.disk.databaseLabel}
            hint={`Landing assets ${s.disk.landingLabel}`}
          />
        </div>
      </section>
    </div>
  );
}
