export type DepartmentProduct = {
  id: string;
  label: string;
  group: string;
};

/** Catálogo típico de tiendas departamentales — selección multi por click */
export const DEPARTMENT_PRODUCTS: DepartmentProduct[] = [
  // Moda
  { id: "ropa-mujer", label: "Ropa mujer", group: "Moda" },
  { id: "ropa-hombre", label: "Ropa hombre", group: "Moda" },
  { id: "ropa-infantil", label: "Ropa infantil", group: "Moda" },
  { id: "ropa-deportiva", label: "Ropa deportiva", group: "Moda" },
  { id: "underwear", label: "Ropa interior", group: "Moda" },
  { id: "trajes", label: "Trajes y vestidos formales", group: "Moda" },
  { id: "swimwear", label: "Trajes de baño", group: "Moda" },
  { id: "abrigos", label: "Abrigos y chaquetas", group: "Moda" },
  // Calzado y accesorios
  { id: "calzado-mujer", label: "Calzado mujer", group: "Calzado y accesorios" },
  { id: "calzado-hombre", label: "Calzado hombre", group: "Calzado y accesorios" },
  { id: "zapatillas", label: "Zapatillas deportivas", group: "Calzado y accesorios" },
  { id: "bolsos", label: "Bolsos y carteras", group: "Calzado y accesorios" },
  { id: "mochilas", label: "Mochilas", group: "Calzado y accesorios" },
  { id: "cinturones", label: "Cinturones", group: "Calzado y accesorios" },
  { id: "bufandas", label: "Bufandas y gorros", group: "Calzado y accesorios" },
  { id: "gafas", label: "Gafas de sol", group: "Calzado y accesorios" },
  // Belleza
  { id: "cosmeticos", label: "Cosméticos", group: "Belleza" },
  { id: "maquillaje", label: "Maquillaje", group: "Belleza" },
  { id: "perfumeria", label: "Perfumería", group: "Belleza" },
  { id: "skincare", label: "Cuidado de la piel", group: "Belleza" },
  { id: "cabello", label: "Cuidado del cabello", group: "Belleza" },
  { id: "dermocosmetica", label: "Dermocosmética", group: "Belleza" },
  // Tecnología
  { id: "celulares", label: "Celulares", group: "Tecnología" },
  { id: "tablets", label: "Tablets", group: "Tecnología" },
  { id: "notebooks", label: "Notebooks y PCs", group: "Tecnología" },
  { id: "audio", label: "Audio y audífonos", group: "Tecnología" },
  { id: "tvs", label: "Televisores", group: "Tecnología" },
  { id: "gaming", label: "Gaming y consolas", group: "Tecnología" },
  { id: "wearables", label: "Smartwatches y wearables", group: "Tecnología" },
  { id: "accesorios-tech", label: "Accesorios tech", group: "Tecnología" },
  // Hogar
  { id: "muebles", label: "Muebles", group: "Hogar" },
  { id: "decoracion", label: "Decoración", group: "Hogar" },
  { id: "cocina", label: "Cocina y menaje", group: "Hogar" },
  { id: "electrodomesticos", label: "Electrodomésticos", group: "Hogar" },
  { id: "blancos", label: "Blancos y ropa de cama", group: "Hogar" },
  { id: "bano", label: "Baño", group: "Hogar" },
  { id: "iluminacion", label: "Iluminación", group: "Hogar" },
  { id: "organizacion", label: "Organización del hogar", group: "Hogar" },
  // Deportes y ocio
  { id: "deportes", label: "Artículos deportivos", group: "Deportes y ocio" },
  { id: "camping", label: "Camping y outdoor", group: "Deportes y ocio" },
  { id: "bicicletas", label: "Bicicletas", group: "Deportes y ocio" },
  { id: "juguetes", label: "Juguetes", group: "Deportes y ocio" },
  { id: "juegos-mesa", label: "Juegos de mesa", group: "Deportes y ocio" },
  // Infantil
  { id: "bebe", label: "Bebé (ropa y cuidado)", group: "Infantil" },
  { id: "cochecitos", label: "Cochecitos y sillas", group: "Infantil" },
  { id: "escolar", label: "Útiles escolares", group: "Infantil" },
  // Joyería y relojería
  { id: "joyeria", label: "Joyería", group: "Joyería y relojería" },
  { id: "relojes", label: "Relojería", group: "Joyería y relojería" },
  { id: "bijouterie", label: "Bijouterie", group: "Joyería y relojería" },
  // Otros departamentos
  { id: "optica", label: "Óptica", group: "Otros departamentos" },
  { id: "libreria", label: "Librería", group: "Otros departamentos" },
  { id: "papeleria", label: "Papelería", group: "Otros departamentos" },
  { id: "gourmet", label: "Gourmet y delicatessen", group: "Otros departamentos" },
  { id: "vinos", label: "Vinos y licores", group: "Otros departamentos" },
  { id: "mascotas", label: "Mascotas", group: "Otros departamentos" },
  { id: "farmacia", label: "Farmacia / wellness", group: "Otros departamentos" },
  { id: "viajes", label: "Equipaje y viajes", group: "Otros departamentos" },
  { id: "automotor", label: "Accesorios automotor", group: "Otros departamentos" },
  { id: "jardin", label: "Jardín y terraza", group: "Otros departamentos" },
];

export function groupDepartmentProducts() {
  const map = new Map<string, DepartmentProduct[]>();
  for (const p of DEPARTMENT_PRODUCTS) {
    const list = map.get(p.group) ?? [];
    list.push(p);
    map.set(p.group, list);
  }
  return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
}

export function resolveSoldProductLabels(
  idsJson: string | null | undefined,
  other?: string | null
): string[] {
  let ids: string[] = [];
  try {
    const parsed = JSON.parse(idsJson ?? "[]") as unknown;
    if (Array.isArray(parsed)) ids = parsed.filter((x): x is string => typeof x === "string");
  } catch {
    ids = [];
  }
  const labels = ids
    .map((id) => DEPARTMENT_PRODUCTS.find((p) => p.id === id)?.label)
    .filter((x): x is string => Boolean(x));
  const extras = (other ?? "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...labels, ...extras];
}
