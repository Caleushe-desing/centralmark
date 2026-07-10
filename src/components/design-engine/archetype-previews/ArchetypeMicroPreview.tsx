import type { VisualArchetype } from "@/lib/design-engine/archetypes";

const PHOTO = "#1a1a22";
const PHOTO_MID = "#252530";
const PHOTO_HI = "#2e2e3a";
const INK = "#f4f4f5";
const MUTED = "#71717a";
const NEON = "#c8ff00";
const ACCENT = "#d4af37";
const PROMO = "#e8c4a0";
const RED = "#ff3b4a";

interface Props {
  archetype: VisualArchetype;
}

/** Micro-maqueta SVG de alta fidelidad — emula peso visual del layout final */
export function ArchetypeMicroPreview({ archetype }: Props) {
  switch (archetype) {
    case "drop":
      return <DropPreview />;
    case "spotlight":
      return <SpotlightPreview />;
    case "editorial":
      return <EditorialPreview />;
    case "promo":
      return <PromoPreview />;
  }
}

function DropPreview() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="drop-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PHOTO} />
          <stop offset="100%" stopColor={PHOTO_MID} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#drop-bg)" rx="8" />
      {/* foto simulada */}
      <rect x="16" y="28" width="168" height="100" fill={PHOTO_HI} rx="4" opacity="0.9" />
      {/* caja tipográfica rompiendo grilla — sobresale del borde */}
      <rect x="-6" y="52" width="128" height="36" fill="#0a0a0a" opacity="0.92" />
      <rect x="-6" y="52" width="128" height="36" fill="none" stroke={NEON} strokeWidth="1.2" opacity="0.7" />
      <rect x="8" y="62" width="88" height="10" fill={INK} rx="1" />
      <rect x="8" y="76" width="64" height="7" fill={INK} opacity="0.55" rx="1" />
      {/* bloque masivo cortando borde inferior */}
      <rect x="98" y="118" width="108" height="44" fill="#0d0d0d" opacity="0.95" />
      <rect x="108" y="128" width="72" height="18" fill={RED} rx="2" />
      <rect x="108" y="150" width="48" height="5" fill={INK} opacity="0.7" rx="1" />
      {/* streak */}
      <line x1="0" y1="108" x2="200" y2="104" stroke={NEON} strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

function SpotlightPreview() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <rect width="200" height="200" fill={PHOTO} rx="8" />
      {/* hairlines */}
      <line x1="24" y1="32" x2="176" y2="32" stroke={INK} strokeWidth="0.5" opacity="0.35" />
      <line x1="24" y1="168" x2="176" y2="168" stroke={INK} strokeWidth="0.5" opacity="0.35" />
      <line x1="100" y1="40" x2="100" y2="160" stroke={INK} strokeWidth="0.5" opacity="0.2" />
      {/* espacio negativo central — producto */}
      <ellipse cx="100" cy="98" rx="36" ry="44" fill={PHOTO_HI} opacity="0.85" />
      <ellipse cx="100" cy="98" rx="28" ry="34" fill={PHOTO_MID} />
      {/* tipografía ultraligera pequeña */}
      <rect x="28" y="42" width="40" height="3" fill={INK} opacity="0.45" rx="1" />
      <rect x="28" y="50" width="28" height="2" fill={MUTED} rx="1" />
      <rect x="132" y="148" width="44" height="2" fill={INK} opacity="0.4" rx="1" />
      <rect x="148" y="154" width="28" height="2" fill={MUTED} rx="1" />
      {/* bloques simétricos mínimos */}
      <rect x="24" y="148" width="20" height="2" fill={INK} opacity="0.3" rx="1" />
      <rect x="156" y="42" width="20" height="2" fill={INK} opacity="0.3" rx="1" />
    </svg>
  );
}

function EditorialPreview() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <rect width="200" height="200" fill="#111" rx="8" />
      <rect x="14" y="14" width="172" height="172" fill="none" stroke={INK} strokeWidth="0.6" opacity="0.2" />
      <rect x="20" y="60" width="160" height="90" fill={PHOTO_MID} rx="2" />
      {/* serif titular simulado — trazos variables */}
      <text x="24" y="38" fill={ACCENT} fontSize="7" fontFamily="Georgia, serif" letterSpacing="3">
        ÉDITION
      </text>
      <text x="24" y="54" fill={INK} fontSize="16" fontFamily="Georgia, serif" fontWeight="bold">
        Invierno
      </text>
      <text x="24" y="54" fill={INK} fontSize="16" fontFamily="Georgia, serif" fontStyle="italic" dx="62">
        Urbano
      </text>
      {/* bajada */}
      <line x1="24" y1="162" x2="64" y2="162" stroke={ACCENT} strokeWidth="0.8" opacity="0.8" />
      <text x="24" y="176" fill={INK} fontSize="6" fontFamily="Georgia, serif" fontStyle="italic" opacity="0.75">
        La moda redefine la calle
      </text>
      <text x="140" y="182" fill={MUTED} fontSize="5" fontFamily="Georgia, serif" letterSpacing="2">
        VER MÁS
      </text>
    </svg>
  );
}

function PromoPreview() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <rect width="200" height="200" fill={PHOTO} rx="8" />
      <rect x="0" y="0" width="200" height="200" fill={PHOTO_MID} opacity="0.5" />
      {/* imagen limpia derecha */}
      <rect x="88" y="24" width="92" height="152" fill={PHOTO_HI} rx="6" />
      {/* bloque curado izquierdo */}
      <rect x="16" y="48" width="72" height="104" fill="#1c1c24" rx="6" />
      <rect x="16" y="48" width="72" height="104" fill="none" stroke={PROMO} strokeWidth="0.8" opacity="0.5" rx="6" />
      {/* número integrado */}
      <text x="28" y="98" fill={PROMO} fontSize="28" fontFamily="system-ui, sans-serif" fontWeight="800">
        50
      </text>
      <text x="68" y="88" fill={PROMO} fontSize="12" fontFamily="system-ui, sans-serif" fontWeight="700">
        %
      </text>
      <rect x="28" y="108" width="48" height="4" fill={INK} opacity="0.6" rx="1" />
      <rect x="28" y="118" width="36" height="3" fill={MUTED} rx="1" />
      <rect x="28" y="132" width="44" height="8" fill={PROMO} opacity="0.25" rx="2" />
      <text x="32" y="138" fill={INK} fontSize="5" fontFamily="system-ui" fontWeight="600" letterSpacing="1">
        OFF
      </text>
    </svg>
  );
}
