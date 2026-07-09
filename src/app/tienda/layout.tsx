import { StoreAuthGuard } from "@/components/StoreAuthGuard";

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return <StoreAuthGuard>{children}</StoreAuthGuard>;
}
