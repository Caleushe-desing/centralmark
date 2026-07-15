"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

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
      <div className="cm-app-bg flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
      </div>
    );
  }

  const offer = data.offers[current];
  const primary = data.mall?.primaryColor ?? "#2F6BFF";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F9FF]">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 30% 50%, ${primary}, transparent 60%)`,
        }}
      />

      <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#0B1B4D] px-6 py-5 text-white shadow-md sm:px-8">
        <div className="flex items-center gap-4">
          <BrandLogo className="h-9 w-auto brightness-0 invert" href="/" />
          <div className="border-l border-white/20 pl-4">
            <h1 className="text-xl font-bold sm:text-2xl">{data.mall?.name ?? "CentralMark"}</h1>
            <p className="text-sm text-blue-100">{data.mall?.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-blue-100">
          <Sparkles className="h-5 w-5" />
          <span className="hidden text-sm font-semibold sm:inline">Publicaciones del día</span>
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
          <p className="text-2xl text-slate-500">No hay publicaciones activas hoy</p>
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
