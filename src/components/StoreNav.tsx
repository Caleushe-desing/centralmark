"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Package, Settings, Tag, LogOut } from "lucide-react";

interface StoreNavProps {
  storeName: string;
  mallName?: string;
}

export function StoreNav({ storeName, mallName }: StoreNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/tienda", label: "Ofertas", icon: Tag },
    { href: "/tienda/productos", label: "Catálogo", icon: Package },
    { href: "/tienda/configuracion", label: "Configuración", icon: Settings },
  ];

  async function logout() {
    await fetch("/api/auth/store/logout", { method: "POST" });
    router.push("/tienda/login");
  }

  return (
    <nav className="border-b border-mm-neon/10 bg-mm-black/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/tienda" className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mm-neon to-mm-yellow flex items-center justify-center shrink-0 mm-glow-neon">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div className="min-w-0">
              <span className="text-lg font-bold text-white block truncate">{storeName}</span>
              {mallName && (
                <span className="text-xs text-neutral-500 block truncate">{mallName}</span>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  pathname === href
                    ? "bg-mm-neon/15 text-mm-neon border border-mm-neon/25"
                    : "text-neutral-400 hover:text-mm-yellow hover:bg-mm-yellow/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:text-white hover:bg-white/5 transition ml-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
