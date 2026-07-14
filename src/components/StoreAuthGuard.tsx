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
      setStore(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    setLoading(true);

    fetch("/api/auth/store/me", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          if (!cancelled) router.replace("/tienda/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data) setStore(data);
      })
      .catch(() => {
        if (!cancelled) router.replace("/tienda/login");
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [pathname, router]);

  if (pathname === "/tienda/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="cm-app-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        <p className="text-sm text-slate-600">Cargando tu tienda…</p>
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="cm-app-bg">
      <StoreNav storeName={store.name} mallName={store.mall.name} />
      {children}
    </div>
  );
}
