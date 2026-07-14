"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe2 } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function WebAdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const password = new FormData(e.currentTarget).get("password") as string;

    const res = await fetch("/api/auth/web-admin/login", {
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

    router.push("/web-admin");
    router.refresh();
  }

  return (
    <div className="cm-app-bg flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <BrandLogo className="h-14 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B1B4D]">Admin de la web</h1>
          <p className="mt-2 text-slate-600">
            Editá textos, fotos y mirá estadísticas del sitio. No es el admin del mall.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="cm-card space-y-5 p-8">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Contraseña del admin web</label>
            <input name="password" type="password" required className="cm-input" autoFocus />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="cm-btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <Globe2 className="h-5 w-5" />
            {loading ? "Verificando..." : "Entrar al admin web"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Demo: <span className="font-mono">webadmin2026</span> ·{" "}
          <Link href="/" className="text-[#2F6BFF] hover:underline">
            Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}
