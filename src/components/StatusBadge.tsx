const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Borrador", className: "bg-neutral-500/20 text-neutral-300" },
  GENERATING: { label: "Generando IA...", className: "bg-mm-yellow/15 text-mm-yellow" },
  PENDING: { label: "Pendiente", className: "bg-mm-yellow/20 text-mm-yellow" },
  APPROVED: { label: "Aprobada", className: "bg-mm-neon/15 text-mm-neon" },
  PUBLISHED: { label: "Publicada", className: "bg-mm-neon/25 text-mm-neon border border-mm-neon/30" },
  REJECTED: { label: "Rechazada", className: "bg-red-500/20 text-red-300" },
  FAILED: { label: "Error", className: "bg-red-500/20 text-red-300" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.DRAFT;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
