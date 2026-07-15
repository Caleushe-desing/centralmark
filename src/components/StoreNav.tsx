"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ImageIcon, LogOut, Settings } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface StoreNavProps {
  storeName: string;
  mallName?: string;
}

export function StoreNav({ storeName, mallName }: StoreNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/tienda", label: "Publicaciones", icon: ImageIcon },
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
            <BrandLogo className="h-9 w-auto shrink-0" href={null} />
            <div className="min-w-0 border-l border-slate-200 pl-3">
              <span className="block truncate text-base font-bold text-[#0B1B4D]">{storeName}</span>
              {mallName && (
                <span className="block truncate text-xs text-slate-500">{mallName}</span>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/tienda"
                  ? pathname === "/tienda"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "border border-blue-100 bg-blue-50 text-[#2F6BFF]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#0B1B4D]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="ml-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-[#0B1B4D]"
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
