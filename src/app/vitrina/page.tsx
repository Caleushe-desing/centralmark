"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

interface VitrinaOffer {
  id: string;
  productName: string;
  discountPercent: number;
  store: { name: string };
  content?: { imagePath: string } | null;
}

interface VitrinaData {
  mall: { name: string; tagline: string | null; primaryColor: string } | null;
  offers: VitrinaOffer[];
}

export default function VitrinaPage() {
  const [data, setData] = useState<VitrinaData | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/vitrina")
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    if (!data?.offers.length) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % data.offers.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [data?.offers.length]);

  if (!data) {
    return (
      <div className="min-h-screen bg-mm-black flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-mm-neon animate-pulse" />
      </div>
    );
  }

  const offer = data.offers[current];
  const primary = data.mall?.primaryColor ?? "#E11D48";

  return (
    <div className="min-h-screen bg-mm-black overflow-hidden relative">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 50%, ${primary}, transparent 60%)`,
        }}
      />

      <header className="relative z-10 p-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">{data.mall?.name ?? "MarkMall"}</h1>
          <p className="text-slate-400 text-lg mt-1">{data.mall?.tagline}</p>
        </div>
        <div className="flex items-center gap-2 text-mm-neon">
          <Sparkles className="w-6 h-6" />
          <span className="text-lg font-semibold">Ofertas del día</span>
        </div>
      </header>

      {offer ? (
        <main className="relative z-10 flex items-center justify-center px-8 py-4 min-h-[calc(100vh-120px)]">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl w-full">
            {offer.content?.imagePath && (
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-mm-neon/20 border border-mm-neon/15">
                <Image
                  src={offer.content.imagePath}
                  alt={offer.productName}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div className="text-center lg:text-left">
              <p className="text-2xl text-mm-neon font-medium mb-2">{offer.store.name}</p>
              <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight">
                {offer.productName}
              </h2>
              <p
                className="text-8xl lg:text-9xl font-black mt-6"
                style={{ color: primary }}
              >
                {offer.discountPercent}%
              </p>
              <p className="text-3xl text-slate-300 mt-4 font-light">DE DESCUENTO</p>
            </div>
          </div>
        </main>
      ) : (
        <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <p className="text-2xl text-slate-500">No hay ofertas activas hoy</p>
        </main>
      )}

      {data.offers.length > 1 && (
        <footer className="relative z-10 p-6 flex justify-center gap-2">
          {data.offers.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition ${
                i === current ? "bg-mm-neon w-8" : "bg-white/20"
              }`}
            />
          ))}
        </footer>
      )}
    </div>
  );
}
