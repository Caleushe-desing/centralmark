"use client";

import {
  buildDefaultLayers,
  createTextLayer,
  exportComposedImage,
  FONT_FAMILIES,
  getFontCss,
  normalizeLayer,
  TEXT_COLORS,
  TEXT_PRESETS,
  type TextLayer,
} from "@/lib/image/text-layers";
import type { ImageCreationMode } from "@/lib/ai/image-generator";
import { buildOutletInstagramLayers } from "@/lib/image/promo-templates";
import {
  createDefaultLogoLayer,
  normalizeLogoLayer,
  STORE_LOGO_LAYER_ID,
  type LogoLayer,
} from "@/lib/image/store-logo";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ImageIcon,
  Italic,
  Layers,
  Plus,
  Redo2,
  RotateCw,
  SlidersHorizontal,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

interface ImageTextEditorProps {
  imageUrl: string;
  creationMode?: ImageCreationMode;
  discountPercent?: number;
  productName?: string;
  logoUrl?: string | null;
  initialLayers?: TextLayer[];
  onRegisterExport: (exporter: (() => Promise<Blob>) | null) => void;
}

type EditorSnapshot = {
  layers: TextLayer[];
  logoLayer: LogoLayer | null;
};

type Interaction =
  | { kind: "move"; id: string; pointerId: number }
  | {
      kind: "resize";
      id: string;
      pointerId: number;
      startDist: number;
      startSize: number;
      cx: number;
      cy: number;
    }
  | {
      kind: "rotate";
      id: string;
      pointerId: number;
      startAngle: number;
      startRotation: number;
      cx: number;
      cy: number;
    };

const STYLE_PRESETS: { label: string; patch: Partial<Omit<TextLayer, "id" | "text">> }[] = [
  {
    label: "Oferta flash",
    patch: { fontFamily: "bebas", color: "#FB7185", strokeWidth: 3, strokeColor: "#000", fontSize: 88 },
  },
  {
    label: "Elegante",
    patch: { fontFamily: "playfair", color: "#FFFFFF", italic: true, strokeWidth: 0, fontSize: 56 },
  },
  {
    label: "Urgencia",
    patch: { fontFamily: "anton", color: "#FACC15", strokeWidth: 2, strokeColor: "#000", fontSize: 72 },
  },
  {
    label: "Con fondo",
    patch: { backgroundColor: "rgba(0,0,0,0.65)", color: "#FFF", fontFamily: "oswald", fontSize: 52 },
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cloneLayers(layers: TextLayer[]): TextLayer[] {
  return JSON.parse(JSON.stringify(layers)) as TextLayer[];
}

function cloneSnapshot(snapshot: EditorSnapshot): EditorSnapshot {
  return {
    layers: cloneLayers(snapshot.layers),
    logoLayer: snapshot.logoLayer ? { ...snapshot.logoLayer } : null,
  };
}

function buildInitialSnapshot(
  creationMode: ImageCreationMode,
  discountPercent?: number,
  productName?: string,
  logoUrl?: string | null,
  initialLayers?: TextLayer[]
): EditorSnapshot {
  let layers: TextLayer[];
  if (creationMode === "complete") {
    layers =
      initialLayers?.length
        ? initialLayers.map((l) => normalizeLayer(l))
        : buildDefaultLayers(discountPercent, productName);
  } else {
    layers = buildDefaultLayers(discountPercent, productName);
  }

  return {
    layers,
    logoLayer: logoUrl ? createDefaultLogoLayer() : null,
  };
}

export function ImageTextEditor({
  imageUrl,
  creationMode = "editor",
  discountPercent,
  productName,
  logoUrl,
  initialLayers,
  onRegisterExport,
}: ImageTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorSnapshot>(
    buildInitialSnapshot(creationMode, discountPercent, productName, logoUrl, initialLayers)
  );
  const [layers, setLayers] = useState<TextLayer[]>(() => editorRef.current.layers);
  const [logoLayer, setLogoLayer] = useState<LogoLayer | null>(() => editorRef.current.logoLayer);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [scale, setScale] = useState(1);
  const interactionRef = useRef<Interaction | null>(null);
  const historyRef = useRef<EditorSnapshot[]>([]);
  const historyIdxRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isComplete = creationMode === "complete";
  const [showTools, setShowTools] = useState(!isComplete);

  const logoSelected = selectedId === STORE_LOGO_LAYER_ID;
  const selected = logoSelected ? null : (layers.find((l) => l.id === selectedId) ?? null);

  useEffect(() => {
    editorRef.current = { layers, logoLayer };
  }, [layers, logoLayer]);

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
  }, []);

  const pushHistory = useCallback(
    (next: EditorSnapshot) => {
      const hist = historyRef.current.slice(0, historyIdxRef.current + 1);
      hist.push(cloneSnapshot(next));
      historyRef.current = hist.slice(-50);
      historyIdxRef.current = historyRef.current.length - 1;
      syncHistoryFlags();
    },
    [syncHistoryFlags]
  );

  const applySnapshot = useCallback((snap: EditorSnapshot) => {
    const cloned = cloneSnapshot(snap);
    editorRef.current = cloned;
    setLayers(cloned.layers);
    setLogoLayer(cloned.logoLayer);
  }, []);

  const setLayersWithHistory = useCallback(
    (updater: (prev: TextLayer[]) => TextLayer[]) => {
      setLayers((prev) => {
        const nextLayers = updater(prev);
        const snap = { layers: nextLayers, logoLayer: editorRef.current.logoLayer };
        pushHistory(snap);
        return nextLayers;
      });
    },
    [pushHistory]
  );

  const updateLogo = useCallback(
    (patch: Partial<LogoLayer>, recordHistory = true) => {
      setLogoLayer((prev) => {
        if (!prev) return prev;
        const next = normalizeLogoLayer({ ...prev, ...patch });
        if (recordHistory) {
          pushHistory({ layers: editorRef.current.layers, logoLayer: next });
        }
        return next;
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    applySnapshot(historyRef.current[historyIdxRef.current]);
    setSelectedId(null);
    syncHistoryFlags();
  }, [applySnapshot, syncHistoryFlags]);

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    applySnapshot(historyRef.current[historyIdxRef.current]);
    setSelectedId(null);
    syncHistoryFlags();
  }, [applySnapshot, syncHistoryFlags]);

  const initialLayersKey = initialLayers ? JSON.stringify(initialLayers) : "";

  useEffect(() => {
    const initial = buildInitialSnapshot(
      creationMode,
      discountPercent,
      productName,
      logoUrl,
      initialLayers
    );
    applySnapshot(initial);
    setSelectedId(null);
    setShowTools(creationMode !== "complete");
    historyRef.current = [cloneSnapshot(initial)];
    historyIdxRef.current = 0;
    syncHistoryFlags();
  }, [
    imageUrl,
    discountPercent,
    productName,
    creationMode,
    logoUrl,
    initialLayersKey,
    applySnapshot,
    syncHistoryFlags,
  ]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 1080);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const updateLayer = useCallback(
    (id: string, patch: Partial<TextLayer>, recordHistory = true) => {
      const updater = (prev: TextLayer[]) =>
        prev.map((l) => (l.id === id ? normalizeLayer({ ...l, ...patch }) : l));
      if (recordHistory) setLayersWithHistory(updater);
      else setLayers(updater);
    },
    [setLayersWithHistory]
  );

  const addLayer = useCallback(
    (text: string, patch?: Partial<Omit<TextLayer, "id" | "text">>) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const layer = createTextLayer(trimmed, { y: 35 + layers.length * 6, ...patch });
      setLayersWithHistory((prev) => [...prev, layer]);
      setSelectedId(layer.id);
      setNewText("");
    },
    [layers.length, setLayersWithHistory]
  );

  const duplicateLayer = useCallback(
    (id: string) => {
      const source = layers.find((l) => l.id === id);
      if (!source) return;
      const copy = createTextLayer(source.text, {
        ...source,
        x: source.x + 4,
        y: source.y + 4,
      });
      setLayersWithHistory((prev) => [...prev, copy]);
      setSelectedId(copy.id);
    },
    [layers, setLayersWithHistory]
  );

  const removeLayer = useCallback(
    (id: string) => {
      setLayersWithHistory((prev) => prev.filter((l) => l.id !== id));
      setSelectedId((c) => (c === id ? null : c));
    },
    [setLayersWithHistory]
  );

  const moveLayerOrder = useCallback(
    (id: string, dir: "up" | "down") => {
      setLayersWithHistory((prev) => {
        const idx = prev.findIndex((l) => l.id === id);
        if (idx < 0) return prev;
        const next = [...prev];
        const swap = dir === "up" ? idx + 1 : idx - 1;
        if (swap < 0 || swap >= next.length) return prev;
        [next[idx], next[swap]] = [next[swap], next[idx]];
        return next;
      });
    },
    [setLayersWithHistory]
  );

  const applyOutletTemplate = useCallback(() => {
    const discount = discountPercent ?? 30;
    setLayersWithHistory(() => buildOutletInstagramLayers(discount));
    setSelectedId(null);
  }, [discountPercent, setLayersWithHistory]);

  useEffect(() => {
    onRegisterExport(() =>
      exportComposedImage(imageUrl, layers, 1080, logoUrl, logoLayer, {
        promoScrims: isComplete && layers.length > 0,
        accentRibbon: isComplete && layers.some((l) => l.variant === "badge"),
      })
    );
    return () => onRegisterExport(null);
  }, [imageUrl, layers, logoUrl, logoLayer, onRegisterExport, isComplete]);

  function itemCenterPx(id: string) {
    const rect = containerRef.current!.getBoundingClientRect();
    if (id === STORE_LOGO_LAYER_ID && logoLayer) {
      return {
        cx: rect.left + (logoLayer.x / 100) * rect.width,
        cy: rect.top + (logoLayer.y / 100) * rect.height,
      };
    }
    const layer = layers.find((l) => l.id === id);
    if (!layer) return { cx: rect.left, cy: rect.top };
    return {
      cx: rect.left + (layer.x / 100) * rect.width,
      cy: rect.top + (layer.y / 100) * rect.height,
    };
  }

  function getItemSize(id: string): number {
    if (id === STORE_LOGO_LAYER_ID && logoLayer) return logoLayer.size;
    const layer = layers.find((l) => l.id === id);
    return layer?.fontSize ?? 64;
  }

  function patchItemSize(id: string, size: number, recordHistory: boolean) {
    if (id === STORE_LOGO_LAYER_ID) {
      updateLogo({ size: clamp(Math.round(size), 32, 320) }, recordHistory);
      return;
    }
    updateLayer(id, { fontSize: clamp(Math.round(size), 16, 220) }, recordHistory);
  }

  function patchItemPosition(id: string, x: number, y: number, recordHistory: boolean) {
    const pos = { x: clamp(x, 2, 98), y: clamp(y, 2, 98) };
    if (id === STORE_LOGO_LAYER_ID) {
      updateLogo(pos, recordHistory);
      return;
    }
    updateLayer(id, pos, recordHistory);
  }

  function patchItemRotation(id: string, rotation: number, recordHistory: boolean) {
    if (id === STORE_LOGO_LAYER_ID) {
      updateLogo({ rotation }, recordHistory);
      return;
    }
    updateLayer(id, { rotation }, recordHistory);
  }

  function startMove(e: React.PointerEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    interactionRef.current = { kind: "move", id, pointerId: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function startResize(e: React.PointerEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    const { cx, cy } = itemCenterPx(id);
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy) || 1;
    interactionRef.current = {
      kind: "resize",
      id,
      pointerId: e.pointerId,
      startDist: dist,
      startSize: getItemSize(id),
      cx,
      cy,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function startRotate(e: React.PointerEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    const { cx, cy } = itemCenterPx(id);
    const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    const startRotation =
      id === STORE_LOGO_LAYER_ID
        ? (logoLayer?.rotation ?? 0)
        : (layers.find((l) => l.id === id)?.rotation ?? 0);
    interactionRef.current = {
      kind: "rotate",
      id,
      pointerId: e.pointerId,
      startAngle: angle,
      startRotation,
      cx,
      cy,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const ix = interactionRef.current;
    if (!ix || ix.pointerId !== e.pointerId || !containerRef.current) return;

    if (ix.kind === "move") {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      patchItemPosition(ix.id, x, y, false);
      return;
    }

    if (ix.kind === "resize") {
      const dist = Math.hypot(e.clientX - ix.cx, e.clientY - ix.cy);
      const ratio = dist / ix.startDist;
      patchItemSize(ix.id, ix.startSize * ratio, false);
      return;
    }

    if (ix.kind === "rotate") {
      const angle = (Math.atan2(e.clientY - ix.cy, e.clientX - ix.cx) * 180) / Math.PI;
      patchItemRotation(ix.id, ix.startRotation + (angle - ix.startAngle), false);
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    const ix = interactionRef.current;
    if (!ix || ix.pointerId !== e.pointerId) return;
    interactionRef.current = null;
    pushHistory(editorRef.current);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-start">
      <div className="flex-1 min-w-0 w-full">
        {isComplete && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mm-neon/15 border border-mm-neon/30 text-[11px] text-mm-neon font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lista para compartir
            </span>
            <button
              type="button"
              onClick={() => setShowTools((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 text-[11px] text-slate-300 hover:bg-white/5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showTools ? "Ocultar editor" : "Personalizar textos"}
              {showTools ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-2">
          {(showTools || !isComplete) && (
            <>
              <button
                type="button"
                disabled={!canUndo}
                onClick={undo}
                className="p-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/5"
                title="Deshacer"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={!canRedo}
                onClick={redo}
                className="p-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/5"
                title="Rehacer"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <span className="text-[10px] text-slate-500 leading-tight hidden sm:block">
            {isComplete && !showTools
              ? "Textos con ortografía verificada — publica directo o personaliza"
              : "Arrastra · esquina = tamaño · arriba = rotar"}
          </span>
        </div>

        <div
          ref={containerRef}
          className={`relative aspect-square overflow-hidden rounded-xl bg-black select-none touch-none ${
            isComplete && !showTools ? "ring-2 ring-white/10 shadow-2xl shadow-black/50" : ""
          }`}
          onClick={() => setSelectedId(null)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
        {isComplete && layers.length > 0 && (
          <>
            <div
              className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-slate-950/70 via-slate-950/25 to-transparent pointer-events-none z-[1]"
              aria-hidden
            />
            <div
              className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent pointer-events-none z-[1]"
              aria-hidden
            />
          </>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Imagen IA" className="absolute inset-0 w-full h-full object-cover" />

        {logoUrl && logoLayer && (
          <div
            className="absolute"
            style={{
              left: `${logoLayer.x}%`,
              top: `${logoLayer.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 900,
            }}
          >
            <div
              className={`relative ${logoSelected ? "outline outline-2 outline-emerald-400 outline-offset-2 rounded-lg" : ""}`}
              style={{
                transform: `rotate(${logoLayer.rotation}deg)`,
                opacity: logoLayer.opacity,
              }}
            >
              <div
                onPointerDown={(e) => startMove(e, STORE_LOGO_LAYER_ID)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(STORE_LOGO_LAYER_ID);
                }}
                className="cursor-grab active:cursor-grabbing"
                style={{
                  width: logoLayer.size * scale,
                  height: logoLayer.size * scale,
                }}
              >
                <div
                  className={`w-full h-full flex items-center justify-center ${logoLayer.showBackground ? "rounded-lg bg-white/90 p-1 shadow-md" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Logo de la tienda"
                    className="max-w-full max-h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>

              {logoSelected && (
                <>
                  <div
                    onPointerDown={(e) => startRotate(e, STORE_LOGO_LAYER_ID)}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white cursor-grab flex items-center justify-center shadow-lg"
                    title="Rotar logo"
                  >
                    <RotateCw className="w-3 h-3 text-white" />
                  </div>
                  <div
                    onPointerDown={(e) => startResize(e, STORE_LOGO_LAYER_ID)}
                    className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-mm-yellow border-2 border-white cursor-se-resize shadow-lg"
                    title="Tamaño del logo"
                  />
                </>
              )}
            </div>
          </div>
        )}

        {layers.map((raw, index) => {
          const layer = normalizeLayer(raw);
          const isSelected = layer.id === selectedId;
          const fontSize = layer.fontSize * scale;
          const textStyle: CSSProperties = {
            fontSize,
            fontFamily: getFontCss(layer.fontFamily),
            fontWeight: layer.bold ? 700 : 400,
            fontStyle: layer.italic ? "italic" : "normal",
            color: layer.color,
            textAlign: layer.align,
            letterSpacing: `${layer.letterSpacing * scale}px`,
            WebkitTextStroke:
              layer.strokeWidth > 0
                ? `${layer.strokeWidth * scale}px ${layer.strokeColor}`
                : undefined,
            paintOrder: "stroke fill",
            textShadow: "0 2px 14px rgba(0,0,0,0.85)",
          };

          const inner =
            layer.variant === "badge" ? (
              <div
                className="flex items-center justify-center rounded-full shadow-lg border-2 border-white/40"
                style={{
                  width: fontSize * 2.3,
                  height: fontSize * 2.3,
                  backgroundColor: layer.badgeColor ?? "#F97316",
                  ...textStyle,
                }}
              >
                {layer.text}
              </div>
            ) : (
              <div
                style={{
                  ...textStyle,
                  backgroundColor: layer.backgroundColor ?? undefined,
                  padding:
                    layer.backgroundColor || layer.variant === "pill"
                      ? `${10 * scale}px ${18 * scale}px`
                      : undefined,
                  borderRadius:
                    layer.variant === "pill"
                      ? `${9999}px`
                      : layer.backgroundColor
                        ? `${10 * scale}px`
                        : undefined,
                }}
              >
                {layer.text}
              </div>
            );

          return (
            <div
              key={layer.id}
              className="absolute max-w-[92%]"
              style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: index + 1,
              }}
            >
              <div
                className={`relative ${isSelected ? "outline outline-2 outline-mm-neon outline-offset-2 rounded" : ""}`}
                style={{ transform: `rotate(${layer.rotation}deg)`, opacity: layer.opacity }}
              >
                <div
                  onPointerDown={(e) => startMove(e, layer.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-grab active:cursor-grabbing whitespace-pre-wrap leading-tight"
                >
                  {inner}
                </div>

                {isSelected && (
                  <>
                    <div
                      onPointerDown={(e) => startRotate(e, layer.id)}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-mm-neon border-2 border-white cursor-grab flex items-center justify-center shadow-lg"
                      title="Rotar"
                    >
                      <RotateCw className="w-3 h-3 text-white" />
                    </div>
                    <div
                      onPointerDown={(e) => startResize(e, layer.id)}
                      className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-mm-yellow border-2 border-white cursor-se-resize shadow-lg"
                      title="Agrandar / achicar"
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {(showTools || !isComplete) && (
      <aside className="w-full lg:w-56 xl:w-60 shrink-0 space-y-2 lg:sticky lg:top-4 max-h-[min(85vh,720px)] overflow-y-auto pr-0.5">
        <div className="p-2 rounded-xl border border-white/10 bg-slate-900/90 space-y-2">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
            Texto en la imagen
          </p>
          <div className="flex gap-1.5">
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLayer(newText)}
              placeholder="Nuevo texto…"
              className="flex-1 min-w-0 bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-slate-600"
            />
            <button
              type="button"
              onClick={() => addLayer(newText)}
              className="p-1.5 rounded-lg bg-mm-neon text-black hover:bg-mm-neon shrink-0"
              title="Agregar texto"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={applyOutletTemplate}
              className="px-2 py-1 rounded-full bg-mm-yellow/80 text-white text-[10px] font-semibold hover:bg-mm-yellow"
            >
              Outlet
            </button>
            {TEXT_PRESETS.slice(0, 4).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => addLayer(preset)}
                className="px-1.5 py-0.5 rounded-full border border-white/10 text-[10px] text-slate-300 hover:bg-white/5"
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>

        {!selected && !logoSelected && (
          <p className="text-[11px] text-slate-500 px-1">
            Toca un texto o tu logo en la imagen para editarlo aquí.
          </p>
        )}
        {logoSelected && logoLayer && (
        <div className="p-3 rounded-xl border border-emerald-500/30 bg-slate-900/90 space-y-3">
          <div className="flex items-center gap-2 text-xs text-emerald-300">
            <ImageIcon className="w-4 h-4" />
            <span className="font-medium">Logo de tu tienda</span>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Tamaño — {Math.round(logoLayer.size)}px
            </label>
            <input
              type="range"
              min={32}
              max={320}
              value={logoLayer.size}
              onChange={(e) => updateLogo({ size: parseInt(e.target.value, 10) })}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Rotación — {Math.round(logoLayer.rotation)}°
            </label>
            <input
              type="range"
              min={-180}
              max={180}
              value={logoLayer.rotation}
              onChange={(e) => updateLogo({ rotation: parseInt(e.target.value, 10) })}
              className="w-full accent-mm-neon"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Opacidad — {Math.round(logoLayer.opacity * 100)}%
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round(logoLayer.opacity * 100)}
              onChange={(e) =>
                updateLogo({ opacity: parseInt(e.target.value, 10) / 100 })
              }
              className="w-full accent-slate-400"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={logoLayer.showBackground}
              onChange={(e) => updateLogo({ showBackground: e.target.checked })}
              className="rounded border-white/20"
            />
            Fondo blanco detrás del logo
          </label>

          <button
            type="button"
            onClick={() => updateLogo(createDefaultLogoLayer())}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            Restaurar posición por defecto
          </button>
        </div>
      )}

      {selected && (
        <div className="p-3 rounded-xl border border-white/10 bg-slate-900/90 space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 min-w-0">
              <Type className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-white font-medium">{selected.text}</span>
            </span>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => duplicateLayer(selected.id)}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10"
                title="Duplicar"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveLayerOrder(selected.id, "down")}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10"
                title="Enviar atrás"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeLayer(selected.id)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <textarea
            value={selected.text}
            onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
            rows={2}
            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none"
          />

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Estilos rápidos</label>
            <div className="flex flex-wrap gap-1.5">
              {STYLE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => updateLayer(selected.id, p.patch)}
                  className="px-2 py-1 rounded-lg border border-white/10 text-[11px] text-slate-300 hover:bg-white/5"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Fuente</label>
            <div className="grid grid-cols-2 gap-1.5">
              {FONT_FAMILIES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => updateLayer(selected.id, { fontFamily: f.id })}
                  className={`px-2 py-1.5 rounded-lg border text-xs truncate ${
                    selected.fontFamily === f.id
                      ? "border-mm-neon bg-mm-neon/20 text-white"
                      : "border-white/10 text-slate-300 hover:bg-white/5"
                  }`}
                  style={{ fontFamily: f.css }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateLayer(selected.id, { bold: !selected.bold })}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border text-sm ${
                selected.bold
                  ? "border-mm-neon bg-mm-neon/20 text-white"
                  : "border-white/10 text-slate-300"
              }`}
            >
              <Bold className="w-4 h-4" /> Negrita
            </button>
            <button
              type="button"
              onClick={() => updateLayer(selected.id, { italic: !selected.italic })}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border text-sm ${
                selected.italic
                  ? "border-mm-neon bg-mm-neon/20 text-white"
                  : "border-white/10 text-slate-300"
              }`}
            >
              <Italic className="w-4 h-4" /> Cursiva
            </button>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Alineación</label>
            <div className="flex gap-1">
              {(
                [
                  ["left", AlignLeft],
                  ["center", AlignCenter],
                  ["right", AlignRight],
                ] as const
              ).map(([align, Icon]) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => updateLayer(selected.id, { align })}
                  className={`flex-1 flex justify-center py-2 rounded-lg border ${
                    selected.align === align
                      ? "border-mm-neon bg-mm-neon/20 text-white"
                      : "border-white/10 text-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Tamaño — {selected.fontSize}px
            </label>
            <input
              type="range"
              min={16}
              max={220}
              value={selected.fontSize}
              onChange={(e) =>
                updateLayer(selected.id, { fontSize: parseInt(e.target.value, 10) })
              }
              className="w-full accent-mm-yellow"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Rotación — {Math.round(selected.rotation)}°
            </label>
            <input
              type="range"
              min={-180}
              max={180}
              value={selected.rotation}
              onChange={(e) =>
                updateLayer(selected.id, { rotation: parseInt(e.target.value, 10) })
              }
              className="w-full accent-mm-neon"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Opacidad — {Math.round(selected.opacity * 100)}%
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round(selected.opacity * 100)}
              onChange={(e) =>
                updateLayer(selected.id, { opacity: parseInt(e.target.value, 10) / 100 })
              }
              className="w-full accent-slate-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Color del texto</label>
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={c.label}
                  onClick={() => updateLayer(selected.id, { color: c.value })}
                  className={`w-full aspect-square rounded-lg border-2 ${
                    selected.color === c.value ? "border-mm-neon scale-110" : "border-white/15"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
            <input
              type="color"
              value={selected.color}
              onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
              className="w-full h-9 rounded-lg cursor-pointer bg-transparent"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Borde del texto — {selected.strokeWidth}px
            </label>
            <input
              type="range"
              min={0}
              max={12}
              value={selected.strokeWidth}
              onChange={(e) =>
                updateLayer(selected.id, { strokeWidth: parseInt(e.target.value, 10) })
              }
              className="w-full accent-yellow-500 mb-2"
            />
            <input
              type="color"
              value={selected.strokeColor}
              onChange={(e) => updateLayer(selected.id, { strokeColor: e.target.value })}
              className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Fondo detrás del texto</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Ninguno", value: null },
                { label: "Negro", value: "rgba(0,0,0,0.65)" },
                { label: "Blanco", value: "rgba(255,255,255,0.85)" },
                { label: "Rosa", value: "rgba(251,113,133,0.9)" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => updateLayer(selected.id, { backgroundColor: opt.value })}
                  className={`px-2 py-1 rounded-lg border text-xs ${
                    selected.backgroundColor === opt.value
                      ? "border-mm-neon text-white"
                      : "border-white/10 text-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Espaciado entre letras — {selected.letterSpacing}px
            </label>
            <input
              type="range"
              min={-2}
              max={20}
              value={selected.letterSpacing}
              onChange={(e) =>
                updateLayer(selected.id, { letterSpacing: parseInt(e.target.value, 10) })
              }
              className="w-full accent-cyan-500"
            />
          </div>
        </div>
      )}
      </aside>
      )}
    </div>
  );
}
