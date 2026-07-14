"use client";

import { usePathname } from "next/navigation";
import { WebAdminShell } from "@/components/web-admin/WebAdminShell";

export default function WebAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/web-admin/login") {
    return <>{children}</>;
  }
  return <WebAdminShell>{children}</WebAdminShell>;
}
