import type { VisualTemplate } from "@/lib/templates";

export function inferTemplateFromText(text: string): string {
  const t = text.toLowerCase();
  if (/luxury|elegante|premium|oro|gold/.test(t)) return "luxury";
  if (/deport|sport|atlet|gym|nike|adidas/.test(t)) return "sport";
  if (/natural|fresco|green|org[aá]nic|comida|gastronom/.test(t)) return "nature";
  if (/neon|nocturn|urban|cyber|noche/.test(t)) return "neon";
  if (/c[aá]lid|sunset|warm|acogedor/.test(t)) return "sunset";
  if (/ocean|mar|azul|fresco|confiable/.test(t)) return "ocean";
  if (/minimal|limpio|clean|blanco/.test(t)) return "minimal-white";
  if (/retro|pop|80s|vintage/.test(t)) return "retro";
  if (/tech|futur|digital|hologram/.test(t)) return "tech";
  if (/urgente|flash|rapido|r[aá]pido|oferta/.test(t)) return "flash-sale";
  return "flash-sale";
}

export function buildImagePromptFromUserText(opts: {
  aiBrief?: string | null;
  description?: string | null;
  productName: string;
  discountPercent: number;
  storeName: string;
  backgroundPrompt?: string;
  template: VisualTemplate;
}): string {
  const userText = [opts.aiBrief, opts.description].filter(Boolean).join(". ");
  const base = opts.backgroundPrompt || "";

  return [
    `Professional social media marketing visual for retail promotion.`,
    `Product/offer: ${opts.productName}, ${opts.discountPercent}% discount.`,
    `Store: ${opts.storeName}.`,
    userText ? `Client creative brief (follow closely): ${userText}` : "",
    base ? `Visual direction: ${base}` : "",
    `${opts.template.backgroundStyle}. ${opts.template.dynamicHint}.`,
    `Dynamic, eye-catching, Instagram-ready square composition.`,
    `No promotional text overlay, no watermarks. Show product brands authentically when the client mentions them.`,
  ]
    .filter(Boolean)
    .join(" ");
}
