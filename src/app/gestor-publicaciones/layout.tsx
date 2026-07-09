import { StoreAuthGuard } from "@/components/StoreAuthGuard";

export default function GestorPublicacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreAuthGuard>{children}</StoreAuthGuard>;
}
