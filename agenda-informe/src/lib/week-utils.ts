/** Utilidades para calcular la semana laboral (lunes a domingo). */

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Próximo lunes (o hoy si ya es lunes y queremos esta semana — usamos próxima semana). */
export function getNextWeekMonday(from: Date = new Date()): Date {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const day = date.getDay();
  const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + daysUntilNextMonday);
  return date;
}

export function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function formatDayLabel(iso: string): string {
  const date = parseIsoDate(iso);
  const weekday = date.toLocaleDateString("es-ES", { weekday: "short" });
  const day = date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return `${weekday} · ${day}`;
}

export function createEmptyAgenda(monday: Date) {
  const days = getWeekDays(monday);
  return {
    semanaInicio: toIsoDate(days[0]),
    semanaFin: toIsoDate(days[6]),
    dias: days.map((d) => ({
      fecha: toIsoDate(d),
      actividades: [],
    })),
  };
}

export function newActivityId(): string {
  return crypto.randomUUID();
}
