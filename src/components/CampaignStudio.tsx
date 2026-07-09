"use client";

import type { AdCampaignResult } from "@/lib/ai/campaign/schemas";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ImageIcon,
  Loader2,
  Megaphone,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useState } from "react";

export interface CampaignApplyPayload {
  brief: string;
  caption: string;
  hashtags: string;
  imagePrompt?: string;
  productName: string;
  applyId?: number;
}

interface CampaignStudioProps {
  storeName?: string;
  category?: string;
  onApply: (payload: CampaignApplyPayload) => void;
}

type ReviewTab = "variants" | "aida" | "images" | "hashtags";

const TONE_PRESETS = [
  "profesional, moderno, confiable",
  "cercano, juvenil, dinámico",
  "premium, elegante, exclusivo",
  "urgente, directo, promocional",
];

export function CampaignStudio({ storeName, category, onApply }: CampaignStudioProps) {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<AdCampaignResult | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [tab, setTab] = useState<ReviewTab>("variants");

  const [product, setProduct] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [brandTone, setBrandTone] = useState(TONE_PRESETS[0]);
  const [campaignGoals, setCampaignGoals] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "facebook" | "both">("instagram");
  const [imageLoadingId, setImageLoadingId] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<
    Record<string, { imageUrl: string; revisedPrompt: string }>
  >({});

  async function generateCampaign() {
    if (!product.trim() || !targetAudience.trim() || !campaignGoals.trim()) {
      setError("Completa producto, público objetivo y objetivos de campaña");
      return;
    }

    setLoading(true);
    setError(null);
    setCampaign(null);

    try {
      const res = await fetch("/api/campaigns/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product.trim(),
          targetAudience: targetAudience.trim(),
          brandTone: brandTone.trim(),
          campaignGoals: campaignGoals.trim(),
          platform,
          storeName,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo generar la campaña");
      }

      const result = data.campaign as AdCampaignResult;
      setCampaign(result);
      setSelectedVariantId(result.adVariants[0]?.id ?? null);
      setTab("variants");
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar campaña");
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string) {
    void navigator.clipboard.writeText(text);
  }

  async function generateHdImage(promptId: string, concept: string) {
    if (!product.trim()) {
      setError("Indica el producto antes de generar la imagen HD");
      return;
    }
    setImageLoadingId(promptId);
    setError(null);
    try {
      const res = await fetch("/api/ad-images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept,
          product: product.trim(),
          size: "1024x1024",
          lighting: "auto",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar la imagen");
      setGeneratedImages((prev) => ({
        ...prev,
        [promptId]: {
          imageUrl: data.imageUrl.startsWith("/")
            ? data.imageUrl
            : data.imageUrl,
          revisedPrompt: data.revisedPrompt ?? concept,
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar imagen HD");
    } finally {
      setImageLoadingId(null);
    }
  }

  function applySelectedVariant() {
    if (!campaign) return;
    const variant =
      campaign.adVariants.find((v) => v.id === selectedVariantId) ??
      campaign.adVariants[0];
    if (!variant) return;

    const hashtags = campaign.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
    const caption = `${variant.hook}\n\n${variant.body}\n\n${variant.cta}`;
    const brief = [
      product,
      campaignGoals,
      `Público: ${targetAudience}`,
      `Tono: ${brandTone}`,
      variant.hook,
    ].join(". ");

    const imagePrompt = campaign.imagePrompts[0]?.prompt;

    onApply({
      brief,
      caption,
      hashtags,
      imagePrompt,
      productName: product,
      applyId: Date.now(),
    });
  }

  const selectedVariant = campaign?.adVariants.find((v) => v.id === selectedVariantId);

  return (
    <section className="mm-card p-6 mb-8 border-mm-yellow/20">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mm-yellow/30 to-mm-neon/20 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-mm-yellow" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Campaña con IA (AIDA)</h2>
            <p className="text-xs text-neutral-500">
              Copy de agencia + prompts de imagen · modelo gpt-4o
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-neutral-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-500" />
        )}
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Producto / servicio *</label>
              <input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Ej: Diseño web responsive para empresas"
                className="mm-input"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Público objetivo *</label>
              <input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Ej: PYMEs en Santiago que venden online"
                className="mm-input"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Tono de marca</label>
              <select
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                className="mm-input"
              >
                {TONE_PRESETS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Plataforma</label>
              <select
                value={platform}
                onChange={(e) =>
                  setPlatform(e.target.value as "instagram" | "facebook" | "both")
                }
                className="mm-input"
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="both">Ambas</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-neutral-400 mb-1">
                Objetivos de campaña *
              </label>
              <textarea
                value={campaignGoals}
                onChange={(e) => setCampaignGoals(e.target.value)}
                rows={2}
                placeholder="Ej: Generar leads, aumentar cotizaciones, promocionar lanzamiento…"
                className="mm-input resize-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={generateCampaign}
            disabled={loading}
            className="w-full py-3 rounded-xl mm-btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando campaña AIDA… (~15 s)
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generar campaña publicitaria
              </>
            )}
          </button>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {campaign && (
            <div className="space-y-4 border-t border-mm-neon/10 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-white font-semibold">{campaign.campaignName}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {campaign.metadata.model} · {(campaign.metadata.durationMs / 1000).toFixed(1)}s
                  </p>
                </div>
                <button
                  type="button"
                  onClick={applySelectedVariant}
                  disabled={!selectedVariant}
                  className="px-4 py-2 rounded-xl bg-mm-neon text-black text-sm font-semibold hover:bg-mm-neon-dim disabled:opacity-50 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Usar en publicación
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["variants", "Variantes", Megaphone],
                    ["aida", "AIDA", Target],
                    ["images", "Prompts imagen", ImageIcon],
                    ["hashtags", "Hashtags", Sparkles],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                      tab === id
                        ? "bg-mm-yellow/15 text-mm-yellow border border-mm-yellow/30"
                        : "text-neutral-400 border border-white/10 hover:border-mm-neon/20"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {tab === "variants" && (
                <div className="grid gap-3">
                  {campaign.adVariants.map((variant) => (
                    <div
                      key={variant.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedVariantId(variant.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedVariantId(variant.id);
                        }
                      }}
                      className={`text-left p-4 rounded-xl border transition cursor-pointer ${
                        selectedVariantId === variant.id
                          ? "border-mm-neon/50 bg-mm-neon/5 mm-glow-neon"
                          : "border-white/10 hover:border-mm-neon/25 bg-mm-surface/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-wide text-mm-yellow font-medium">
                          {variant.platform} · {variant.id}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyText(`${variant.hook}\n\n${variant.body}\n\n${variant.cta}`);
                          }}
                          className="text-neutral-500 hover:text-mm-neon p-1"
                          title="Copiar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-white font-semibold mt-2">{variant.hook}</p>
                      <p className="text-neutral-300 text-sm mt-2 whitespace-pre-wrap leading-relaxed">
                        {variant.body}
                      </p>
                      <p className="text-mm-neon text-sm font-medium mt-3">{variant.cta}</p>
                    </div>
                  ))}
                </div>
              )}

              {tab === "aida" && (
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <AidaBlock
                    title="Atención — Hooks"
                    items={campaign.aida.attention.hooks}
                    color="text-mm-yellow"
                  />
                  <div className="p-4 rounded-xl bg-mm-surface border border-white/10">
                    <p className="text-mm-neon text-xs font-semibold uppercase mb-2">Interés</p>
                    <p className="text-neutral-200 leading-relaxed">{campaign.aida.interest.body}</p>
                    <ul className="mt-3 space-y-1 text-neutral-400">
                      {campaign.aida.interest.keyPoints.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-mm-surface border border-white/10">
                    <p className="text-amber-400 text-xs font-semibold uppercase mb-2">Deseo</p>
                    <ul className="space-y-1 text-neutral-300">
                      {campaign.aida.desire.emotionalTriggers.map((t) => (
                        <li key={t}>• {t}</li>
                      ))}
                    </ul>
                    {campaign.aida.desire.socialProof && (
                      <p className="text-neutral-500 text-xs mt-3 italic">
                        {campaign.aida.desire.socialProof}
                      </p>
                    )}
                  </div>
                  <AidaBlock title="Acción — CTAs" items={campaign.aida.action.ctas} color="text-mm-neon" />
                </div>
              )}

              {tab === "images" && (
                <div className="space-y-3">
                  {campaign.imagePrompts.map((img) => (
                    <div
                      key={img.id}
                      className="p-4 rounded-xl bg-mm-surface border border-white/10"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-white font-medium">{img.title}</p>
                        <button
                          type="button"
                          onClick={() => copyText(img.prompt)}
                          className="text-neutral-500 hover:text-mm-neon p-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500 mb-2">
                        {img.style} · {img.mood} · {img.aspectRatio}
                      </p>
                      <p className="text-sm text-neutral-300 leading-relaxed font-mono text-[13px]">
                        {img.prompt}
                      </p>
                      <p className="text-xs text-red-400/70 mt-2">Avoid: {img.negativePrompt}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={imageLoadingId !== null}
                          onClick={() => generateHdImage(img.id, img.prompt)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-mm-yellow/15 text-mm-yellow border border-mm-yellow/30 hover:bg-mm-yellow/25 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {imageLoadingId === img.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Generando HD…
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3.5 h-3.5" />
                              Generar imagen HD
                            </>
                          )}
                        </button>
                      </div>
                      {generatedImages[img.id] && (
                        <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                          <img
                            src={generatedImages[img.id].imageUrl}
                            alt={img.title}
                            className="w-full max-w-sm rounded-xl border border-mm-neon/20"
                          />
                          <details className="text-xs">
                            <summary className="text-neutral-500 cursor-pointer hover:text-mm-neon">
                              Prompt final (auditoría)
                            </summary>
                            <p className="mt-2 text-neutral-400 font-mono leading-relaxed whitespace-pre-wrap">
                              {generatedImages[img.id].revisedPrompt}
                            </p>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === "hashtags" && (
                <div className="p-4 rounded-xl bg-mm-surface border border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {campaign.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full bg-mm-neon/10 text-mm-neon text-sm border border-mm-neon/20"
                      >
                        #{tag.replace(/^#/, "")}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        campaign.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")
                      )
                    }
                    className="mt-4 text-xs text-neutral-400 hover:text-mm-yellow flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar todos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function AidaBlock({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-mm-surface border border-white/10">
      <p className={`text-xs font-semibold uppercase mb-2 ${color}`}>{title}</p>
      <ul className="space-y-2 text-neutral-200">
        {items.map((item) => (
          <li key={item} className="leading-snug">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
