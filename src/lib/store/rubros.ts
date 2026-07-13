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
  "jewelry",
  "pharmacy",
  "kids",
  "pets",
  "sports",
  "books",
  "automotive",
  "services",
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
    defaultSampleImageUrl: "/rubros/footwear.jpg",
  },
  {
    id: "fashion",
    label: "Moda y accesorios",
    categoryLabel: "Ropa y accesorios",
    defaultSampleImageUrl: "/rubros/fashion.jpg",
  },
  {
    id: "furniture",
    label: "Muebles y hogar",
    categoryLabel: "Muebles y decoración",
    defaultSampleImageUrl: "/rubros/furniture.jpg",
  },
  {
    id: "tech",
    label: "Electrónica y tecnología",
    categoryLabel: "Electrónica",
    defaultSampleImageUrl: "/rubros/tech.jpg",
  },
  {
    id: "food",
    label: "Gastronomía y café",
    categoryLabel: "Gastronomía",
    defaultSampleImageUrl: "/rubros/food.jpg",
  },
  {
    id: "beauty",
    label: "Belleza y cuidado personal",
    categoryLabel: "Belleza",
    defaultSampleImageUrl: "/rubros/beauty.jpg",
  },
  {
    id: "jewelry",
    label: "Joyería y relojería",
    categoryLabel: "Joyería",
    defaultSampleImageUrl: "/rubros/jewelry.jpg",
  },
  {
    id: "pharmacy",
    label: "Salud y farmacia",
    categoryLabel: "Farmacia y bienestar",
    defaultSampleImageUrl: "/rubros/pharmacy.jpg",
  },
  {
    id: "kids",
    label: "Infantil y juguetes",
    categoryLabel: "Infantil",
    defaultSampleImageUrl: "/rubros/kids.jpg",
  },
  {
    id: "pets",
    label: "Mascotas",
    categoryLabel: "Pet shop",
    defaultSampleImageUrl: "/rubros/pets.jpg",
  },
  {
    id: "sports",
    label: "Deportes y outdoor",
    categoryLabel: "Deportes",
    defaultSampleImageUrl: "/rubros/sports.jpg",
  },
  {
    id: "books",
    label: "Librería y papelería",
    categoryLabel: "Librería",
    defaultSampleImageUrl: "/rubros/books.jpg",
  },
  {
    id: "automotive",
    label: "Automotriz y accesorios",
    categoryLabel: "Automotriz",
    defaultSampleImageUrl: "/rubros/automotive.jpg",
  },
  {
    id: "services",
    label: "Servicios y estética",
    categoryLabel: "Servicios",
    defaultSampleImageUrl: "/rubros/services.jpg",
  },
  {
    id: "other",
    label: "Otro rubro",
    categoryLabel: "Retail general",
    defaultSampleImageUrl: "/rubros/other.jpg",
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
  if (c.includes("joyer") || c.includes("reloj")) return "jewelry";
  if (c.includes("farmac") || c.includes("salud") || c.includes("pharma")) return "pharmacy";
  if (c.includes("infant") || c.includes("juguet") || c.includes("niñ")) return "kids";
  if (c.includes("mascot") || c.includes("pet")) return "pets";
  if (c.includes("librer") || c.includes("libro") || c.includes("papel")) return "books";
  if (c.includes("automot") || c.includes("auto ")) return "automotive";
  if (c.includes("servic") || c.includes("estétic") || c.includes("estetic")) return "services";
  if (c.includes("ropa") || c.includes("moda") || c.includes("accesor")) return "fashion";
  return "other";
}
