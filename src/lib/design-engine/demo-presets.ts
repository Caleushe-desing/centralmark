/**
 * Presets estáticos de modo demo — no consumen OpenAI ni DB.
 * Copy e imágenes reales; la composición usa los layoutId del AdEngine actual.
 */

export interface DemoPreset {
  id: string;
  category: string;
  keywords: string[];
  userBriefExample: string;
  /** Diseño simulado idéntico a lo que devolvería el orquestador (vista Demo). */
  design: {
    category: string;
    layoutId: string;
    visualConcept: {
      imagePrompt: string;
      /** Imagen premium local (/public/rubros) — CORS estable para export PNG. */
      imageUrl: string;
    };
    textOnImage: {
      productName: string;
      badge: string;
      hook: string;
      subtext: string;
      cta: string;
    };
    textExternal: {
      caption: string;
    };
  };
}

/** Chips de sugerencia rápida en el formulario demo (orden de UI). */
export const DEMO_SUGGESTION_CHIPS: { presetId: string; label: string }[] = [
  { presetId: "zapatillas", label: "👟 Probar con Zapatillas" },
  { presetId: "cafe", label: "☕ Probar con Café" },
  { presetId: "audifonos", label: "🎧 Probar con Audífonos" },
];

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "zapatillas",
    category: "streetwear",
    keywords: [
      "zapatilla",
      "tenis",
      "zapato",
      "calzado",
      "run",
      "sport",
      "sneaker",
      "hyper",
      "shock",
      "liquidacion",
      "street",
    ],
    userBriefExample:
      "Zapatillas Hyper Shock. 40% de descuento por liquidación. Compra hoy mismo antes de que se agoten.",
    design: {
      category: "STREET HEAT",
      layoutId: "drop-grid-break",
      visualConcept: {
        imagePrompt:
          "Premium urban sneakers floating on a minimalist dark concrete background, dramatic studio lighting, neon yellow accents",
        imageUrl: "/rubros/footwear.jpg",
      },
      textOnImage: {
        productName: "HYPER SHOCK",
        // drop-grid-break: el % va en subtext, no en badge ni hook
        badge: "NUEVO DROP",
        hook: "HYPER SHOCK",
        subtext: "-40% DTO",
        cta: "COMPRA HOY",
      },
      textExternal: {
        caption:
          "¡Estilo sin límites! Llévate hoy tus Hyper Shock con un 40% de descuento exclusivo. Unidades limitadas en tienda. No te quedes fuera.",
      },
    },
  },
  {
    id: "audifonos",
    category: "tech",
    keywords: [
      "audifono",
      "audífono",
      "auricular",
      "headphone",
      "headset",
      "sony",
      "noise",
      "cancelacion",
      "cancelación",
      "bluetooth",
      "musica",
      "música",
      "audio",
    ],
    userBriefExample:
      "Audífonos Noise Cancel Pro. Silencio de estudio, batería de 40 horas. Lánzalos con 25% off este fin de semana.",
    design: {
      category: "TECH PULSE",
      layoutId: "spotlight-hero-void",
      visualConcept: {
        imagePrompt:
          "Matte black over-ear headphones floating in dramatic softbox light, deep charcoal void, premium consumer electronics hero",
        imageUrl: "/rubros/tech.jpg",
      },
      textOnImage: {
        productName: "NOISE CANCEL PRO",
        badge: "EDICIÓN LIMITADA",
        hook: "NOISE CANCEL PRO",
        subtext: "25% OFF · 40H batería",
        cta: "RESERVA YA",
      },
      textExternal: {
        caption:
          "Escucha sin interrupciones. Noise Cancel Pro con 25% off solo este fin de semana. Reserva en tienda antes de que se agoten.",
      },
    },
  },
  {
    id: "cafe",
    category: "food",
    keywords: [
      "cafe",
      "café",
      "coffee",
      "espresso",
      "latte",
      "cafeteria",
      "cafetería",
      "grano",
      "tostado",
      "brunch",
      "barista",
      "origen",
    ],
    userBriefExample:
      "Café Origen Andes. Blend de altura tostado artesanal. 2x1 en bebidas de especialidad de 15:00 a 18:00.",
    design: {
      category: "CAFÉ ORIGEN",
      layoutId: "promo-harmonic-block",
      visualConcept: {
        imagePrompt:
          "Artisan latte art in ceramic cup on warm oak table, soft morning window light, intimate specialty coffee atmosphere",
        imageUrl: "/rubros/food.jpg",
      },
      textOnImage: {
        productName: "ORIGEN ANDES",
        badge: "HORARIO GOLD",
        hook: "2x1 ESPECIALIDAD",
        // promo-harmonic-block acorta subtext ~10 chars en shape
        subtext: "15–18 hrs",
        cta: "PIDE EL TUYO",
      },
      textExternal: {
        caption:
          "Tu pausa de la tarde merece más. 2x1 en bebidas de especialidad de 15:00 a 18:00. Origen Andes, tostado artesanal.",
      },
    },
  },
];

/** Normaliza texto para matching de keywords (sin tildes). */
function normalizeForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function scoreDemoPreset(normalizedBrief: string, preset: DemoPreset): number {
  let score = 0;
  for (const keyword of preset.keywords) {
    if (normalizedBrief.includes(normalizeForMatch(keyword))) score += 1;
  }
  if (normalizedBrief.includes(normalizeForMatch(preset.id))) score += 2;
  if (
    normalizedBrief.includes(normalizeForMatch(preset.design.textOnImage.productName))
  ) {
    score += 3;
  }
  return score;
}

/** True si el brief toca al menos una keyword/id/producto de los presets demo. */
export function hasDemoKeywordMatch(brief: string): boolean {
  const normalized = normalizeForMatch(brief.trim());
  if (!normalized) return false;
  return DEMO_PRESETS.some((preset) => scoreDemoPreset(normalized, preset) > 0);
}

/**
 * Elige el preset más cercano al brief del usuario.
 * Prioridad: keyword hits → fallback por índice estable del brief.
 */
export function matchDemoPreset(brief: string): DemoPreset {
  const normalized = normalizeForMatch(brief.trim());
  if (!normalized) return DEMO_PRESETS[0]!;

  let best: DemoPreset = DEMO_PRESETS[0]!;
  let bestScore = 0;

  for (const preset of DEMO_PRESETS) {
    const score = scoreDemoPreset(normalized, preset);
    if (score > bestScore) {
      bestScore = score;
      best = preset;
    }
  }

  if (bestScore > 0) return best;

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash + normalized.charCodeAt(i) * (i + 1)) % 997;
  }
  return DEMO_PRESETS[hash % DEMO_PRESETS.length]!;
}

export function getDemoPresetById(id: string): DemoPreset | undefined {
  return DEMO_PRESETS.find((p) => p.id === id);
}
