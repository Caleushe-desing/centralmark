import Link from "next/link";
import { Building2, Store, Shield, Monitor } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0F2B5B] to-[#1E4A8C] shadow-sm">
            <Building2 className="h-5 w-5 text-white" strokeWidth={2.25} />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-bold tracking-tight text-[#0F2B5B]">
              Central<span className="text-[#2563EB]">Mark</span>
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:block">
              Administración del mall
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/tienda"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#0F2B5B]"
          >
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Tiendas</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#0F2B5B] bg-blue-50 border border-blue-100"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
          <Link
            href="/vitrina"
            className="ml-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-[#0F2B5B] transition hover:bg-slate-50"
          >
            <Monitor className="h-4 w-4 inline sm:mr-1.5" />
            <span className="hidden sm:inline">Vitrina</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
