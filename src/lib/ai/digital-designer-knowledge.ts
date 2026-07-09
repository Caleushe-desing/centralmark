/**
 * Base de conocimiento del "diseñador gráfico experto en marketing digital".
 * Se inyecta en los prompts de la IA — actúa como entrenamiento por rol y técnicas.
 */

export interface MarketingTechnique {
  id: string;
  name: string;
  whenToUse: string;
  copyHint: string;
  layoutHint: string;
}

export interface CompositionArchetype {
  id: string;
  name: string;
  description: string;
  layoutGuide: string;
}

export const DESIGNER_PERSONA = `IDENTIDAD:
Eres un diseñador gráfico senior con 12+ años en marketing digital, especializado en publicaciones Instagram/Facebook 1080×1080 para marcas en Chile.
Combinas criterio estético (tipografía, jerarquía, contraste, ritmo visual) con copywriting de performance.
Cada pieza debe verse hecha a medida por una agencia — NUNCA como plantilla genérica.

PRINCIPIOS DE DISEÑO:
- Jerarquía visual clara: 1 elemento domina, el resto apoya
- Regla de tercios y asimetría cuando aporta dinamismo
- Contraste legible sobre foto (stroke, pill, scrim mental)
- Máximo 6 capas de texto; menos es más en piezas premium
- Variar tipografías con intención (display + sans + serif)
- Paleta de marca: negro #050505, blanco #FFFFFF, verde flúor #b8ff00, amarillo #ffe600, dorado #D4AF37

PRINCIPIOS DE MARKETING:
- Un mensaje principal por pieza
- CTA con verbo de acción
- Beneficio > característica
- Ortografía impecable en español chileno`;

export const MARKETING_TECHNIQUES: MarketingTechnique[] = [
  {
    id: "aida",
    name: "AIDA",
    whenToUse: "Ofertas generales, lanzamientos",
    copyHint: "Atención (gancho) → Interés (beneficio) → Deseo (emoción) → Acción (CTA)",
    layoutHint: "Gancho grande arriba, beneficio medio, CTA abajo",
  },
  {
    id: "pas",
    name: "PAS (Problema-Agitación-Solución)",
    whenToUse: "Servicios, soluciones, B2B",
    copyHint: "Nombra el dolor, intensifica, presenta tu producto como solución",
    layoutHint: "Problema texto pequeño arriba, solución grande al centro",
  },
  {
    id: "scarcity",
    name: "Escasez / Urgencia",
    whenToUse: "Promos, stock limitado, fechas",
    copyHint: "Solo hoy, últimas unidades, hasta agotar stock — sin inventar fechas falsas",
    layoutHint: "Badge o pill de urgencia en esquina superior derecha",
  },
  {
    id: "social_proof",
    name: "Prueba social",
    whenToUse: "Productos con demanda, bestsellers",
    copyHint: "Más vendido, favorito de clientes, +500 vendidos — solo si es creíble",
    layoutHint: "Franja o pill secundaria con dato social",
  },
  {
    id: "usp",
    name: "Propuesta única (USP)",
    whenToUse: "Artesanal, premium, diferenciación",
    copyHint: "Qué te hace único en una frase memorable",
    layoutHint: "Titular emocional + subtítulo elegante, mucho aire",
  },
  {
    id: "price_anchor",
    name: "Anclaje de precio",
    whenToUse: "Cuando hay precio o % real",
    copyHint: "Destaca el precio o descuento como ancla visual",
    layoutHint: "Número grande (badge) + contexto pequeño al lado",
  },
  {
    id: "story_micro",
    name: "Micro-storytelling",
    whenToUse: "Artesanal, handmade, marca personal",
    copyHint: "Narrativa de 1 frase que evoca origen, proceso o pasión",
    layoutHint: "Serif italic para emoción, sans para datos",
  },
  {
    id: "bundle",
    name: "Valor agregado",
    whenToUse: "2x1, envío gratis, regalo incluido",
    copyHint: "Destaca el extra que recibe el cliente",
    layoutHint: "Segundo mensaje en pill contrastante",
  },
  {
    id: "authority",
    name: "Autoridad / Expertise",
    whenToUse: "Servicios profesionales, tecnología",
    copyHint: "Tono confiable, resultados, años de experiencia",
    layoutHint: "Alineación izquierda, tipografía limpia, menos gritos",
  },
  {
    id: "curiosity",
    name: "Curiosidad / Open loop",
    whenToUse: "Lanzamientos, novedades",
    copyHint: "Genera intriga sin clickbait barato",
    layoutHint: "Pregunta o frase incompleta como gancho",
  },
];

export const COMPOSITION_ARCHETYPES: CompositionArchetype[] = [
  {
    id: "z_pattern",
    name: "Patrón Z",
    description: "Ojo recorre en Z: arriba izq → arriba der → abajo izq → CTA abajo der",
    layoutGuide: "Headline x:12-20 y:12; badge x:78-88 y:14; beneficio x:15 y:55; CTA x:75-85 y:88",
  },
  {
    id: "f_left",
    name: "Patrón F izquierdo",
    description: "Bloque editorial alineado a la izquierda",
    layoutGuide: "Todo align left, x:10-18, titular grande y:14, subtítulo y:26, CTA y:90",
  },
  {
    id: "hero_center",
    name: "Hero centrado",
    description: "Impacto central tipo póster",
    layoutGuide: "Centro x:50, titular y:35-42 fontSize 70+, soporte y:55, CTA y:88",
  },
  {
    id: "lower_third",
    name: "Tercio inferior revista",
    description: "Imagen respira arriba, mensaje abajo",
    layoutGuide: "Textos concentrados y:68-92, titular más grande en y:72",
  },
  {
    id: "upper_third",
    name: "Tercio superior",
    description: "Mensaje arriba, producto visible abajo",
    layoutGuide: "Capas en y:10-35, CTA opcional abajo y:90",
  },
  {
    id: "diagonal_energy",
    name: "Energía diagonal",
    description: "Un elemento con rotation -4° a -6° para dinamismo",
    layoutGuide: "Titular con rotation -5, resto recto; no exagerar",
  },
  {
    id: "luxury_minimal",
    name: "Lujo minimal",
    description: "Pocas palabras, mucho espacio, serif + dorado",
    layoutGuide: "Solo 3-4 capas, fontSize moderado, playfair, y espaciados 12%+",
  },
  {
    id: "promo_bold",
    name: "Promo bold",
    description: "Alto impacto retail, números grandes",
    layoutGuide: "Display font 80+, badge % esquina, CTA pill neón abajo",
  },
  {
    id: "split_asymmetric",
    name: "Asimetría 70/30",
    description: "Mensaje ocupa un lado, el otro queda para la foto",
    layoutGuide: "Bloque principal x:15-25 o x:75-85 según brief",
  },
  {
    id: "stacked_center",
    name: "Stack centrado",
    description: "Pila vertical centrada pero con tamaños muy distintos",
    layoutGuide: "x:50, variar fontSize entre capas 3x, gaps Y de 10%+",
  },
  {
    id: "corner_anchor",
    name: "Ancla esquina",
    description: "Titular en esquina inferior izquierda estilo editorial",
    layoutGuide: "align left, x:12, y:78-88, titular + CTA juntos abajo",
  },
  {
    id: "ribbon_accent",
    name: "Franja de acento",
    description: "Una pill horizontal ancha como elemento gráfico",
    layoutGuide: "Pill ancho con beneficio en y:48, titular arriba, CTA abajo",
  },
];

export interface CreativeDirection {
  technique: MarketingTechnique;
  composition: CompositionArchetype;
  variationSeed: number;
  tone: string;
  avoidPatterns: string[];
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickIndex<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

/** Elige técnica + composición variada según brief (no siempre lo mismo) */
export function pickCreativeDirection(
  brief: string,
  options?: { discountPercent?: number | null; productName?: string }
): CreativeDirection {
  const timeSlot = Math.floor(Date.now() / (1000 * 60 * 30)); // cambia cada 30 min
  const seed =
    hashString(brief) ^
    hashString(options?.productName ?? "") ^
    timeSlot ^
    Math.floor(Math.random() * 10000);

  let techniquePool = [...MARKETING_TECHNIQUES];

  const b = brief.toLowerCase();
  if (options?.discountPercent != null || /descuento|outlet|%\s*off|promo/i.test(b)) {
    techniquePool = techniquePool.filter((t) =>
      ["scarcity", "price_anchor", "aida", "bundle"].includes(t.id)
    );
  } else if (/artesan|hecho a mano|premium|único|unico|ajedrez|taller/i.test(b)) {
    techniquePool = techniquePool.filter((t) =>
      ["usp", "story_micro", "aida", "social_proof"].includes(t.id)
    );
  } else if (/servicio|web|software|consultor/i.test(b)) {
    techniquePool = techniquePool.filter((t) =>
      ["pas", "authority", "aida", "curiosity"].includes(t.id)
    );
  }

  if (techniquePool.length === 0) techniquePool = MARKETING_TECHNIQUES;

  let compositionPool = [...COMPOSITION_ARCHETYPES];
  if (options?.discountPercent != null) {
    compositionPool = compositionPool.filter((c) =>
      ["promo_bold", "z_pattern", "diagonal_energy", "upper_third"].includes(c.id)
    );
  } else if (/artesan|premium|lujo/i.test(b)) {
    compositionPool = compositionPool.filter((c) =>
      ["luxury_minimal", "f_left", "lower_third", "corner_anchor"].includes(c.id)
    );
  }

  const technique = pickIndex(techniquePool, seed);
  const composition = pickIndex(
    compositionPool.filter((c) => c.id !== technique.id),
    seed,
    3
  );

  const tones = [
    "cercano y confiable",
    "premium y sobrio",
    "energético y directo",
    "emocional y aspiracional",
    "urgente pero elegante",
  ];

  return {
    technique,
    composition,
    variationSeed: seed % 1000,
    tone: pickIndex(tones, seed, 7),
    avoidPatterns: [
      "No centres todo en x:50 con la misma pila vertical",
      "No uses siempre bebas + pill neón abajo",
      "No repitas la estructura titular-badge-3 bullets-CTA",
      `Esta pieza usa composición "${composition.name}" — respétala`,
    ],
  };
}

export function buildDesignBriefPrompt(direction: CreativeDirection): string {
  return `${DESIGNER_PERSONA}

═══ DIRECCIÓN CREATIVA (OBLIGATORIA PARA ESTA PIEZA) ═══
Técnica de marketing: ${direction.technique.name}
→ ${direction.technique.copyHint}
→ Layout: ${direction.technique.layoutHint}

Composición visual: ${direction.composition.name}
→ ${direction.composition.description}
→ Guía de posiciones: ${direction.composition.layoutGuide}

Tono: ${direction.tone}
Semilla de variación: ${direction.variationSeed}

EVITAR en esta pieza:
${direction.avoidPatterns.map((p) => `- ${p}`).join("\n")}`;
}

export const LAYER_JSON_SCHEMA = `Devuelve JSON con SOLO los textos (el estilo visual lo aplica el sistema automáticamente):
{
  "composition": "nombre corto de tu concepto",
  "marketingTechnique": "técnica aplicada",
  "layers": [
    { "text": "gancho corto 3-5 palabras", "x": 50, "y": 14, "fontSize": 24, "fontFamily": "oswald", "color": "#fff", "variant": "text" },
    { "text": "titular producto", "x": 50, "y": 34, "fontSize": 64, "fontFamily": "bebas", "color": "#fff", "variant": "text" },
    { "text": "beneficio clave", "x": 50, "y": 54, "fontSize": 24, "fontFamily": "montserrat", "color": "#fff", "variant": "text" },
    { "text": "CTA verbo", "x": 50, "y": 88, "fontSize": 26, "fontFamily": "oswald", "color": "#050505", "variant": "pill" }
  ]
}

REGLAS DE COPY (lo importante es el TEXTO, no el diseño):
- Exactamente 3 o 4 capas
- Gancho: pregunta o frase de impacto, máx 28 caracteres
- Titular: nombre del producto/servicio, máx 26 caracteres
- Beneficio: una frase de valor, máx 38 caracteres
- CTA: verbo + acción, máx 18 caracteres (ej. "Solicita demo", "Cotiza hoy")
- Sin emojis, español chileno impecable
- NO párrafos largos, NO saltos de línea`;
