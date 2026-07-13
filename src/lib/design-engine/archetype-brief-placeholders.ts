import type { VisualArchetype } from "./archetypes";

/** Ejemplos de brief por arquetipo: [Producto] + [Gancho] + [Urgencia/CTA] */
export const ARCHETYPE_BRIEF_PLACEHOLDERS: Record<VisualArchetype, string> = {
  drop: "Ej: Audífonos Pro Inalámbricos Black Edition. 30% de descuento exclusivo. Unidades limitadas hasta agotar stock.",
  spotlight:
    "Ej: Reloj Inteligente Series X. El futuro en tu muñeca. Consíguelo hoy con envío gratis.",
  editorial:
    "Ej: Nueva Colección de Abrigos de Lana. Diseñados para el invierno urbano. Disponible ahora en la tienda central.",
  promo:
    "Ej: Liquidación de Temporada. Todo el calzado con 50% de descuento. Solo por este fin de semana.",
};

export const BRIEF_STRUCTURE_HINT =
  "Estructura recomendada para resultados premium: [Producto] + [Descuento/Gancho] + [Urgencia]. Separa las frases con puntos.";

export function archetypeBriefPlaceholder(archetype: VisualArchetype): string {
  return ARCHETYPE_BRIEF_PLACEHOLDERS[archetype];
}
