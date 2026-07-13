"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Scissors } from "lucide-react";
import { ProductPhotoInput, type ProcessedPhoto } from "@/components/ProductPhotoInput";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  imageUrl: string;
  imageNoBgUrl: string | null;
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedPhoto, setProcessedPhoto] = useState<ProcessedPhoto | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/products");
    if (res.ok) setProducts(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (processedPhoto) {
      formData.set("imageUrl", processedPhoto.imageUrl);
      formData.set("imageNoBgUrl", processedPhoto.imageNoBgUrl);
    } else {
      setError("Toma o sube una foto del producto");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/products", { method: "POST", body: formData });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al subir producto");
      setLoading(false);
      return;
    }

    e.currentTarget.reset();
    setProcessedPhoto(null);
    setShowForm(false);
    load();
    setLoading(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm("¿Eliminar este producto del catálogo?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="cm-page-title">Catálogo de Productos</h1>
          <p className="cm-page-subtitle">
            Sube fotos de tus productos — quitamos el fondo automáticamente para las publicaciones
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="cm-btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="cm-card mb-8 space-y-4 p-6"
        >
          <h2 className="text-lg font-semibold text-[#0F2B5B]">Agregar producto</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Nombre *</label>
              <input name="name" required className="cm-input" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Categoría</label>
              <input
                name="category"
                placeholder="Ej: Calzado, Ropa"
                className="cm-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Precio (opcional)</label>
              <input name="price" type="number" step="0.01" className="cm-input" />
            </div>
            <div className="sm:col-span-2">
              <ProductPhotoInput
                context="catalog"
                label="Foto del producto * (galería o cámara)"
                onProcessed={setProcessedPhoto}
                onClear={() => setProcessedPhoto(null)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Descripción</label>
            <textarea name="description" rows={2} className="cm-input resize-none" />
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5" />
            El fondo se quita al instante al tomar o subir la foto
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="cm-btn-primary disabled:opacity-50">
              {loading ? "Procesando imagen..." : "Guardar producto"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="cm-btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p>No hay productos en tu catálogo.</p>
          <p className="text-sm mt-1">Sube productos para usarlos en tus ofertas.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="cm-card group overflow-hidden"
            >
              <div className="relative aspect-square bg-slate-100">
                <Image
                  src={p.imageNoBgUrl ?? p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-contain p-4"
                />
                {p.imageNoBgUrl && (
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                    <Scissors className="w-3 h-3" />
                    Sin fondo
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="truncate font-semibold text-[#0F2B5B]">{p.name}</h3>
                {p.category && <p className="text-xs text-slate-500">{p.category}</p>}
                {p.price != null && (
                  <p className="mt-1 font-medium text-[#2563EB]">${p.price.toLocaleString("es-CL")}</p>
                )}
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="mt-3 flex items-center gap-1 text-xs text-red-600 opacity-0 transition hover:text-red-700 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
