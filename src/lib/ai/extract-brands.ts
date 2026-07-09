/** Marcas frecuentes en retail — se detectan en el brief del cliente */
const KNOWN_BRANDS = [
  "adidas",
  "nike",
  "puma",
  "reebok",
  "new balance",
  "converse",
  "vans",
  "jordan",
  "under armour",
  "asics",
  "samsung",
  "apple",
  "iphone",
  "xiaomi",
  "huawei",
  "motorola",
  "sony",
  "lg",
  "hp",
  "dell",
  "lenovo",
  "playstation",
  "xbox",
  "nintendo",
  "gucci",
  "zara",
  "h&m",
  "levis",
  "lacoste",
  "tommy hilfiger",
  "calvin klein",
] as const;

function titleCase(phrase: string): string {
  return phrase
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Extrae marcas mencionadas en el texto del cliente (ej. "zapatillas adidas" → ["Adidas"]) */
export function extractBrandsFromBrief(text: string): string[] {
  const lower = text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const found: string[] = [];

  for (const brand of KNOWN_BRANDS) {
    const pattern = brand.replace(/&/g, "&").replace(/\s+/g, "\\s+");
    if (new RegExp(`\\b${pattern}\\b`, "i").test(lower)) {
      found.push(titleCase(brand));
    }
  }

  return [...new Set(found)];
}

export function buildBrandPromptBlock(brands: string[]): string {
  if (brands.length === 0) return "";

  const list = brands.join(", ");
  return [
    `MANDATORY PRODUCT BRANDS: ${list}.`,
    `Each brand MUST appear with its official logo AND the brand name written legibly on products and/or promotional graphics.`,
    `Use correct brand typography (e.g. adidas wordmark with three stripes, Nike swoosh, Samsung wordmark).`,
    `NEVER invent fake brand names (no made-up names like "Mizo" or gibberish).`,
    `Do NOT place a fake retailer logo at the bottom — merchant store logo is added separately in the top-right corner.`,
  ].join(" ");
}
