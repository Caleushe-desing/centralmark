"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const password = (new FormData(e.currentTarget).get("password") as string);

    const res = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Contraseña incorrecta");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
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
          <h1 className="text-2xl font-bold text-white">Panel Admin del Mall</h1>
          <p className="text-neutral-400 mt-2">Acceso restringido al administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="mm-card p-8 space-y-5">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Contraseña de administrador</label>
            <input name="password" type="password" required className="mm-input" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mm-btn-primary disabled:opacity-50"
          >
            <Shield className="w-5 h-5" />
            {loading ? "Verificando..." : "Entrar al panel"}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-600 mt-6">Demo: admin2026</p>
      </div>
    </div>
  );
}
