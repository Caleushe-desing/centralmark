"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";

const LINKS = [
  { href: "/admin", label: "Moderación", exact: true },
  { href: "/admin/tiendas", label: "Tiendas" },
  { href: "/admin/estadisticas", label: "Estadísticas" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/admin" className="flex items-center gap-3">
          <BrandLogo className="h-9 w-auto" href={null} />
          <div className="hidden border-l border-slate-200 pl-3 leading-tight sm:block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#2F6BFF]">
              Cliente · Mall
            </span>
            <span className="block text-sm font-medium text-slate-600">Panel de administración</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "border border-blue-100 bg-blue-50 text-[#0B1B4D]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#0B1B4D]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/vitrina"
            className="ml-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-[#0B1B4D] transition hover:bg-slate-50"
          >
            Vitrina
          </Link>
        </nav>
      </div>
    </header>
  );
}
