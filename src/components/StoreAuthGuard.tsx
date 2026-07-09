"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { StoreNav } from "./StoreNav";

interface StoreData {
  id: string;
  name: string;
  mall: { name: string; fixedHashtags: string };
}

export function StoreAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === "/tienda/login") {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    fetch("/api/auth/store/me", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          router.replace("/tienda/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setStore(data);
      })
      .catch(() => {
        router.replace("/tienda/login");
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, [pathname, router]);

  if (pathname === "/tienda/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mm-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-8 h-8 border-2 border-mm-neon border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-400 text-sm">Cargando tu tienda…</p>
        <p className="text-neutral-600 text-xs max-w-xs">
          La primera vez puede tardar hasta 1 minuto. No cierres la pestaña.
        </p>
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="min-h-screen bg-mm-black">
      <StoreNav storeName={store.name} mallName={store.mall.name} />
      {children}
    </div>
  );
}
