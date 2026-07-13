import type { VisualArchetype } from "./archetypes";
import type { ArchetypeSampleCopy } from "./archetypes";
import { parseStoreRubro, type StoreRubro } from "@/lib/store/rubros";

/** Variantes de copy por arquetipo × rubro — sin OpenAI, 100% español */
const PRESETS: Record<VisualArchetype, Partial<Record<StoreRubro, ArchetypeSampleCopy[]>>> = {
  drop: {
    footwear: [
      { badge: "NUEVO LANZAMIENTO", hook: "ENERGÍA CALLEJERA", subtext: "-40% DTO", cta: "COMPRA YA" },
      { badge: "EDICIÓN LIMITADA", hook: "ZAPATILLAS", subtext: "30% DTO", cta: "SOLO HOY" },
    ],
    furniture: [
      { badge: "LIQUIDACIÓN", hook: "HOGAR NUEVO", subtext: "-35% DTO", cta: "VER OFERTA" },
      { badge: "SALIDA MUEBLES", hook: "SALÓN PRO", subtext: "50% DTO", cta: "RESERVAR" },
    ],
    fashion: [
      { badge: "NUEVA TEMPORADA", hook: "ESTILO URBANO", subtext: "-30%", cta: "COMPRA YA" },
      { badge: "LANZAMIENTO INVIERNO", hook: "INVIERNO", subtext: "40% DTO", cta: "EXCLUSIVO" },
    ],
    tech: [
      { badge: "LANZAMIENTO TECNOLÓGICO", hook: "DISPOSITIVO PRO", subtext: "-25%", cta: "LLEVAR" },
    ],
    food: [
      { badge: "MENÚ NUEVO", hook: "SABOR TOP", subtext: "2x1", cta: "PEDIR" },
    ],
    beauty: [
      { badge: "NUEVO RITUAL", hook: "CUIDADO DE PIEL", subtext: "-20%", cta: "PROBAR" },
    ],
    other: [
      { badge: "OFERTA", hook: "IMPACTO", subtext: "-30%", cta: "VER MÁS" },
    ],
  },
  spotlight: {
    footwear: [
      { badge: "EDICIÓN", hook: "ZAPATILLA MAX", subtext: "Par limitado", cta: "DETALLES" },
      { badge: "EXCLUSIVO", hook: "CORREDOR PRO", subtext: "Solo en tienda", cta: "VER" },
    ],
    furniture: [
      { badge: "COLECCIÓN", hook: "SOFÁ NÓRDICO", subtext: "Diseño premium", cta: "COTIZAR" },
      { badge: "HOGAR", hook: "MESA ROBLE", subtext: "Hecho a medida", cta: "VER" },
    ],
    fashion: [
      { badge: "CURADO", hook: "SILUETA", subtext: "Piezas únicas", cta: "EXPLORAR" },
    ],
    tech: [
      { badge: "INSIGNIA", hook: "PORTÁTIL PRO", subtext: "Stock limitado", cta: "INFO" },
    ],
    food: [
      { badge: "CHEF", hook: "DESAYUNO DE AUTOR", subtext: "Reserva hoy", cta: "MESA" },
    ],
    beauty: [
      { badge: "RITUAL", hook: "SERUM", subtext: "Fórmula nueva", cta: "DESCUBRIR" },
    ],
    other: [
      { badge: "DESTACADO", hook: "PRODUCTO", subtext: "Edición única", cta: "VER" },
    ],
  },
  editorial: {
    footwear: [
      { badge: "EDICIÓN", hook: "Zapatilla urbana", subtext: "Cultura urbana en cada paso", cta: "LEER MÁS" },
    ],
    furniture: [
      { badge: "ATELIER", hook: "Salón", subtext: "Espacios que cuentan historias", cta: "COLECCIÓN" },
    ],
    fashion: [
      { badge: "EDICIÓN", hook: "Invierno", subtext: "La moda redefine la calle", cta: "VER MÁS" },
    ],
    tech: [
      { badge: "LAB", hook: "Futuro", subtext: "Innovación con propósito", cta: "DESCUBRIR" },
    ],
    food: [
      { badge: "SABOR", hook: "Origen", subtext: "Ingredientes con alma", cta: "MENÚ" },
    ],
    beauty: [
      { badge: "BRILLO", hook: "Ritual", subtext: "Belleza consciente", cta: "VER" },
    ],
    other: [
      { badge: "HISTORIA", hook: "Marca", subtext: "Narrativa visual", cta: "DESCUBRIR" },
    ],
  },
  promo: {
    footwear: [
      { badge: "SOLO HOY", hook: "50%", subtext: "Zapatillas seleccionadas", cta: "APROVECHA" },
      { badge: "FIN DE SEMANA", hook: "40%", subtext: "Todo el catálogo", cta: "COMPRAR" },
    ],
    furniture: [
      { badge: "LIQUIDACIÓN", hook: "45%", subtext: "Sofás y comedores", cta: "COTIZAR" },
      { badge: "REMODELA", hook: "30%", subtext: "Muebles de living", cta: "VER STOCK" },
    ],
    fashion: [
      { badge: "REBAJA", hook: "50%", subtext: "Temporada anterior", cta: "COMPRA" },
    ],
    tech: [
      { badge: "PROMO DIGITAL", hook: "35%", subtext: "Laptops y audio", cta: "LLEVAR" },
    ],
    food: [
      { badge: "HORA PROMO", hook: "2x1", subtext: "Bebidas y postres", cta: "RESERVA" },
    ],
    beauty: [
      { badge: "KIT", hook: "25%", subtext: "Rutina completa", cta: "PEDIR" },
    ],
    other: [
      { badge: "PROMO", hook: "40%", subtext: "Oferta limitada", cta: "COMPRAR" },
    ],
  },
};

const FALLBACK: ArchetypeSampleCopy = {
  badge: "OFERTA",
  hook: "DESTACADO",
  subtext: "Promo activa",
  cta: "VER MÁS",
};

export function getArchetypeCopyPresets(
  archetype: VisualArchetype,
  rubro: string | undefined | null
): ArchetypeSampleCopy[] {
  const id = parseStoreRubro(rubro);
  const list = PRESETS[archetype][id];
  if (list?.length) return list;
  return [FALLBACK];
}

export function pickArchetypeSampleCopy(
  archetype: VisualArchetype,
  rubro: string | undefined | null,
  variant = 0
): ArchetypeSampleCopy {
  const presets = getArchetypeCopyPresets(archetype, rubro);
  return presets[variant % presets.length] ?? FALLBACK;
}
