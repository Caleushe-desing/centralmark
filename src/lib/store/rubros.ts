/**
 * Rubros de tienda — imagen de muestra y keywords por tipo de negocio.
 * El usuario elige rubro en Configuración; puede subir previewImageUrl propia.
 */

export const STORE_RUBRO_IDS = [
  "footwear",
  "fashion",
  "furniture",
  "tech",
  "food",
  "beauty",
  "other",
] as const;
export type StoreRubro = (typeof STORE_RUBRO_IDS)[number];

export interface StoreRubroDefinition {
  id: StoreRubro;
  label: string;
  categoryLabel: string;
  defaultSampleImageUrl: string;
}

export const STORE_RUBROS: StoreRubroDefinition[] = [
  {
    id: "footwear",
    label: "Calzado y deporte",
    categoryLabel: "Calzado deportivo",
    defaultSampleImageUrl: "/design-modes/rubros/footwear.jpg",
  },
  {
    id: "fashion",
    label: "Moda y accesorios",
    categoryLabel: "Ropa y accesorios",
    defaultSampleImageUrl: "/design-modes/rubros/fashion.jpg",
  },
  {
    id: "furniture",
    label: "Muebles y hogar",
    categoryLabel: "Muebles y decoración",
    defaultSampleImageUrl: "/design-modes/rubros/furniture.jpg",
  },
  {
    id: "tech",
    label: "Electrónica y tecnología",
    categoryLabel: "Electrónica",
    defaultSampleImageUrl: "/design-modes/rubros/tech.jpg",
  },
  {
    id: "food",
    label: "Gastronomía y café",
    categoryLabel: "Gastronomía",
    defaultSampleImageUrl: "/design-modes/rubros/food.jpg",
  },
  {
    id: "beauty",
    label: "Belleza y cuidado personal",
    categoryLabel: "Belleza",
    defaultSampleImageUrl: "/design-modes/rubros/beauty.jpg",
  },
  {
    id: "other",
    label: "Otro rubro",
    categoryLabel: "Retail general",
    defaultSampleImageUrl: "/design-modes/rubros/fashion.jpg",
  },
];

export function parseStoreRubro(value: unknown): StoreRubro {
  if (typeof value === "string" && (STORE_RUBRO_IDS as readonly string[]).includes(value)) {
    return value as StoreRubro;
  }
  return "other";
}

export function getStoreRubroDefinition(rubro: string | undefined | null): StoreRubroDefinition {
  const id = parseStoreRubro(rubro);
  return STORE_RUBROS.find((r) => r.id === id) ?? STORE_RUBROS.find((r) => r.id === "other")!;
}

export function inferRubroFromCategory(category: string): StoreRubro {
  const c = category.toLowerCase();
  if (c.includes("calzado") || c.includes("deport") || c.includes("zapat")) return "footwear";
  if (c.includes("muebl") || c.includes("hogar") || c.includes("decor")) return "furniture";
  if (c.includes("electr") || c.includes("tech") || c.includes("gadget")) return "tech";
  if (c.includes("gastron") || c.includes("café") || c.includes("cafe") || c.includes("food"))
    return "food";
  if (c.includes("belleza") || c.includes("cosm") || c.includes("beauty")) return "beauty";
  if (c.includes("ropa") || c.includes("moda") || c.includes("accesor")) return "fashion";
  return "other";
}
