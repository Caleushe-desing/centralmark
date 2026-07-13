import Link from "next/link";
import { Building2 } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#0F2B5B] text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CentralMark</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              Plataforma de marketing inteligente para centros comerciales. Conecta a la
              administración del mall con cada tienda mediante IA generativa y coordinación
              centralizada.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Plataforma
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/admin" className="transition hover:text-white">
                  Panel de administración
                </Link>
              </li>
              <li>
                <Link href="/tienda" className="transition hover:text-white">
                  Portal de tiendas
                </Link>
              </li>
              <li>
                <Link href="/vitrina" className="transition hover:text-white">
                  Vitrina digital
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Contacto
            </h4>
            <p className="text-sm leading-relaxed text-slate-400">
              ¿Interesado en implementar CentralMark en tu centro comercial?
            </p>
            <a
              href="mailto:contacto@centralmark.cl"
              className="mt-2 inline-block text-sm font-medium text-blue-300 transition hover:text-white"
            >
              contacto@centralmark.cl
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} CentralMark. Todos los derechos reservados.</p>
          <p>Marketing inteligente para centros comerciales y retail multi-sucursal.</p>
        </div>
      </div>
    </footer>
  );
}
