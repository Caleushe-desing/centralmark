"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

function AccesoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const password = new FormData(e.currentTarget).get("password") as string;
    const res = await fetch("/api/auth/site-access/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Clave incorrecta");
      setLoading(false);
      return;
    }

    const dest = next.startsWith("/") ? next : "/";
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="cm-app-bg flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <BrandLogo className="h-14 w-auto" href={null} />
          </div>
          <h1
            className="text-2xl font-bold text-[#0B1B4D]"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            Acceso privado
          </h1>
          <p className="mt-2 text-slate-600">
            Este sitio está protegido. Ingresa la clave para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="cm-card space-y-5 p-8">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Clave de acceso</label>
            <input
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              className="cm-input"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="cm-btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <Lock className="h-5 w-5" />
            {loading ? "Verificando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AccesoPage() {
  return (
    <Suspense
      fallback={
        <div className="cm-app-bg flex min-h-screen items-center justify-center text-slate-600">
          Cargando…
        </div>
      }
    >
      <AccesoForm />
    </Suspense>
  );
}
