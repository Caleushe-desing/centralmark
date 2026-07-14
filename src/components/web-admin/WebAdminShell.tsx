"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Globe2, LayoutTemplate, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

const NAV = [
  { href: "/web-admin", label: "Estadísticas", icon: BarChart3, exact: true },
  { href: "/web-admin/landing", label: "Editor visual", icon: LayoutTemplate },
];

export function WebAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const fullBleed = pathname.startsWith("/web-admin/landing");

  async function logout() {
    await fetch("/api/auth/web-admin/logout", { method: "POST" });
    router.push("/web-admin/login");
    router.refresh();
  }

  return (
    <div className={fullBleed ? "min-h-screen bg-[#F7F9FF]" : "cm-app-bg min-h-screen"}>
      <header
        className={`sticky top-0 z-[60] border-b border-slate-200/80 bg-white/95 backdrop-blur ${
          fullBleed ? "shadow-sm" : ""
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6 ${
            fullBleed ? "max-w-none" : "max-w-7xl"
          }`}
        >
          <div className="flex items-center gap-4">
            <BrandLogo className="h-8 w-auto" href="/web-admin" />
            <div className="hidden border-l border-slate-200 pl-4 sm:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2F6BFF]">
                Admin web
              </p>
              <p className="text-xs text-slate-500">
                {fullBleed
                  ? "Editá sobre la misma página que ven tus usuarios"
                  : "Contenido y estadísticas del sitio"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="mr-1 hidden items-center gap-1 md:flex">
              {NAV.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#0B1B4D]"
                    }`}
                    style={active ? { background: "var(--cm-grad)" } : undefined}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/"
              target="_blank"
              className="cm-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <Globe2 className="h-3.5 w-3.5" />
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </div>
        </div>
        {!fullBleed ? (
          <nav className="mx-auto flex max-w-7xl gap-1 px-4 pb-3 sm:px-6 md:hidden">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#0B1B4D]"
                  }`}
                  style={active ? { background: "var(--cm-grad)" } : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </header>
      <main className={fullBleed ? "" : "mx-auto max-w-7xl px-4 py-8 sm:px-6"}>
        {children}
      </main>
    </div>
  );
}
