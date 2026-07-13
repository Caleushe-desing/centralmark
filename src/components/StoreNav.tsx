"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Package, Settings, Tag, LogOut, Megaphone, Shield } from "lucide-react";

interface StoreNavProps {
  storeName: string;
  mallName?: string;
}

export function StoreNav({ storeName, mallName }: StoreNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/tienda", label: "Ofertas", icon: Tag },
    { href: "/gestor-publicaciones", label: "Gestor Pro", icon: Megaphone },
    { href: "/tienda/productos", label: "Catálogo", icon: Package },
    { href: "/tienda/configuracion", label: "Configuración", icon: Settings },
  ];

  async function logout() {
    await fetch("/api/auth/store/logout", { method: "POST" });
    router.push("/tienda/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/tienda" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0F2B5B] to-[#1E4A8C] shadow-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-base font-bold text-[#0F2B5B]">{storeName}</span>
              {mallName && (
                <span className="block truncate text-xs text-slate-500">{mallName}</span>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-[#2563EB] border border-blue-100"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#0F2B5B]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-[#0F2B5B]"
              title="Panel del mall"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
            <button
              onClick={logout}
              className="ml-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-[#0F2B5B]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
