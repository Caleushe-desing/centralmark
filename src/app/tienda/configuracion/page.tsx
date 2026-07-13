"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Link2, Save, Share2, Unlink, Store } from "lucide-react";
import { STORE_RUBROS, getStoreRubroDefinition } from "@/lib/store/rubros";

interface StoreSettings {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  rubro: string;
  category: string;
  previewImageUrl: string | null;
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
      setRemovePreview(false);
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
    if (removePreview) formData.set("removePreviewImage", "true");

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
      setRemovePreview(false);
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
      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="w-8 h-8 border-2 border-mm-neon border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const savedRubro = store.rubro ?? "fashion";
  const rubroUnsaved = savedRubro !== rubro;
  const rubroDefaultImage = getStoreRubroDefinition(rubro).defaultSampleImageUrl;
  const previewDisplayUrl =
    store.previewImageUrl && !removePreview ? store.previewImageUrl : rubroDefaultImage;

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Configuración</h1>
        <p className="text-slate-400 mt-1">
          Datos de tu tienda y conexión a redes para publicar ofertas.
        </p>
      </div>

      {metaMessage && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm ${
            metaMessage.includes("conectad") || metaMessage.includes("¡")
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-200 border border-amber-500/30"
          }`}
        >
          {metaMessage}
        </div>
      )}

      {pagePicker && (
        <section className="mb-6 p-6 rounded-2xl border border-mm-neon/40 bg-mm-neon/10 space-y-3">
          <h2 className="text-lg font-semibold text-white">Elige tu página de Facebook</h2>
          <p className="text-xs text-slate-400">
            Selecciona la página vinculada a tu Instagram Business.
          </p>
          {pagePicker.pages.map((p) => (
            <button
              key={p.pageId}
              type="button"
              disabled={picking}
              onClick={() => selectPage(p.pageId)}
              className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-mm-neon/50 bg-slate-900/80 transition"
            >
              <p className="font-medium text-white">{p.pageName}</p>
              <p className="text-xs text-slate-500 mt-1">
                {p.hasInstagram
                  ? `Instagram: @${p.igUsername ?? "vinculado"}`
                  : "Sin Instagram Business — puedes publicar solo en Facebook"}
              </p>
            </button>
          ))}
        </section>
      )}

      <section className="mb-6 p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Link2 className="w-5 h-5 text-mm-neon" />
          Redes sociales
        </h2>
        <p className="text-xs text-slate-500">{social?.redirectHint}</p>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-sm text-white font-medium">
            <Share2 className="w-4 h-4 text-mm-neon" />
            Facebook + Instagram
          </div>

          {social?.meta.connected ? (
            <div className="space-y-2">
              <p className="text-sm text-emerald-300">Conectado</p>
              <p className="text-xs text-slate-400">
                Página: {social.meta.pageName}
                {social.meta.igUsername && (
                  <> · Instagram @{social.meta.igUsername}</>
                )}
              </p>
              <button
                type="button"
                onClick={disconnectMeta}
                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300"
              >
                <Unlink className="w-3.5 h-3.5" />
                Desconectar
              </button>
            </div>
          ) : social?.oauthAvailable ? (
            <a
              href="/api/meta/connect"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500"
            >
              <Share2 className="w-4 h-4" />
              Conectar con Facebook
            </a>
          ) : (
            <p className="text-xs text-amber-400">
              OAuth no disponible — contacta al administrador del mall.
            </p>
          )}

          {!social?.meta.connected && (
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setManualOpen((v) => !v)}
                className="text-xs text-slate-400 hover:text-slate-300 underline"
              >
                {manualOpen
                  ? "Ocultar conexión manual"
                  : "OAuth no funciona — conectar página vigente manualmente"}
              </button>

              {manualOpen && (
                <form onSubmit={connectManual} className="mt-3 space-y-3">
                  <p className="text-xs text-slate-500">
                    Temporal hasta App Review de Meta. Obtén el token en{" "}
                    <a
                      href="https://developers.facebook.com/tools/explorer/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mm-neon hover:underline"
                    >
                      Explorador Graph API
                    </a>{" "}
                    → Usuario o página → token de tu página.
                  </p>
                  <input
                    value={manualPageId}
                    onChange={(e) => setManualPageId(e.target.value)}
                    placeholder="ID de página Facebook"
                    className="w-full bg-mm-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={manualIgId}
                    onChange={(e) => setManualIgId(e.target.value)}
                    placeholder="ID cuenta Instagram (opcional si está vinculada)"
                    className="w-full bg-mm-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                  <textarea
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    required
                    rows={3}
                    placeholder="Token de acceso de la página (EAAG...)"
                    className="w-full bg-mm-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                  <button
                    type="submit"
                    disabled={manualLoading || !manualToken.trim()}
                    className="px-4 py-2 rounded-lg bg-mm-neon text-black text-sm font-medium hover:brightness-110 disabled:opacity-50"
                  >
                    {manualLoading ? "Validando..." : "Guardar conexión"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-white/10 opacity-70">
          <p className="text-sm text-slate-400 font-medium">TikTok</p>
          <p className="text-xs text-slate-600 mt-1">{social?.tiktok.message}</p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <h2 className="text-lg font-semibold text-white">Nombre de la tienda</h2>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ej: Sneaker Zone"
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600"
          />
          <p className="text-xs text-slate-500">Aparece en tus publicaciones junto al mall {store.mall.name}</p>
        </section>

        <section className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-mm-neon" />
            Rubro de tu tienda
          </h2>
          <p className="text-xs text-slate-500">
            Define el tipo de negocio. Las muestras de arquetipos usarán fotos y textos acordes a este
            rubro (sin gastar crédito de IA).
          </p>
          <select
            name="rubro"
            value={rubro}
            onChange={(e) => {
              setRubro(e.target.value);
              setRemovePreview(true);
              setSaved(false);
              setSaveError(null);
              setSaveNotice(null);
            }}
            className={`w-full bg-slate-900 border rounded-xl px-4 py-3 text-white ${
              rubroUnsaved ? "border-amber-400/60 ring-1 ring-amber-400/30" : "border-white/10"
            }`}
          >
            {STORE_RUBROS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          {rubroUnsaved && (
            <div
              role="status"
              className="flex gap-3 p-4 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-100"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-300 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-amber-50">
                  Cambiaste el rubro a{" "}
                  <strong>{getStoreRubroDefinition(rubro).label}</strong>
                </p>
                <p className="text-amber-200/90 text-xs leading-relaxed">
                  La vista previa ya se actualizó aquí, pero{" "}
                  <strong className="text-amber-100">debes pulsar Guardar</strong> para que las
                  muestras de arquetipo en <em>Mis Ofertas</em> usen el nuevo rubro.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <h2 className="text-lg font-semibold text-white">Foto de muestra (opcional)</h2>
          <p className="text-xs text-slate-500">
            Sube una foto de tu producto (ej. par de zapatillas si vendes calzado). Reemplaza la imagen
            por defecto del rubro en las tarjetas de arquetipo. Sin costo de IA.
          </p>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-slate-900 border border-white/10">
              <Image
                key={previewDisplayUrl}
                src={previewDisplayUrl}
                alt="Vista previa del rubro"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2 text-xs text-slate-500">
              <p>
                {store.previewImageUrl && !removePreview
                  ? "Foto personalizada activa"
                  : `Vista previa del rubro: ${getStoreRubroDefinition(rubro).label}`}
              </p>
              <input
                name="previewImage"
                type="file"
                accept="image/*"
                onChange={() => setRemovePreview(false)}
                className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-mm-neon/20 file:text-mm-neon"
              />
              {store.previewImageUrl && !removePreview && (
                <button
                  type="button"
                  onClick={() => setRemovePreview(true)}
                  className="block text-xs text-red-400 hover:text-red-300"
                >
                  Quitar foto personalizada (usar imagen del rubro)
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <h2 className="text-lg font-semibold text-white">Paleta de marca</h2>
          <p className="text-xs text-slate-500">
            La IA usa estos colores como acentos en tus publicaciones (textos y composición).
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-sm text-slate-400">Color primario</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono"
                />
              </div>
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-slate-400">Color secundario</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="secondaryColor"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono"
                />
              </div>
            </label>
          </div>
        </section>

        <section className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <h2 className="text-lg font-semibold text-white">Logo</h2>
          <div className="flex items-center gap-6">
            {store.logoUrl ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                <Image src={store.logoUrl} alt="Logo" fill className="object-contain p-2" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl bg-slate-900 border border-dashed border-white/20 flex items-center justify-center text-slate-600 text-xs text-center px-2">
                Sin logo
              </div>
            )}
            <input
              name="logo"
              type="file"
              accept="image/*"
              className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-mm-neon/20 file:text-mm-neon"
            />
          </div>
          <p className="text-xs text-slate-500">
            Se superpone automáticamente en la esquina superior derecha de cada publicación.
          </p>
        </section>

        {saveNotice && (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm"
          >
            {saveNotice}
          </div>
        )}

        {saveError && (
          <div
            role="alert"
            className="flex gap-3 p-4 rounded-xl bg-red-500/15 border border-red-500/35 text-red-200 text-sm"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-300" />
            <p>{saveError}</p>
          </div>
        )}

        {rubroUnsaved && (
          <p className="text-sm text-amber-300/90 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Tienes un cambio de rubro sin guardar.
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl mm-btn-primary disabled:opacity-50 transition ${
            rubroUnsaved ? "mm-glow-neon ring-2 ring-amber-400/50" : "mm-glow-neon"
          }`}
        >
          <Save className="w-5 h-5" />
          {loading
            ? "Guardando..."
            : saved && !rubroUnsaved
              ? "¡Guardado!"
              : rubroUnsaved
                ? "Guardar rubro"
                : "Guardar"}
        </button>
        {rubroUnsaved && (
          <p className="text-xs text-slate-500">
            Pulsa <strong className="text-amber-200/90">Guardar rubro</strong> para aplicar el cambio en Mis Ofertas.
          </p>
        )}
      </form>
    </main>
  );
}

export default function ConfiguracionPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-lg mx-auto px-6 py-10">
          <div className="w-8 h-8 border-2 border-mm-neon border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <ConfiguracionContent />
    </Suspense>
  );
}
