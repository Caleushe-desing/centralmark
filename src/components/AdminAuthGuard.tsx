"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthed(true);
      return;
    }

    fetch("/api/auth/admin/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/admin/login");
          setAuthed(false);
        } else {
          setAuthed(true);
        }
      })
      .catch(() => {
        router.replace("/admin/login");
        setAuthed(false);
      });
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (authed === null) {
    return (
      <div className="min-h-screen bg-mm-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-mm-neon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) return null;

  return <>{children}</>;
}
