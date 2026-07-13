import { useId } from "react";
import type { VisualArchetype } from "@/lib/design-engine/archetypes";

const INK = "#f4f4f5";
const MUTED = "#71717a";
const NEON = "#c8ff00";
const ACCENT = "#d4af37";
const PROMO = "#e8c4a0";
const RED = "#ff3b4a";
const FRAME = "#1a1a22";

interface Props {
  archetype: VisualArchetype;
  /** Foto del rubro de la tienda (o subida en configuración) */
  photoUrl: string;
}

/**
 * Micro-maqueta SVG de alta fidelidad: foto real del rubro + wireframe del layout.
 * No llama a OpenAI.
 */
export function ArchetypeMicroPreview({ archetype, photoUrl }: Props) {
  switch (archetype) {
    case "drop":
      return <DropPreview photoUrl={photoUrl} />;
    case "spotlight":
      return <SpotlightPreview photoUrl={photoUrl} />;
    case "editorial":
      return <EditorialPreview photoUrl={photoUrl} />;
    case "promo":
      return <PromoPreview photoUrl={photoUrl} />;
  }
}

function PhotoLayer({ photoUrl, clipId }: { photoUrl: string; clipId: string }) {
  return (
    <image
      key={photoUrl}
      href={photoUrl}
      x="16"
      y="28"
      width="168"
      height="120"
      preserveAspectRatio="xMidYMid slice"
      clipPath={`url(#${clipId})`}
    />
  );
}

function DropPreview({ photoUrl }: { photoUrl: string }) {
  const clipId = useId();
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <rect x="16" y="28" width="168" height="120" rx="4" />
        </clipPath>
      </defs>
      <rect width="200" height="200" fill={FRAME} rx="8" />
      <rect x="16" y="28" width="168" height="120" fill="#252530" rx="4" />
      <PhotoLayer photoUrl={photoUrl} clipId={clipId} />
      {/* caja rompiendo grilla */}
      <rect x="-8" y="54" width="130" height="38" fill="#0a0a0a" opacity="0.93" />
      <rect x="-8" y="54" width="130" height="38" fill="none" stroke={NEON} strokeWidth="1.2" opacity="0.75" />
      <rect x="10" y="64" width="92" height="11" fill={INK} rx="1" />
      <rect x="10" y="78" width="70" height="8" fill={INK} opacity="0.5" rx="1" />
      <rect x="96" y="122" width="112" height="46" fill="#0d0d0d" opacity="0.95" />
      <rect x="106" y="132" width="76" height="20" fill={RED} rx="2" />
      <line x1="0" y1="110" x2="200" y2="106" stroke={NEON} strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

function SpotlightPreview({ photoUrl }: { photoUrl: string }) {
  const clipId = useId();
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <ellipse cx="100" cy="98" rx="52" ry="58" />
        </clipPath>
      </defs>
      <rect width="200" height="200" fill={FRAME} rx="8" />
      <line x1="24" y1="32" x2="176" y2="32" stroke={INK} strokeWidth="0.5" opacity="0.35" />
      <line x1="24" y1="168" x2="176" y2="168" stroke={INK} strokeWidth="0.5" opacity="0.35" />
      <line x1="100" y1="40" x2="100" y2="160" stroke={INK} strokeWidth="0.5" opacity="0.2" />
      <ellipse cx="100" cy="98" rx="52" ry="58" fill="#252530" />
      <image
        key={photoUrl}
        href={photoUrl}
        x="48"
        y="40"
        width="104"
        height="116"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      <rect x="28" y="44" width="44" height="3" fill={INK} opacity="0.45" rx="1" />
      <rect x="128" y="150" width="44" height="2" fill={MUTED} rx="1" />
    </svg>
  );
}

function EditorialPreview({ photoUrl }: { photoUrl: string }) {
  const clipId = useId();
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <rect x="20" y="62" width="160" height="88" rx="2" />
        </clipPath>
      </defs>
      <rect width="200" height="200" fill="#111" rx="8" />
      <rect x="14" y="14" width="172" height="172" fill="none" stroke={INK} strokeWidth="0.6" opacity="0.2" />
      <rect x="20" y="62" width="160" height="88" fill="#252530" rx="2" />
      <image
        key={photoUrl}
        href={photoUrl}
        x="20"
        y="62"
        width="160"
        height="88"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      <text x="24" y="38" fill={ACCENT} fontSize="7" fontFamily="Georgia, serif" letterSpacing="3">
        ÉDITION
      </text>
      <text x="24" y="54" fill={INK} fontSize="15" fontFamily="Georgia, serif" fontWeight="bold">
        Colección
      </text>
      <text x="88" y="54" fill={INK} fontSize="15" fontFamily="Georgia, serif" fontStyle="italic">
        curada
      </text>
      <line x1="24" y1="162" x2="64" y2="162" stroke={ACCENT} strokeWidth="0.8" opacity="0.8" />
      <text x="24" y="176" fill={INK} fontSize="6" fontFamily="Georgia, serif" fontStyle="italic" opacity="0.75">
        Storytelling visual
      </text>
    </svg>
  );
}

function PromoPreview({ photoUrl }: { photoUrl: string }) {
  const clipId = useId();
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <rect x="88" y="24" width="92" height="152" rx="6" />
        </clipPath>
      </defs>
      <rect width="200" height="200" fill={FRAME} rx="8" />
      <rect x="88" y="24" width="92" height="152" fill="#252530" rx="6" />
      <image
        key={photoUrl}
        href={photoUrl}
        x="88"
        y="24"
        width="92"
        height="152"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      <rect x="16" y="48" width="72" height="104" fill="#1c1c24" rx="6" />
      <rect x="16" y="48" width="72" height="104" fill="none" stroke={PROMO} strokeWidth="0.8" opacity="0.5" rx="6" />
      <text x="28" y="98" fill={PROMO} fontSize="28" fontFamily="system-ui, sans-serif" fontWeight="800">
        50
      </text>
      <text x="68" y="88" fill={PROMO} fontSize="12" fontFamily="system-ui, sans-serif" fontWeight="700">
        %
      </text>
      <rect x="28" y="108" width="48" height="4" fill={INK} opacity="0.6" rx="1" />
      <rect x="28" y="132" width="44" height="8" fill={PROMO} opacity="0.25" rx="2" />
    </svg>
  );
}
