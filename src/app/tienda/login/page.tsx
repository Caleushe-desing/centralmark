"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Store } from "lucide-react";

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
    setLoading(true);
    setError(null);
    setStatus("Conectando con el servidor…");

    const form = new FormData(e.currentTarget);
    const username = form.get("username") as string;
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
        setError((data as { error?: string }).error ?? "Error al iniciar sesión");
        setLoading(false);
        setStatus(null);
        return;
      }

      setStatus("Entrando a tu tienda…");
      router.push("/tienda");
      router.refresh();
      window.setTimeout(() => {
        window.location.href = "/tienda";
      }, 1500);
    } catch {
      setError(
        "No se pudo conectar. Espera 1 minuto (primera carga lenta) o usa http://localhost:3000"
      );
      setLoading(false);
      setStatus(null);
    }
  }

  return (
    <div className="min-h-screen bg-mm-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mm-neon to-mm-yellow flex items-center justify-center mm-glow-neon">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Acceso de Tienda</h1>
          <p className="text-neutral-400 mt-2">Ingresa con tu usuario y contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="mm-card p-8 space-y-5">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Usuario</label>
            <input
              name="username"
              required
              autoComplete="username"
              defaultValue={defaultUsername}
              placeholder="ej: sneakerzone"
              className="mm-input"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              defaultValue={defaultPassword}
              className="mm-input"
            />
          </div>

          {status && <p className="text-mm-yellow text-sm">{status}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mm-btn-primary disabled:opacity-50"
          >
            <Store className="w-5 h-5" />
            {loading ? "Ingresando..." : "Entrar a mi tienda"}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-600 mt-6">
          Demo: sneakerzone / tienda123 — usa{" "}
          <a href="http://localhost:3000/tienda/login" className="text-mm-neon/90 hover:underline">
            localhost:3000
          </a>
        </p>
      </div>
    </div>
  );
}

export default function TiendaLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-mm-black flex items-center justify-center text-neutral-400">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
