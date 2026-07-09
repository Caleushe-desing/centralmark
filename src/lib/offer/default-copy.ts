export function buildDefaultCaption(params: {
  productName?: string;
  discountPercent?: number;
  storeName: string;
  mallName: string;
}): string {
  const lines: string[] = [];

  if (params.discountPercent && params.discountPercent > 0) {
    lines.push(`🔥 ${params.discountPercent}% OFF`);
  }
  if (params.productName) {
    lines.push(params.productName);
  }
  lines.push(`📍 ${params.storeName} — ${params.mallName}`);

  return lines.join("\n").trim();
}

export function buildDefaultHashtags(
  storeHashtags?: string | null,
  productName?: string
): string {
  const productTag = productName
    ? `#${productName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 24)}`
    : "";

  const tags = [storeHashtags, productTag, "#Ofertas", "#Promo"]
    .filter(Boolean)
    .join(" ")
    .split(/\s+/)
    .filter((t) => t.startsWith("#"));

  return [...new Set(tags)].join(" ");
}
