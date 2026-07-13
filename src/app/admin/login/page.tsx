"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const password = new FormData(e.currentTarget).get("password") as string;

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
    <div className="cm-app-bg flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F2B5B] to-[#1E4A8C] shadow-sm">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[#0F2B5B]">Panel Admin del Mall</h1>
          <p className="mt-2 text-slate-600">Acceso restringido al administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="cm-card space-y-5 p-8">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Contraseña de administrador</label>
            <input name="password" type="password" required className="cm-input" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="cm-btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <Shield className="h-5 w-5" />
            {loading ? "Verificando..." : "Entrar al panel"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">Demo: admin2026</p>
      </div>
    </div>
  );
}
