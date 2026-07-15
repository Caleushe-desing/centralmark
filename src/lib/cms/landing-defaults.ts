export type CmsFieldType = "text" | "textarea" | "image" | "json";

export type LandingFieldDef = {
  key: string;
  type: CmsFieldType;
  label: string;
  section: string;
  sectionLabel: string;
  value: string;
  sortOrder: number;
};

/** Valores por defecto de la landing — también seed del CMS */
export const LANDING_FIELD_DEFS: LandingFieldDef[] = [
  // ——— Hero ———
  {
    key: "hero.eyebrow",
    type: "text",
    label: "Etiqueta superior",
    section: "hero",
    sectionLabel: "1. Hero (primera pantalla)",
    value: "Centro de Marketing Inteligente",
    sortOrder: 10,
  },
  {
    key: "hero.headline",
    type: "textarea",
    label: "Titular principal",
    section: "hero",
    sectionLabel: "1. Hero (primera pantalla)",
    value: "CentralMark: marketing del mall en segundos",
    sortOrder: 20,
  },
  {
    key: "hero.subtitle",
    type: "textarea",
    label: "Subtítulo",
    section: "hero",
    sectionLabel: "1. Hero (primera pantalla)",
    value:
      "La plataforma que conecta a la administración del centro comercial con cada tienda. Generá publicaciones con IA, coordiná campañas y medí resultados desde un solo lugar.",
    sortOrder: 30,
  },
  {
    key: "hero.ctaPrimary",
    type: "text",
    label: "Botón principal",
    section: "hero",
    sectionLabel: "1. Hero (primera pantalla)",
    value: "Conseguir una demo",
    sortOrder: 40,
  },
  {
    key: "hero.image",
    type: "image",
    label: "Imagen hero",
    section: "hero",
    sectionLabel: "1. Hero (primera pantalla)",
    value: "/landing/hero-command-center.png",
    sortOrder: 60,
  },
  {
    key: "hero.imageAlt",
    type: "text",
    label: "Texto alternativo de la imagen",
    section: "hero",
    sectionLabel: "1. Hero (primera pantalla)",
    value: "Centro de comando de marketing inteligente para centros comerciales",
    sortOrder: 70,
  },

  // ——— Pillars ———
  {
    key: "pillars.title",
    type: "textarea",
    label: "Título de la sección",
    section: "pillars",
    sectionLabel: "2. Pilares de valor",
    value: "Más que publicar: coordinar el marketing de todo el centro comercial",
    sortOrder: 100,
  },
  {
    key: "pillars.subtitle",
    type: "textarea",
    label: "Subtítulo",
    section: "pillars",
    sectionLabel: "2. Pilares de valor",
    value:
      "La IA es fácil de conseguir. Lo difícil es coordinar el marketing de un mall completo. Esa integración es lo que hace destacar a CentralMark.",
    sortOrder: 110,
  },
  {
    key: "pillars.items",
    type: "json",
    label: "Pilares (JSON: title, description)",
    section: "pillars",
    sectionLabel: "2. Pilares de valor",
    value: JSON.stringify(
      [
        {
          title: "Estrategia centralizada",
          description:
            "La administración del mall define la línea general, calendario y prioridades de marketing desde un solo panel.",
        },
        {
          title: "Identidad por tienda",
          description:
            "Cada local mantiene su logo, colores, tono de comunicación y redes sociales, respetando su marca propia.",
        },
        {
          title: "Contenido generado por IA",
          description:
            "Publicaciones, historias, correos y piezas visuales creadas automáticamente a partir de instrucciones simples.",
        },
        {
          title: "Publicación coordinada",
          description:
            "El sistema distribuye contenido en redes, vitrinas digitales y canales del mall con trazabilidad completa.",
        },
      ],
      null,
      2
    ),
    sortOrder: 120,
  },

  // ——— How it works (image gallery) ———
  {
    key: "howto.title",
    type: "textarea",
    label: "Título",
    section: "howto",
    sectionLabel: "3. Cómo funciona (con imágenes)",
    value: "Así se usa CentralMark en el día a día",
    sortOrder: 200,
  },
  {
    key: "howto.subtitle",
    type: "textarea",
    label: "Subtítulo",
    section: "howto",
    sectionLabel: "3. Cómo funciona (con imágenes)",
    value:
      "Desde que la tienda describe una promoción hasta que el mall la aprueba y aparece en vitrina: todo el flujo, visualizado.",
    sortOrder: 210,
  },
  {
    key: "howto.steps",
    type: "json",
    label: "Pasos + sección independiente (JSON). Los primeros 3 llevan “Paso N”; el 4º en adelante se muestra como sección propia sin número.",
    section: "howto",
    sectionLabel: "3. Cómo funciona (con imágenes)",
    value: JSON.stringify(
      [
        {
          title: "La tienda crea en segundos",
          description:
            "Escribí una instrucción en lenguaje natural o subí una foto. CentralMark genera la pieza visual y el copy con la marca del local.",
          image: "/landing/store-create.png",
          imageAlt: "Tienda creando una publicación con IA en CentralMark",
        },
        {
          title: "El mall aprueba y cura",
          description:
            "La administración revisa, edita y aprueba lo que se publica. Control total de calidad y calendario comercial.",
          image: "/landing/admin-approve.png",
          imageAlt: "Panel de administración del mall aprobando publicaciones",
        },
        {
          title: "Todo llega a la vitrina",
          description:
            "Las ofertas aprobadas se muestran en la vitrina digital del centro comercial y en los canales conectados.",
          image: "/landing/vitrina.png",
          imageAlt: "Vitrina digital del mall con ofertas publicadas",
        },
        {
          title: "Todo el marketing bajo control",
          description:
            "Mientras las tiendas crean campañas en segundos con IA, la administración del centro comercial accede a un panel ejecutivo con información en tiempo real para supervisar la actividad de todas las marcas.\n\n• Compara el rendimiento entre campañas.\n• Identifica tiendas con baja actividad.\n• Mide alcance, interacción y resultados.\n• Recibe reportes automáticos para tomar mejores decisiones.",
          image: "/landing/analytics.png",
          imageAlt: "Dashboard de analítica y resultados de marketing",
        },
      ],
      null,
      2
    ),
    sortOrder: 220,
  },

  // ——— Ecosystem ———
  {
    key: "ecosystem.title",
    type: "textarea",
    label: "Título",
    section: "ecosystem",
    sectionLabel: "4. Ecosistema conectado",
    value: "Un ecosistema conectado: administración y tiendas en sincronía",
    sortOrder: 300,
  },
  {
    key: "ecosystem.subtitle",
    type: "textarea",
    label: "Texto",
    section: "ecosystem",
    sectionLabel: "4. Ecosistema conectado",
    value:
      "CentralMark une a la gerencia del centro comercial con cada local. La administración define estrategia; cada tienda aporta su identidad. La IA traduce esa coordinación en contenido listo para publicar.",
    sortOrder: 310,
  },
  {
    key: "ecosystem.image",
    type: "image",
    label: "Imagen",
    section: "ecosystem",
    sectionLabel: "4. Ecosistema conectado",
    value: "/landing/ecosystem-connection.png",
    sortOrder: 320,
  },
  {
    key: "ecosystem.imageAlt",
    type: "text",
    label: "Texto alternativo",
    section: "ecosystem",
    sectionLabel: "4. Ecosistema conectado",
    value: "Diagrama de conexión entre administración del mall y tiendas",
    sortOrder: 330,
  },
  {
    key: "ecosystem.bullets",
    type: "json",
    label: "Lista de beneficios (JSON array de strings)",
    section: "ecosystem",
    sectionLabel: "4. Ecosistema conectado",
    value: JSON.stringify(
      [
        "Usuario y acceso independiente para cada tienda",
        "Logo, colores y tono de comunicación por marca",
        "Redes sociales y canales conectados por local",
        "Curaduría central de lo que se muestra en vitrina",
      ],
      null,
      2
    ),
    sortOrder: 340,
  },

  // ——— Intelligence ———
  {
    key: "intelligence.title",
    type: "textarea",
    label: "Título",
    section: "intelligence",
    sectionLabel: "5. Inteligencia de marketing",
    value: "Inteligencia de marketing, no solo generación de contenido",
    sortOrder: 400,
  },
  {
    key: "intelligence.subtitle",
    type: "textarea",
    label: "Subtítulo",
    section: "intelligence",
    sectionLabel: "5. Inteligencia de marketing",
    value:
      "CentralMark actúa como gerente de marketing del mall: propone, detecta, recomienda, compara, alerta e informa.",
    sortOrder: 410,
  },
  {
    key: "intelligence.items",
    type: "json",
    label: "Capacidades (JSON: title, description)",
    section: "intelligence",
    sectionLabel: "5. Inteligencia de marketing",
    value: JSON.stringify(
      [
        {
          title: "Propone campañas",
          description:
            "Analiza el calendario comercial, estacionalidad y rubros del mall para sugerir campañas coordinadas.",
        },
        {
          title: "Detecta tiendas sin promociones",
          description:
            "Identifica locales inactivos y envía recordatorios para mantener la vitrina siempre activa.",
        },
        {
          title: "Recomienda horarios",
          description:
            "Sugiere los mejores momentos para publicar según audiencia e historial de cada canal.",
        },
        {
          title: "Compara resultados",
          description:
            "Cruza métricas de alcance y engagement para evaluar qué estrategias funcionan mejor.",
        },
        {
          title: "Destaca alto rendimiento",
          description:
            "Alerta sobre posts con mejor desempeño para replicar el éxito en futuras campañas.",
        },
        {
          title: "Informe semanal",
          description:
            "Resumen ejecutivo con KPIs, tendencias y recomendaciones para la gerencia del mall.",
        },
      ],
      null,
      2
    ),
    sortOrder: 420,
  },

  // ——— Analytics ———
  {
    key: "analytics.title",
    type: "textarea",
    label: "Título analítica",
    section: "analytics",
    sectionLabel: "6. Datos e informe",
    value: "Decisiones basadas en datos, no en intuición",
    sortOrder: 500,
  },
  {
    key: "analytics.subtitle",
    type: "textarea",
    label: "Texto analítica",
    section: "analytics",
    sectionLabel: "6. Datos e informe",
    value:
      "Compará el rendimiento entre campañas, identificá qué publicaciones generaron mayor impacto y recibí recomendaciones de horarios óptimos.",
    sortOrder: 510,
  },
  {
    key: "analytics.image",
    type: "image",
    label: "Imagen analítica",
    section: "analytics",
    sectionLabel: "6. Datos e informe",
    value: "/landing/analytics-insights.png",
    sortOrder: 520,
  },
  {
    key: "report.title",
    type: "textarea",
    label: "Título informe",
    section: "analytics",
    sectionLabel: "6. Datos e informe",
    value: "Informe semanal para la gerencia del mall",
    sortOrder: 530,
  },
  {
    key: "report.subtitle",
    type: "textarea",
    label: "Texto informe",
    section: "analytics",
    sectionLabel: "6. Datos e informe",
    value:
      "Cada semana, un resumen ejecutivo con métricas clave, publicaciones destacadas y recomendaciones para la próxima campaña.",
    sortOrder: 540,
  },
  {
    key: "report.image",
    type: "image",
    label: "Imagen informe",
    section: "analytics",
    sectionLabel: "6. Datos e informe",
    value: "/landing/weekly-report.png",
    sortOrder: 550,
  },

  // ——— Channels ———
  {
    key: "channels.title",
    type: "textarea",
    label: "Título",
    section: "channels",
    sectionLabel: "7. Canales y flujo",
    value: "Contenido multicanal generado automáticamente",
    sortOrder: 600,
  },
  {
    key: "channels.subtitle",
    type: "textarea",
    label: "Subtítulo",
    section: "channels",
    sectionLabel: "7. Canales y flujo",
    value:
      "La IA produce piezas adaptadas a cada canal, respetando la identidad visual de cada tienda y las directrices del mall.",
    sortOrder: 610,
  },
  {
    key: "channels.items",
    type: "json",
    label: "Canales (JSON array de strings)",
    section: "channels",
    sectionLabel: "7. Canales y flujo",
    value: JSON.stringify(
      [
        "Publicaciones para Instagram y Facebook",
        "Historias y reels con identidad de marca",
        "Correos promocionales segmentados",
        "Anuncios y piezas para pantallas digitales",
        "Contenido coordinado en vitrina del mall",
      ],
      null,
      2
    ),
    sortOrder: 620,
  },
  {
    key: "flow.title",
    type: "text",
    label: "Título del flujo",
    section: "channels",
    sectionLabel: "7. Canales y flujo",
    value: "Flujo simplificado para las tiendas",
    sortOrder: 630,
  },
  {
    key: "flow.subtitle",
    type: "textarea",
    label: "Texto del flujo",
    section: "channels",
    sectionLabel: "7. Canales y flujo",
    value:
      "Cada local escribe una instrucción —por ejemplo, una promoción de temporada— y CentralMark genera la pieza visual, el texto para redes y la publicación coordinada.",
    sortOrder: 640,
  },
  {
    key: "flow.steps",
    type: "json",
    label: "Pasos del flujo (JSON array de strings)",
    section: "channels",
    sectionLabel: "7. Canales y flujo",
    value: JSON.stringify(
      [
        "La tienda describe su promoción en una sola instrucción",
        "La IA crea arte, copy y caption en español con su marca",
        "El mall cura y publica en vitrina y redes sociales",
      ],
      null,
      2
    ),
    sortOrder: 650,
  },

  // ——— Expansion ———
  {
    key: "expansion.title",
    type: "textarea",
    label: "Título",
    section: "expansion",
    sectionLabel: "8. Expansión",
    value: "Diseñado para malls, preparado para crecer",
    sortOrder: 700,
  },
  {
    key: "expansion.subtitle",
    type: "textarea",
    label: "Subtítulo",
    section: "expansion",
    sectionLabel: "8. Expansión",
    value:
      "CentralMark nace para centros comerciales, pero su arquitectura aplica a cualquier ecosistema retail con múltiples operadores bajo una administración central.",
    sortOrder: 710,
  },
  {
    key: "expansion.items",
    type: "json",
    label: "Verticales (JSON: label, active)",
    section: "expansion",
    sectionLabel: "8. Expansión",
    value: JSON.stringify(
      [
        { label: "Centros comerciales", active: true },
        { label: "Cadenas de supermercados", active: false },
        { label: "Aeropuertos comerciales", active: false },
        { label: "Mercados gastronómicos", active: false },
        { label: "Strip centers", active: false },
        { label: "Franquicias multi-sucursal", active: false },
      ],
      null,
      2
    ),
    sortOrder: 720,
  },

  // ——— CTA ———
  {
    key: "cta.title",
    type: "textarea",
    label: "Título CTA",
    section: "cta",
    sectionLabel: "9. Llamado a la acción",
    value: "CentralMark: marketing en segundos para centros comerciales",
    sortOrder: 800,
  },
  {
    key: "cta.subtitle",
    type: "textarea",
    label: "Subtítulo CTA",
    section: "cta",
    sectionLabel: "9. Llamado a la acción",
    value:
      "Coordiná estrategia, contenido y resultados entre la administración del mall y cada una de sus tiendas.",
    sortOrder: 810,
  },
  {
    key: "cta.primary",
    type: "text",
    label: "Botón principal",
    section: "cta",
    sectionLabel: "9. Llamado a la acción",
    value: "Conseguir una demo",
    sortOrder: 820,
  },

  // ——— Footer ———
  {
    key: "footer.blurb",
    type: "textarea",
    label: "Descripción del footer",
    section: "footer",
    sectionLabel: "10. Pie de página",
    value:
      "Plataforma de marketing inteligente para centros comerciales. Conecta a la administración del mall con cada tienda mediante IA generativa y coordinación centralizada.",
    sortOrder: 900,
  },
  {
    key: "footer.email",
    type: "text",
    label: "Email de contacto",
    section: "footer",
    sectionLabel: "10. Pie de página",
    value: "ventas@centralmark.cl",
    sortOrder: 910,
  },
  {
    key: "nav.cta",
    type: "text",
    label: "CTA del menú superior",
    section: "nav",
    sectionLabel: "0. Navegación",
    value: "Conseguir una demo",
    sortOrder: 5,
  },
];

export function defaultsMap(): Record<string, string> {
  return Object.fromEntries(LANDING_FIELD_DEFS.map((f) => [f.key, f.value]));
}

export function parseJsonField<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
