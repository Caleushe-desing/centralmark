import Link from "next/link";
import { Shield, Store } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

type Props = {
  ctaLabel?: string;
};

export function LandingNavbar({ ctaLabel = "Solicitar demo" }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
        <BrandLogo className="h-11 w-auto sm:h-12" priority />

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/tienda"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#0B1B4D]"
          >
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Tiendas</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#0B1B4D]"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin mall</span>
          </Link>
          <Link
            href="/tienda"
            className="cm-btn-primary ml-1 hidden px-4 py-2 sm:inline-flex"
          >
            {ctaLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
