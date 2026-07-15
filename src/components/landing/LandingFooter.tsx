"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

type Props = {
  blurb?: string;
  email?: string;
  blurbSlot?: React.ReactNode;
  emailSlot?: React.ReactNode;
  disableLinks?: boolean;
};

export function LandingFooter({
  blurb = "Plataforma de marketing inteligente para centros comerciales.",
  email = "ventas@centralmark.cl",
  blurbSlot,
  emailSlot,
  disableLinks,
}: Props) {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0B1B4D] text-slate-300">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--cm-grad)" }}
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4">
              <BrandLogo
                className="h-12 w-auto brightness-0 invert"
                href={disableLinks ? null : "/"}
              />
            </div>
            {blurbSlot ?? (
              <p className="max-w-md text-sm leading-relaxed text-slate-400">{blurb}</p>
            )}
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Plataforma
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                {disableLinks ? (
                  <span>Demo interactiva</span>
                ) : (
                  <Link href="/demo" className="transition hover:text-white">
                    Demo interactiva
                  </Link>
                )}
              </li>
              <li>
                {disableLinks ? (
                  <span>Ingreso Clientes (mall)</span>
                ) : (
                  <Link href="/admin/login" className="transition hover:text-white">
                    Ingreso Clientes (mall)
                  </Link>
                )}
              </li>
              <li>
                {disableLinks ? (
                  <span>Ingreso Usuarios (tiendas)</span>
                ) : (
                  <Link href="/tienda/login" className="transition hover:text-white">
                    Ingreso Usuarios (tiendas)
                  </Link>
                )}
              </li>
              <li>
                {disableLinks ? (
                  <span>Vitrina digital</span>
                ) : (
                  <Link href="/vitrina" className="transition hover:text-white">
                    Vitrina digital
                  </Link>
                )}
              </li>
              <li>
                {disableLinks ? (
                  <span>Admin de la web</span>
                ) : (
                  <Link href="/web-admin" className="transition hover:text-white">
                    Admin de la web
                  </Link>
                )}
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
            {emailSlot ?? (
              <a
                href={`mailto:${email}`}
                className="mt-2 inline-block text-sm font-medium text-[#00C2FF] transition hover:text-white"
              >
                {email}
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} CentralMark. Todos los derechos reservados.</p>
          <p className="uppercase tracking-[0.2em] text-slate-400">Marketing en segundos</p>
        </div>
      </div>
    </footer>
  );
}
