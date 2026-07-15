"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const defaultUsername = searchParams.get("username") ?? "";
  const defaultPassword = searchParams.get("password") ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setStatus("Verificando acceso…");

    const form = new FormData(e.currentTarget);
    const username = (form.get("username") as string).trim();
    const password = form.get("password") as string;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);

      const res = await fetch("/api/auth/store/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError((data as { error?: string }).error ?? "ID o contraseña incorrectos");
        setLoading(false);
        setStatus(null);
        return;
      }

      setStatus("Entrando…");
      router.refresh();
      router.push("/tienda");
    } catch {
      setError("No se pudo conectar. Intentá de nuevo en unos segundos.");
      setLoading(false);
      setStatus(null);
    }
  }

  return (
    <div className="cm-app-bg flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <BrandLogo className="h-12 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B1B4D]">Ingreso Usuarios</h1>
          <p className="mt-2 text-slate-600">
            Tiendas departamentales — usá el Número ID y la contraseña que te entregó el mall.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="cm-card space-y-5 p-8">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Número ID</label>
            <input
              name="username"
              required
              autoComplete="username"
              inputMode="numeric"
              defaultValue={defaultUsername}
              placeholder="Ej: 1001"
              className="cm-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              defaultValue={defaultPassword}
              className="cm-input"
            />
          </div>

          {status && <p className="text-sm text-[#2F6BFF]">{status}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="cm-btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <Users className="h-5 w-5" />
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Demo: ID <span className="font-mono">1001</span> / <span className="font-mono">tienda123</span>
          {" · "}
          <Link href="/admin/login" className="text-[#2F6BFF] hover:underline">
            Ingreso Clientes
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function TiendaLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="cm-app-bg flex min-h-screen items-center justify-center text-slate-600">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
