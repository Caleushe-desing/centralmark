/**
 * Rubros de tienda — definen categoría, imagen de muestra por defecto y copy base.
 * El usuario elige el rubro en Configuración; puede subir previewImageUrl propia.
 */

export const STORE_RUBRO_IDS = ["footwear", "fashion", "tech", "food", "other"] as const;
export type StoreRubro = (typeof STORE_RUBRO_IDS)[number];

export interface StoreRubroDefinition {
  id: StoreRubro;
  label: string;
  categoryLabel: string;
  /** Imagen estática por rubro (sin OpenAI) */
  defaultSampleImageUrl: string;
  productKeyword: string;
  offerKeyword: string;
}

export const STORE_RUBROS: StoreRubroDefinition[] = [
  {
    id: "footwear",
    label: "Calzado y deporte",
    categoryLabel: "Calzado deportivo",
    defaultSampleImageUrl: "/design-modes/impact-sample.png",
    productKeyword: "ZAPATILLAS",
    offerKeyword: "DROP SNEAKERS",
  },
  {
    id: "fashion",
    label: "Moda y accesorios",
    categoryLabel: "Ropa y accesorios",
    defaultSampleImageUrl: "/design-modes/editorial-sample.png",
    productKeyword: "COLECCIÓN",
    offerKeyword: "NUEVA TEMPORADA",
  },
  {
    id: "tech",
    label: "Electrónica y tecnología",
    categoryLabel: "Electrónica",
    defaultSampleImageUrl: "/design-modes/retail-sample.png",
    productKeyword: "TECH",
    offerKeyword: "OFERTA TECH",
  },
  {
    id: "food",
    label: "Gastronomía y café",
    categoryLabel: "Gastronomía",
    defaultSampleImageUrl: "/design-modes/editorial-sample.png",
    productKeyword: "SABORES",
    offerKeyword: "MENÚ ESPECIAL",
  },
  {
    id: "other",
    label: "Otro rubro",
    categoryLabel: "Retail general",
    defaultSampleImageUrl: "/design-modes/retail-sample.png",
    productKeyword: "OFERTA",
    offerKeyword: "PROMO",
  },
];

export function parseStoreRubro(value: unknown): StoreRubro {
  if (
    value === "footwear" ||
    value === "fashion" ||
    value === "tech" ||
    value === "food" ||
    value === "other"
  ) {
    return value;
  }
  return "fashion";
}

export function getStoreRubroDefinition(rubro: string | undefined | null): StoreRubroDefinition {
  const id = parseStoreRubro(rubro);
  return STORE_RUBROS.find((r) => r.id === id) ?? STORE_RUBROS[1]!;
}

export function inferRubroFromCategory(category: string): StoreRubro {
  const c = category.toLowerCase();
  if (c.includes("calzado") || c.includes("deport") || c.includes("zapat")) return "footwear";
  if (c.includes("electr") || c.includes("tech") || c.includes("gadget")) return "tech";
  if (c.includes("gastron") || c.includes("café") || c.includes("cafe") || c.includes("food"))
    return "food";
  if (c.includes("ropa") || c.includes("moda") || c.includes("accesor")) return "fashion";
  return "other";
}
