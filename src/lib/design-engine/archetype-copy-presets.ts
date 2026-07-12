import type { VisualArchetype } from "./archetypes";
import type { ArchetypeSampleCopy } from "./archetypes";
import { parseStoreRubro, type StoreRubro } from "@/lib/store/rubros";

/** Variantes de copy por arquetipo × rubro — sin OpenAI */
const PRESETS: Record<VisualArchetype, Partial<Record<StoreRubro, ArchetypeSampleCopy[]>>> = {
  drop: {
    footwear: [
      { badge: "NUEVO DROP", hook: "STREET HEAT", subtext: "-40% DTO", cta: "COMPRA YA" },
      { badge: "DROP LIMITADO", hook: "ZAPATILLAS", subtext: "30% OFF", cta: "SOLO HOY" },
    ],
    furniture: [
      { badge: "LIQUIDACIÓN", hook: "HOGAR NUEVO", subtext: "-35% DTO", cta: "VER OFERTA" },
      { badge: "OUTLET MUEBLES", hook: "SALÓN PRO", subtext: "50% OFF", cta: "RESERVAR" },
    ],
    fashion: [
      { badge: "NUEVA TEMPORADA", hook: "URBAN FIT", subtext: "-30%", cta: "SHOP NOW" },
      { badge: "DROP FW", hook: "INVIERNO", subtext: "40% OFF", cta: "EXCLUSIVO" },
    ],
    tech: [
      { badge: "TECH DROP", hook: "GADGET PRO", subtext: "-25%", cta: "LLEVAR" },
    ],
    food: [
      { badge: "MENÚ NUEVO", hook: "SABOR TOP", subtext: "2x1", cta: "PEDIR" },
    ],
    beauty: [
      { badge: "GLOW DROP", hook: "SKINCARE", subtext: "-20%", cta: "PROBAR" },
    ],
    other: [
      { badge: "OFERTA", hook: "IMPACTO", subtext: "-30%", cta: "VER MÁS" },
    ],
  },
  spotlight: {
    footwear: [
      { badge: "EDICIÓN", hook: "AIR MAX", subtext: "Par limitado", cta: "DETALLES" },
      { badge: "EXCLUSIVO", hook: "RUNNER PRO", subtext: "Solo en tienda", cta: "VER" },
    ],
    furniture: [
      { badge: "COLECCIÓN", hook: "SOFÁ NÓRDICO", subtext: "Diseño premium", cta: "COTIZAR" },
      { badge: "HOGAR", hook: "MESA ROBLE", subtext: "Hecho a medida", cta: "VER" },
    ],
    fashion: [
      { badge: "CURADO", hook: "SILUETA", subtext: "Piezas únicas", cta: "EXPLORAR" },
    ],
    tech: [
      { badge: "FLAGSHIP", hook: "ULTRABOOK", subtext: "Stock limitado", cta: "INFO" },
    ],
    food: [
      { badge: "CHEF", hook: "BRUNCH", subtext: "Reserva hoy", cta: "MESA" },
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
      { badge: "ÉDITION", hook: "Sneaker", subtext: "Cultura urbana en cada paso", cta: "LEER MÁS" },
    ],
    furniture: [
      { badge: "ATELIER", hook: "Living", subtext: "Espacios que cuentan historias", cta: "COLECCIÓN" },
    ],
    fashion: [
      { badge: "ÉDITION", hook: "Invierno", subtext: "La moda redefine la calle", cta: "VER MÁS" },
    ],
    tech: [
      { badge: "LAB", hook: "Futuro", subtext: "Innovación con propósito", cta: "INSIGHT" },
    ],
    food: [
      { badge: "SABOR", hook: "Origen", subtext: "Ingredientes con alma", cta: "MENÚ" },
    ],
    beauty: [
      { badge: "GLOW", hook: "Ritual", subtext: "Belleza consciente", cta: "VER" },
    ],
    other: [
      { badge: "STORY", hook: "Marca", subtext: "Narrativa visual", cta: "DESCUBRIR" },
    ],
  },
  promo: {
    footwear: [
      { badge: "SOLO HOY", hook: "50%", subtext: "Zapatillas seleccionadas", cta: "APROVECHA" },
      { badge: "FIN DE SEMANA", hook: "40%", subtext: "Todo el catálogo", cta: "COMPRAR" },
    ],
    furniture: [
      { badge: "OUTLET", hook: "45%", subtext: "Sofás y comedores", cta: "COTIZAR" },
      { badge: "REMODELA", hook: "30%", subtext: "Muebles de living", cta: "VER STOCK" },
    ],
    fashion: [
      { badge: "SALE", hook: "50%", subtext: "Temporada anterior", cta: "COMPRA" },
    ],
    tech: [
      { badge: "CYBER", hook: "35%", subtext: "Laptops y audio", cta: "LLEVAR" },
    ],
    food: [
      { badge: "HAPPY HOUR", hook: "2x1", subtext: "Bebidas y postres", cta: "RESERVA" },
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
