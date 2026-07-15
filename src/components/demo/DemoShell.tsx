"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ImageIcon, Settings, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ContactDemoButton } from "@/components/contact/ContactDemoButton";

type Props = {
  storeName: string;
  mallName: string;
  children: React.ReactNode;
};

export function DemoShell({ storeName, mallName, children }: Props) {
  const pathname = usePathname();

  const links = [
    { href: "/demo", label: "Publicaciones", icon: ImageIcon, exact: true },
    { href: "/demo/configuracion", label: "Configuración", icon: Settings },
    { href: "/demo/moderacion", label: "Vista mall", icon: ShieldCheck },
  ];

  return (
    <div className="cm-app-bg min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/demo" className="flex min-w-0 items-center gap-3">
            <BrandLogo className="h-9 w-auto shrink-0" href={null} />
            <div className="min-w-0 border-l border-slate-200 pl-3">
              <span className="block truncate text-base font-bold text-[#0B1B4D]">{storeName}</span>
              <span className="block truncate text-xs text-slate-500">{mallName} · Demo</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
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
            <Link
              href="/"
              className="ml-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Link>
            <div className="ml-1 hidden sm:block">
              <ContactDemoButton
                label="Demo real"
                className="cm-btn-primary px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
