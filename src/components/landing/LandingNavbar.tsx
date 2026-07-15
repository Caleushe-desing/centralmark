"use client";

import Link from "next/link";
import { Building2, Users } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ContactDemoButton } from "@/components/contact/ContactDemoButton";

type Props = {
  ctaLabel?: string;
  ctaSlot?: React.ReactNode;
  disableLinks?: boolean;
};

export function LandingNavbar({
  ctaLabel = "Solicitar una demo",
  ctaSlot,
  disableLinks,
}: Props) {
  const linkClass =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#0B1B4D]";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
        <BrandLogo
          className="h-9 w-auto sm:h-10"
          priority
          href={disableLinks ? null : "/"}
        />

        <nav className="flex items-center gap-1 sm:gap-2">
          {disableLinks ? (
            <>
              <span className={linkClass}>
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Ingreso Usuarios</span>
              </span>
              <span className={linkClass}>
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Ingreso Clientes</span>
              </span>
            </>
          ) : (
            <>
              <Link href="/demo" className={linkClass}>
                <span className="hidden sm:inline">Ver plataforma</span>
                <span className="sm:hidden">Plataforma</span>
              </Link>
              <Link href="/tienda/login" className={linkClass}>
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Ingreso Usuarios</span>
              </Link>
              <Link href="/admin/login" className={linkClass}>
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Ingreso Clientes</span>
              </Link>
            </>
          )}
          {ctaSlot ? (
            <div className="ml-1 hidden min-w-[140px] sm:block">{ctaSlot}</div>
          ) : disableLinks ? (
            <span className="cm-btn-primary ml-1 hidden px-4 py-2 sm:inline-flex">{ctaLabel}</span>
          ) : (
            <div className="ml-1 hidden sm:block">
              <ContactDemoButton label={ctaLabel} className="cm-btn-primary px-4 py-2" />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
