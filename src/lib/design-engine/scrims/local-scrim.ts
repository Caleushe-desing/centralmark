import type { CSSProperties } from "react";
import type { ZoneAnchor } from "../composition/rules";

export type ScrimStyle = {
  pointerEvents: "none";
  position: "absolute";
  left: number;
  right: number;
  height: string;
  top?: number;
  bottom?: number;
  background: string;
};

/**
 * Scrims locales por zona — gradientes direccionales sin caja sólida global.
 */
export function zoneScrimStylePlain(zone: ZoneAnchor, intensity = 0.55): ScrimStyle {
  const top = zone === "top";
  const start = Math.min(0.75, intensity * 0.65);
  const mid = Math.min(0.35, intensity * 0.25);

  return {
    pointerEvents: "none",
    position: "absolute",
    left: 0,
    right: 0,
    height: top ? "42%" : "48%",
    ...(top ? { top: 0 } : { bottom: 0 }),
    background: top
      ? `linear-gradient(to bottom, rgba(0,0,0,${start}) 0%, rgba(0,0,0,${mid}) 45%, transparent 100%)`
      : `linear-gradient(to top, rgba(0,0,0,${start}) 0%, rgba(0,0,0,${mid}) 50%, transparent 100%)`,
  };
}

/** Drop: scrim solo arriba-izquierda — la foto centro-derecha queda visible */
export function dropTopLeftScrimStyle(): CSSProperties {
  return {
    pointerEvents: "none",
    position: "absolute",
    left: 0,
    top: 0,
    width: "48%",
    height: "40%",
    background: "linear-gradient(145deg, rgba(0,0,0,0.48) 0%, transparent 72%)",
  };
}

/** Drop: scrim suave solo detrás del bloque inferior-derecho */
export function dropBottomRightScrimStyle(): CSSProperties {
  return {
    pointerEvents: "none",
    position: "absolute",
    right: 0,
    bottom: 0,
    width: "54%",
    height: "30%",
    background: "linear-gradient(320deg, rgba(0,0,0,0.42) 0%, transparent 70%)",
  };
}

export function localZoneScrimClass(zone: ZoneAnchor): string {
  return zone === "top"
    ? "pointer-events-none absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-black/50 via-black/15 to-transparent"
    : "pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-black/55 via-black/20 to-transparent";
}
