/**
 * Reglas de composición del Design Engine — arquetipos visuales.
 * @see ./archetype-layouts.ts
 */
export * from "./archetype-layouts";

/** Reglas explícitas por arquetipo (motor + prompts) */
export const ARCHETYPE_COMPOSITION_RULES = {
  drop: "Sans-serif ultra-bold masivo, alto contraste, cajas tipográficas que rompen la grilla de la imagen.",
  spotlight:
    "Mucho espacio negativo, tipografías ultraligeras y limpias, acentos en hairlines milimétricas.",
  editorial:
    "Tipografías Serif elegantes combinadas con itálicas, composición tipo portada de revista de alta costura.",
  promo:
    "Enfoque comercial limpio, números de porcentaje destacados pero integrados armónicamente, bloques de color curados.",
} as const;
