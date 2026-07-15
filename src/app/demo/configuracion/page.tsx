"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { DemoShell } from "@/components/demo/DemoShell";
import { ColorPalettePicker } from "@/components/settings/ColorPalettePicker";
import { ProductAssortmentPicker } from "@/components/settings/ProductAssortmentPicker";
import { RubroGridPicker } from "@/components/settings/RubroGridPicker";
import {
  type DemoSettings,
  loadDemoState,
  saveDemoState,
} from "@/lib/demo/store";
import { getStoreRubroDefinition } from "@/lib/store/rubros";

export default function DemoConfigPage() {
  const [settings, setSettings] = useState<DemoSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadDemoState().settings);
  }, []);

  if (!settings) {
    return (
      <div className="cm-app-bg flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
      </div>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const state = loadDemoState();
    state.settings = settings!;
    saveDemoState(state);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <DemoShell storeName={settings.name} mallName={settings.mallName}>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="cm-page-title">Configuración</h1>
          <p className="cm-page-subtitle">
            Misma configuración que en la app real. En la demo se guarda en tu navegador.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              1 · Identidad de marca
            </p>
            <div className="space-y-4">
              <section className="cm-card space-y-4 p-6">
                <h2 className="text-lg font-semibold text-[#0B1B4D]">Nombre de la tienda</h2>
                <input
                  className="cm-input"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  required
                />
              </section>
              <section className="cm-card p-6">
                <ColorPalettePicker
                  primaryColor={settings.primaryColor}
                  secondaryColor={settings.secondaryColor}
                  onPrimaryChange={(hex) => setSettings({ ...settings, primaryColor: hex })}
                  onSecondaryChange={(hex) => setSettings({ ...settings, secondaryColor: hex })}
                />
              </section>
              <section className="cm-card space-y-4 p-6">
                <RubroGridPicker
                  value={settings.rubro}
                  onChange={(id) => {
                    const def = getStoreRubroDefinition(id);
                    setSettings({
                      ...settings,
                      rubro: id,
                      category: def.categoryLabel,
                      previewImageUrl: null,
                    });
                  }}
                />
              </section>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              2 · Productos que vendes
            </p>
            <ProductAssortmentPicker
              selectedIds={settings.soldProductIds}
              otherText={settings.soldProductsOther}
              onChangeIds={(ids) => setSettings({ ...settings, soldProductIds: ids })}
              onChangeOther={(text) => setSettings({ ...settings, soldProductsOther: text })}
            />
          </div>

          <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            {saved && <p className="mr-auto self-center text-sm text-emerald-700">Guardado</p>}
            <button type="submit" className="cm-btn-primary inline-flex items-center gap-2 px-8 py-3">
              <Save className="h-5 w-5" />
              Guardar cambios
            </button>
          </div>
        </form>
      </main>
    </DemoShell>
  );
}
