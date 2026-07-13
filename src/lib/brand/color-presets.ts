export interface ColorPreset {
  hex: string;
  name: string;
  group: string;
}

export const COLOR_PRESET_GROUPS = [
  "Corporativo",
  "Retail",
  "Elegante",
  "Naturaleza",
  "Vibrante",
  "Neutro",
] as const;

export const COLOR_PRESETS: ColorPreset[] = [
  { hex: "#0F2B5B", name: "Azul corporativo", group: "Corporativo" },
  { hex: "#1E40AF", name: "Azul institucional", group: "Corporativo" },
  { hex: "#2563EB", name: "Azul brillante", group: "Corporativo" },
  { hex: "#1E3A8A", name: "Azul marino", group: "Corporativo" },
  { hex: "#0E7490", name: "Azul petróleo", group: "Corporativo" },
  { hex: "#DC2626", name: "Rojo oferta", group: "Retail" },
  { hex: "#E11D48", name: "Rojo retail", group: "Retail" },
  { hex: "#EA580C", name: "Naranja promoción", group: "Retail" },
  { hex: "#D97706", name: "Ámbar", group: "Retail" },
  { hex: "#CA8A04", name: "Dorado comercial", group: "Retail" },
  { hex: "#1E1B4B", name: "Índigo profundo", group: "Elegante" },
  { hex: "#4C1D95", name: "Púrpura premium", group: "Elegante" },
  { hex: "#831843", name: "Vino", group: "Elegante" },
  { hex: "#134E4A", name: "Verde bosque", group: "Naturaleza" },
  { hex: "#166534", name: "Verde natural", group: "Naturaleza" },
  { hex: "#047857", name: "Esmeralda", group: "Naturaleza" },
  { hex: "#0D9488", name: "Turquesa", group: "Naturaleza" },
  { hex: "#7C3AED", name: "Violeta", group: "Vibrante" },
  { hex: "#DB2777", name: "Magenta", group: "Vibrante" },
  { hex: "#0891B2", name: "Cian", group: "Vibrante" },
  { hex: "#111827", name: "Grafito", group: "Neutro" },
  { hex: "#374151", name: "Gris pizarra", group: "Neutro" },
  { hex: "#6B7280", name: "Gris medio", group: "Neutro" },
  { hex: "#F8FAFC", name: "Blanco humo", group: "Neutro" },
];

export function filterColorPresets(query: string): ColorPreset[] {
  const q = query.trim().toLowerCase();
  if (!q) return COLOR_PRESETS;
  return COLOR_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.group.toLowerCase().includes(q) ||
      p.hex.toLowerCase().includes(q)
  );
}

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;
  return null;
}
