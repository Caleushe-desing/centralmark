"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Link2, Save, Share2, Unlink } from "lucide-react";
import { ColorPalettePicker } from "@/components/settings/ColorPalettePicker";
import { LogoUploader } from "@/components/settings/LogoUploader";
import { RubroGridPicker } from "@/components/settings/RubroGridPicker";
import { ProductAssortmentPicker } from "@/components/settings/ProductAssortmentPicker";
import { getStoreRubroDefinition } from "@/lib/store/rubros";

interface StoreSettings {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  rubro: string;
  category: string;
  previewImageUrl: string | null;
  soldProductIds?: string;
  soldProductsOther?: string | null;
  mall: { name: string; fixedHashtags: string };
}

interface SocialStatus {
  meta: {
    connected: boolean;
    pageName: string | null;
    igUsername: string | null;
    connectedAt: string | null;
  };
  tiktok: {
    connected: boolean;
    username: string | null;
    available: boolean;
    message: string;
  };
  oauthAvailable: boolean;
  redirectHint: string;
}

interface PageOption {
  pageId: string;
  pageName: string;
  igUsername: string | null;
  hasInstagram: boolean;
}

function ConfiguracionContent() {
  const searchParams = useSearchParams();
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [social, setSocial] = useState<SocialStatus | null>(null);
  const [name, setName] = useState("");
  const [rubro, setRubro] = useState("fashion");
  const [primaryColor, setPrimaryColor] = useState("#E11D48");
  const [secondaryColor, setSecondaryColor] = useState("#1E1B4B");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removePreview, setRemovePreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [metaMessage, setMetaMessage] = useState<string | null>(null);
  const [pagePicker, setPagePicker] = useState<{
    pendingId: string;
    pages: PageOption[];
  } | null>(null);
  const [picking, setPicking] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualPageId, setManualPageId] = useState("106745052475907");
  const [manualToken, setManualToken] = useState("");
  const [manualIgId, setManualIgId] = useState("17841462337526610");
  const [manualLoading, setManualLoading] = useState(false);
  const [soldProductIds, setSoldProductIds] = useState<string[]>([]);
  const [soldProductsOther, setSoldProductsOther] = useState("");

  const loadSocial = useCallback(async () => {
    const res = await fetch("/api/store/social");
    if (res.ok) setSocial(await res.json());
  }, []);

  const load = useCallback(async () => {
    const res = await fetch("/api/store/settings");
    if (res.ok) {
      const data = await res.json();
      setStore(data);
      setName(data.name);
      setRubro(data.rubro ?? "fashion");
      setPrimaryColor(data.primaryColor ?? "#E11D48");
      setSecondaryColor(data.secondaryColor ?? "#1E1B4B");
      try {
        const parsed = JSON.parse(data.soldProductIds ?? "[]") as unknown;
        setSoldProductIds(
          Array.isArray(parsed)
            ? parsed.filter((x): x is string => typeof x === "string")
            : []
        );
      } catch {
        setSoldProductIds([]);
      }
      setSoldProductsOther(data.soldProductsOther ?? "");
      setRemovePreview(false);
      setLogoFile(null);
    }
    await loadSocial();
  }, [loadSocial]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const err = searchParams.get("meta_error");
    const ok = searchParams.get("meta_success");
    const pick = searchParams.get("meta_pick");

    if (err) setMetaMessage(err);
    if (ok) setMetaMessage("¡Facebook e Instagram conectados correctamente!");

    if (pick) {
      fetch(`/api/meta/complete?pendingId=${pick}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.pages) setPagePicker({ pendingId: pick, pages: data.pages });
          else setMetaMessage(data.error ?? "No se pudieron cargar las páginas");
        });
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setSaveError(null);
    setSaveNotice(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("name", name);
    formData.set("rubro", rubro);
    formData.set("primaryColor", primaryColor);
    formData.set("secondaryColor", secondaryColor);
    formData.set("soldProductIds", JSON.stringify(soldProductIds));
    formData.set("soldProductsOther", soldProductsOther);
    if (removePreview) formData.set("removePreviewImage", "true");
    if (logoFile) formData.set("logo", logoFile);

    const previousRubro = store?.rubro ?? "fashion";

    try {
      const res = await fetch("/api/store/settings", { method: "PATCH", body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSaveError(
          typeof data.error === "string"
            ? data.error
            : "No se pudo guardar. Intenta de nuevo."
        );
        return;
      }

      setStore(data);
      setName(data.name);
      setRubro(data.rubro ?? "fashion");
      setPrimaryColor(data.primaryColor ?? "#E11D48");
      setSecondaryColor(data.secondaryColor ?? "#1E1B4B");
      try {
        const parsed = JSON.parse(data.soldProductIds ?? "[]") as unknown;
        setSoldProductIds(
          Array.isArray(parsed)
            ? parsed.filter((x): x is string => typeof x === "string")
            : []
        );
      } catch {
        setSoldProductIds([]);
      }
      setSoldProductsOther(data.soldProductsOther ?? "");
      setRemovePreview(false);
      setLogoFile(null);
      setSaved(true);

      if (previousRubro !== (data.rubro ?? "fashion")) {
        setSaveNotice(
          `Rubro guardado: ${getStoreRubroDefinition(data.rubro).label}. Las muestras en Mis Ofertas ya usan este rubro.`
        );
      }
    } catch {
      setSaveError("Error de conexión. Revisa tu red e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function disconnectMeta() {
    if (!confirm("¿Desconectar Facebook e Instagram de esta tienda?")) return;
    await fetch("/api/store/social", { method: "DELETE" });
    setMetaMessage("Redes desconectadas");
    await loadSocial();
  }

  async function connectManual(e: React.FormEvent) {
    e.preventDefault();
    setManualLoading(true);
    const res = await fetch("/api/store/social/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId: manualPageId.trim(),
        accessToken: manualToken.trim(),
        igAccountId: manualIgId.trim() || undefined,
      }),
    });
    setManualLoading(false);
    const data = await res.json();
    if (res.ok) {
      setManualOpen(false);
      setManualToken("");
      setMetaMessage(`¡Conectado! Página: ${data.pageName}`);
      await loadSocial();
    } else {
      setMetaMessage(data.error ?? "No se pudo conectar");
    }
  }

  async function selectPage(pageId: string) {
    if (!pagePicker) return;
    setPicking(true);
    const res = await fetch("/api/meta/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingId: pagePicker.pendingId, pageId }),
    });
    setPicking(false);
    if (res.ok) {
      setPagePicker(null);
      setMetaMessage("¡Cuentas conectadas!");
      await loadSocial();
    } else {
      const data = await res.json();
      setMetaMessage(data.error ?? "Error al guardar");
    }
  }

  if (!store) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
      </main>
    );
  }

  const savedRubro = store.rubro ?? "fashion";
  const rubroUnsaved = savedRubro !== rubro;
  const rubroDefaultImage = getStoreRubroDefinition(rubro).defaultSampleImageUrl;
  const previewDisplayUrl =
    store.previewImageUrl && !removePreview ? store.previewImageUrl : rubroDefaultImage;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
          Identidad de marca
        </p>
        <h1 className="cm-page-title mt-1">Configuración de tu tienda</h1>
        <p className="cm-page-subtitle">
          Define logo, colores, rubro y los productos que vendés. La IA usará esa información en
          cada publicación para {store.mall.name}.
        </p>
      </div>

      {metaMessage && (
        <div
          className={`mb-6 rounded-xl border p-4 text-sm ${
            metaMessage.includes("conectad") || metaMessage.includes("¡")
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {metaMessage}
        </div>
      )}

      {pagePicker && (
        <section className="cm-card mb-6 space-y-3 p-6 border-blue-200 bg-blue-50/30">
          <h2 className="text-lg font-semibold text-[#0F2B5B]">Elige tu página de Facebook</h2>
          <p className="text-xs text-slate-600">
            Selecciona la página vinculada a tu Instagram Business.
          </p>
          {pagePicker.pages.map((p) => (
            <button
              key={p.pageId}
              type="button"
              disabled={picking}
              onClick={() => selectPage(p.pageId)}
              className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-[#2563EB] hover:shadow-sm"
            >
              <p className="font-medium text-[#0F2B5B]">{p.pageName}</p>
              <p className="mt-1 text-xs text-slate-500">
                {p.hasInstagram
                  ? `Instagram: @${p.igUsername ?? "vinculado"}`
                  : "Sin Instagram Business — puedes publicar solo en Facebook"}
              </p>
            </button>
          ))}
        </section>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="cm-card p-6">
          <LogoUploader currentLogoUrl={store.logoUrl} onFileChange={setLogoFile} />
        </section>

        <section className="cm-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0F2B5B]">Nombre de la tienda</h2>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ej: Sneaker Zone"
            className="cm-input"
          />
          <p className="text-xs text-slate-500">
            Aparece en tus publicaciones junto al mall {store.mall.name}
          </p>
        </section>

        <section className="cm-card p-6">
          <ColorPalettePicker
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onPrimaryChange={setPrimaryColor}
            onSecondaryChange={setSecondaryColor}
          />
          <input type="hidden" name="primaryColor" value={primaryColor} />
          <input type="hidden" name="secondaryColor" value={secondaryColor} />
        </section>

        <section className="cm-card p-6 space-y-4">
          <RubroGridPicker
            value={rubro}
            onChange={(id) => {
              setRubro(id);
              setRemovePreview(true);
              setSaved(false);
              setSaveError(null);
              setSaveNotice(null);
            }}
          />
          <input type="hidden" name="rubro" value={rubro} />
          {rubroUnsaved && (
            <div
              role="status"
              className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900"
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  Cambiaste el rubro a <strong>{getStoreRubroDefinition(rubro).label}</strong>
                </p>
                <p className="text-xs leading-relaxed text-amber-800">
                  Pulsa <strong>Guardar cambios</strong> para aplicarlo en Mis Ofertas.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="cm-card p-6">
          <ProductAssortmentPicker
            selectedIds={soldProductIds}
            otherText={soldProductsOther}
            onChangeIds={setSoldProductIds}
            onChangeOther={setSoldProductsOther}
          />
        </section>

        <section className="cm-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0F2B5B]">Foto de producto de referencia</h2>
          <p className="text-sm text-slate-600">
            Opcional. Sube una foto representativa de tu negocio para las vistas previas. Sin costo
            de IA.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <Image
                key={previewDisplayUrl}
                src={previewDisplayUrl}
                alt="Vista previa del rubro"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                {store.previewImageUrl && !removePreview
                  ? "Foto personalizada activa"
                  : `Imagen del rubro: ${getStoreRubroDefinition(rubro).label}`}
              </p>
              <input
                name="previewImage"
                type="file"
                accept="image/*"
                onChange={() => setRemovePreview(false)}
                className="text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#2563EB]"
              />
              {store.previewImageUrl && !removePreview && (
                <button
                  type="button"
                  onClick={() => setRemovePreview(true)}
                  className="block text-xs text-red-600 hover:text-red-700"
                >
                  Quitar foto personalizada
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="cm-card space-y-4 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0F2B5B]">
            <Link2 className="h-5 w-5 text-[#2563EB]" />
            Redes sociales
          </h2>
          <p className="text-xs text-slate-500">{social?.redirectHint}</p>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#0F2B5B]">
              <Share2 className="h-4 w-4 text-[#2563EB]" />
              Facebook + Instagram
            </div>

            {social?.meta.connected ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-emerald-700">Conectado</p>
                <p className="text-xs text-slate-600">
                  Página: {social.meta.pageName}
                  {social.meta.igUsername && <> · Instagram @{social.meta.igUsername}</>}
                </p>
                <button
                  type="button"
                  onClick={disconnectMeta}
                  className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  Desconectar
                </button>
              </div>
            ) : social?.oauthAvailable ? (
              <a
                href="/api/meta/connect"
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8]"
              >
                <Share2 className="h-4 w-4" />
                Conectar con Facebook
              </a>
            ) : (
              <p className="text-xs text-amber-700">
                OAuth no disponible — contacta al administrador del mall.
              </p>
            )}

            {!social?.meta.connected && (
              <div className="border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => setManualOpen((v) => !v)}
                  className="text-xs text-slate-500 underline hover:text-slate-700"
                >
                  {manualOpen ? "Ocultar conexión manual" : "Conectar página manualmente"}
                </button>

                {manualOpen && (
                  <form onSubmit={connectManual} className="mt-3 space-y-3">
                    <input
                      value={manualPageId}
                      onChange={(e) => setManualPageId(e.target.value)}
                      placeholder="ID de página Facebook"
                      className="cm-input text-sm"
                    />
                    <input
                      value={manualIgId}
                      onChange={(e) => setManualIgId(e.target.value)}
                      placeholder="ID cuenta Instagram (opcional)"
                      className="cm-input text-sm"
                    />
                    <textarea
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      required
                      rows={3}
                      placeholder="Token de acceso (EAAG...)"
                      className="cm-input font-mono text-sm"
                    />
                    <button
                      type="submit"
                      disabled={manualLoading || !manualToken.trim()}
                      className="cm-btn-primary disabled:opacity-50"
                    >
                      {manualLoading ? "Validando..." : "Guardar conexión"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 opacity-80">
            <p className="text-sm font-medium text-slate-600">TikTok</p>
            <p className="mt-1 text-xs text-slate-500">{social?.tiktok.message}</p>
          </div>
        </section>

        {saveNotice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {saveNotice}
          </div>
        )}

        {saveError && (
          <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>{saveError}</p>
          </div>
        )}

        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            {rubroUnsaved && (
              <p className="flex items-center gap-2 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                Tienes cambios sin guardar
              </p>
            )}
            {saved && !rubroUnsaved && (
              <p className="text-sm text-emerald-700">Configuración guardada correctamente</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="cm-btn-primary inline-flex items-center justify-center gap-2 px-8 py-3"
          >
            <Save className="h-5 w-5" />
            {loading ? "Guardando..." : saved && !rubroUnsaved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default function ConfiguracionPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-6 py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        </main>
      }
    >
      <ConfiguracionContent />
    </Suspense>
  );
}
