export interface VisualTemplate {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  layout: "bottom-bar" | "center-bold" | "diagonal" | "minimal" | "split";
  mood: string;
  backgroundStyle: string;
  dynamicHint: string;
}

export const VISUAL_TEMPLATES: VisualTemplate[] = [
  {
    id: "flash-sale",
    name: "Flash Sale",
    description: "Urgencia y energía, ideal para ofertas relámpago",
    primaryColor: "#E11D48",
    secondaryColor: "#1E1B4B",
    accentColor: "#FBBF24",
    layout: "bottom-bar",
    mood: "urgente",
    backgroundStyle: "dynamic motion blur streaks, vibrant retail energy, dramatic lighting",
    dynamicHint: "sense of movement and speed, kinetic energy",
  },
  {
    id: "luxury",
    name: "Luxury Gold",
    description: "Elegante y premium",
    primaryColor: "#B8860B",
    secondaryColor: "#0F0F0F",
    accentColor: "#F5E6C8",
    layout: "minimal",
    mood: "premium",
    backgroundStyle: "luxury boutique atmosphere, gold accents, soft spotlight, marble textures",
    dynamicHint: "subtle elegant shimmer, refined motion",
  },
  {
    id: "sport",
    name: "Sport Power",
    description: "Deportivo y dinámico",
    primaryColor: "#2563EB",
    secondaryColor: "#0F172A",
    accentColor: "#22D3EE",
    layout: "diagonal",
    mood: "deportivo",
    backgroundStyle: "athletic stadium energy, dynamic angles, electric blue tones",
    dynamicHint: " explosive athletic motion, speed lines",
  },
  {
    id: "nature",
    name: "Fresh Green",
    description: "Natural y fresco, ideal para gastronomía",
    primaryColor: "#16A34A",
    secondaryColor: "#14532D",
    accentColor: "#BBF7D0",
    layout: "center-bold",
    mood: "fresco",
    backgroundStyle: "fresh organic textures, natural light, green botanical mood",
    dynamicHint: "gentle floating leaves, organic flow",
  },
  {
    id: "neon",
    name: "Neon Night",
    description: "Urbano nocturno con neón",
    primaryColor: "#A855F7",
    secondaryColor: "#0B0014",
    accentColor: "#F0ABFC",
    layout: "split",
    mood: "urbano",
    backgroundStyle: "neon city night, cyberpunk retail glow, purple and pink lights",
    dynamicHint: "pulsing neon glow, urban night energy",
  },
  {
    id: "sunset",
    name: "Sunset Warm",
    description: "Cálido y acogedor",
    primaryColor: "#EA580C",
    secondaryColor: "#431407",
    accentColor: "#FED7AA",
    layout: "bottom-bar",
    mood: "cálido",
    backgroundStyle: "warm sunset gradient, cozy shopping atmosphere, orange and coral tones",
    dynamicHint: "warm flowing gradient motion",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Fresco y confiable",
    primaryColor: "#0284C7",
    secondaryColor: "#0C4A6E",
    accentColor: "#7DD3FC",
    layout: "minimal",
    mood: "confiable",
    backgroundStyle: "ocean wave abstract, clean blue corporate retail, airy and fresh",
    dynamicHint: "flowing wave motion, fluid dynamics",
  },
  {
    id: "minimal-white",
    name: "Minimal Clean",
    description: "Limpio y moderno",
    primaryColor: "#18181B",
    secondaryColor: "#FAFAFA",
    accentColor: "#E11D48",
    layout: "minimal",
    mood: "moderno",
    backgroundStyle: "clean white studio, minimal Scandinavian retail design, soft shadows",
    dynamicHint: "subtle floating geometric shapes",
  },
  {
    id: "retro",
    name: "Retro Pop",
    description: "Vintage pop art",
    primaryColor: "#DB2777",
    secondaryColor: "#FDE68A",
    accentColor: "#1D4ED8",
    layout: "center-bold",
    mood: "retro",
    backgroundStyle: "retro pop art halftone, 80s mall aesthetic, bold comic style background",
    dynamicHint: "pop art burst motion, comic energy",
  },
  {
    id: "tech",
    name: "Tech Future",
    description: "Tecnología futurista",
    primaryColor: "#06B6D4",
    secondaryColor: "#0F172A",
    accentColor: "#34D399",
    layout: "diagonal",
    mood: "tech",
    backgroundStyle: "futuristic tech grid, holographic retail display, digital particles",
    dynamicHint: "digital particle flow, holographic motion",
  },
];

export function getTemplate(id: string): VisualTemplate {
  return VISUAL_TEMPLATES.find((t) => t.id === id) ?? VISUAL_TEMPLATES[0];
}

export function buildHashtags(
  mallFixed: string,
  storeCustom?: string | null,
  offerCustom?: string | null
): string {
  const parts = [mallFixed, storeCustom, offerCustom].filter(Boolean);
  return [...new Set(parts.join(" ").split(/\s+/))].join(" ").trim();
}
