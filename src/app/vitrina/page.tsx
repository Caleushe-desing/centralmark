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
      <div className="flex min-h-screen items-center justify-center bg-[#0F2B5B]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  const offer = data.offers[current];
  const primary = data.mall?.primaryColor ?? "#E11D48";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 50%, ${primary}, transparent 60%)`,
        }}
      />

      <header className="relative z-10 flex items-center justify-between bg-[#0F2B5B] p-8 text-white shadow-md">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">CentralMark</p>
          <h1 className="text-4xl font-black">{data.mall?.name ?? "CentralMark"}</h1>
          <p className="mt-1 text-lg text-blue-100">{data.mall?.tagline}</p>
        </div>
        <div className="flex items-center gap-2 text-blue-100">
          <Sparkles className="h-6 w-6" />
          <span className="text-lg font-semibold">Ofertas del día</span>
        </div>
      </header>

      {offer ? (
        <main className="relative z-10 flex items-center justify-center px-8 py-4 min-h-[calc(100vh-120px)]">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl w-full">
            {offer.content?.imagePath && (
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
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
              <p className="mb-2 text-2xl font-medium text-[#2563EB]">{offer.store.name}</p>
              <h2 className="text-5xl font-black leading-tight text-[#0F2B5B] lg:text-7xl">
                {offer.productName}
              </h2>
              <p
                className="text-8xl lg:text-9xl font-black mt-6"
                style={{ color: primary }}
              >
                {offer.discountPercent}%
              </p>
              <p className="mt-4 text-3xl font-light text-slate-600">DE DESCUENTO</p>
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
                i === current ? "w-8 bg-[#2563EB]" : "bg-slate-300"
              }`}
            />
          ))}
        </footer>
      )}
    </div>
  );
}
