"use client";

import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Check, Copy, KeyRound, Plus, Trash2 } from "lucide-react";

type StoreRow = {
  id: string;
  name: string;
  username: string;
  category: string;
  rubro: string;
  offersCount: number;
  designJobsCount: number;
  createdAt: string;
};

type Creds = { loginId: string; password: string };

export default function AdminTiendasPage() {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creds, setCreds] = useState<Creds | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/stores");
    if (!res.ok) {
      setError("No se pudieron cargar las tiendas");
      return;
    }
    const data = await res.json();
    setStores(data.stores ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createStore(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreds(null);
    const res = await fetch("/api/admin/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Error al crear");
      return;
    }
    const data = await res.json();
    setCreds(data.credentials);
    setName("");
    await load();
  }

  async function resetPassword(id: string) {
    if (!confirm("¿Generar una nueva contraseña para esta tienda?")) return;
    const res = await fetch(`/api/admin/stores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-password" }),
    });
    if (!res.ok) {
      setError("No se pudo regenerar la contraseña");
      return;
    }
    const data = await res.json();
    setCreds(data.credentials);
  }

  async function removeStore(id: string, storeName: string) {
    if (!confirm(`¿Eliminar la tienda “${storeName}” y sus ofertas?`)) return;
    const res = await fetch(`/api/admin/stores/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("No se pudo eliminar");
      return;
    }
    await load();
  }

  async function copyCreds() {
    if (!creds) return;
    await navigator.clipboard.writeText(
      `ID: ${creds.loginId}\nContraseña: ${creds.password}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="cm-app-bg">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="cm-page-title">Tiendas departamentales</h1>
          <p className="cm-page-subtitle">
            Creá usuarios (Número ID + contraseña) para que las tiendas ingresen como usuarios.
          </p>
        </div>

        {creds ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-900">
              Credenciales generadas — entregalas a la tienda ahora
            </p>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-emerald-800/70">Número ID</dt>
                <dd className="font-mono text-lg font-bold text-emerald-950">{creds.loginId}</dd>
              </div>
              <div>
                <dt className="text-emerald-800/70">Contraseña</dt>
                <dd className="font-mono text-lg font-bold text-emerald-950">{creds.password}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={copyCreds}
              className="cm-btn-secondary mt-4 inline-flex items-center gap-2 text-sm"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        ) : null}

        <form onSubmit={createStore} className="cm-card mb-8 flex flex-wrap items-end gap-4 p-6">
          <div className="min-w-[240px] flex-1">
            <label className="mb-1 block text-sm text-slate-600">Nombre de la tienda</label>
            <input
              className="cm-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Falabella Fashion"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="cm-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {loading ? "Creando…" : "Crear acceso"}
          </button>
        </form>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <div className="cm-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Tienda</th>
                <th className="px-4 py-3">Número ID</th>
                <th className="px-4 py-3">Ofertas</th>
                <th className="px-4 py-3">Jobs IA</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Aún no hay tiendas. Creá la primera arriba.
                  </td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-[#0B1B4D]">{s.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">{s.username}</td>
                    <td className="px-4 py-3 text-slate-600">{s.offersCount}</td>
                    <td className="px-4 py-3 text-slate-600">{s.designJobsCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => resetPassword(s.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2F6BFF] hover:bg-blue-50"
                          title="Regenerar contraseña"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Nueva clave
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStore(s.id, s.name)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
