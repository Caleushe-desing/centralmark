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
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Catálogo de Productos</h1>
          <p className="text-slate-400 mt-1">
            Sube fotos de tus productos — quitamos el fondo automáticamente para las publicaciones
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-mm-neon text-black text-sm hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4"
        >
          <h2 className="text-lg font-semibold text-white">Agregar producto</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nombre *</label>
              <input
                name="name"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Categoría</label>
              <input
                name="category"
                placeholder="Ej: Calzado, Ropa"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Precio (opcional)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white"
              />
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
            <label className="block text-sm text-slate-400 mb-1">Descripción</label>
            <textarea
              name="description"
              rows={2}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
            />
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5" />
            El fondo se quita al instante al tomar o subir la foto
          </p>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-mm-neon text-black text-sm hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Procesando imagen..." : "Guardar producto"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5"
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
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden group"
            >
              <div className="relative aspect-square bg-slate-900">
                <Image
                  src={p.imageNoBgUrl ?? p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-contain p-4"
                />
                {p.imageNoBgUrl && (
                  <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                    <Scissors className="w-3 h-3" />
                    Sin fondo
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white truncate">{p.name}</h3>
                {p.category && <p className="text-xs text-slate-500">{p.category}</p>}
                {p.price != null && (
                  <p className="text-mm-neon font-medium mt-1">${p.price.toLocaleString("es-CL")}</p>
                )}
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
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
