"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Link2, Save, Share2, Unlink } from "lucide-react";

interface StoreSettings {
  name: string;
  logoUrl: string | null;
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
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
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

    const formData = new FormData(e.currentTarget);
    formData.set("name", name);

    const res = await fetch("/api/store/settings", { method: "PATCH", body: formData });

    if (res.ok) {
      const data = await res.json();
      setStore(data);
      setName(data.name);
      setSaved(true);
    }
    setLoading(false);
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

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl mm-btn-primary mm-glow-neon disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {loading ? "Guardando..." : saved ? "¡Guardado!" : "Guardar"}
        </button>
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
