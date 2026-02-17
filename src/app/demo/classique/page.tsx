"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";

export default function ClassicDemo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("meal");
  const [dispensing, setDispensing] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const filtered = products.filter((p) => p.category === category);

  const handleSlotClick = (productId: number) => {
    setDispensing(productId);
    setTimeout(() => setDispensing(null), 2000);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#1a1a2e] p-4">
      <Link href="/demo" className="mb-4 text-sm text-white/50 hover:text-white/80">
        ← Retour aux démos
      </Link>

      {/* Machine frame */}
      <div className="relative w-full max-w-4xl rounded-3xl border-[6px] border-[#3a3a5c] bg-gradient-to-b from-[#2a2a4a] to-[#1a1a2e] shadow-[0_0_60px_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.05)]">

        {/* Top panel — brand */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#0D9488] to-[#065F46] px-8 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            <span className="text-2xl font-bold text-white tracking-wide">SafeBox</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-black/30 px-4 py-2">
            <span className="text-sm text-green-300">💰</span>
            <span className="font-mono text-lg font-bold text-green-300">CHF 30.00</span>
          </div>
        </div>

        {/* Category selector — physical buttons */}
        <div className="flex justify-center gap-4 bg-[#2a2a4a] px-8 py-3 border-b border-white/5">
          {[
            { key: "meal", label: "Plats", icon: "🍽️" },
            { key: "snack", label: "Snacks", icon: "🍪" },
            { key: "drink", label: "Boissons", icon: "🥤" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
                category === cat.key
                  ? "bg-[#0D9488] text-white shadow-[0_0_15px_rgba(13,148,136,0.4)] scale-105"
                  : "bg-[#3a3a5c] text-white/60 hover:bg-[#4a4a6c]"
              }`}
              style={{
                boxShadow: category === cat.key
                  ? "0 4px 0 #065F46, 0 0 15px rgba(13,148,136,0.3)"
                  : "0 4px 0 #2a2a4a",
              }}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Glass display area */}
        <div className="relative mx-4 my-4 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent p-1">
          {/* Glass reflection overlay */}
          <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
          <div className="pointer-events-none absolute top-0 left-[10%] right-[60%] h-[40%] z-10 rounded-full bg-white/[0.03] blur-xl" />

          {/* Product grid — numbered slots */}
          <div className="grid grid-cols-4 gap-3 p-4">
            {filtered.map((product, idx) => {
              const slotCode = `${category === "meal" ? "A" : category === "snack" ? "B" : "C"}${idx + 1}`;
              const isDispensing = dispensing === product.id;

              return (
                <button
                  key={product.id}
                  onClick={() => handleSlotClick(product.id)}
                  className="group relative flex flex-col items-center rounded-xl border border-white/10 bg-[#1e1e3a]/80 p-3 transition-all hover:border-[#0D9488]/50 hover:bg-[#1e1e3a] active:scale-95"
                >
                  {/* Slot number */}
                  <div className="absolute top-2 left-2 rounded bg-[#0D9488] px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                    {slotCode}
                  </div>

                  {/* Product image */}
                  <div className={`relative mb-2 h-28 w-full overflow-hidden rounded-lg transition-all ${isDispensing ? "animate-dispense" : ""}`}>
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>

                  {/* Spiral coil effect */}
                  <div className="mb-2 flex w-full justify-center">
                    <div className="h-[3px] w-[80%] rounded-full bg-gradient-to-r from-transparent via-gray-400/30 to-transparent" />
                  </div>

                  {/* Product info */}
                  <p className="mb-1 text-center text-xs font-semibold text-white/90 leading-tight line-clamp-2">
                    {product.name}
                  </p>
                  <div className="mt-auto rounded-lg bg-[#0D9488]/20 px-3 py-1">
                    <span className="font-mono text-sm font-bold text-[#14B8A6]">
                      CHF {product.price.toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom — dispensing slot */}
        <div className="mx-8 mb-4 rounded-xl border-2 border-dashed border-white/10 bg-black/30 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-white/30">
            <span className="text-2xl">📦</span>
            <span className="text-sm font-medium">
              {dispensing ? "Distribution en cours..." : "Récupérez votre article ici"}
            </span>
          </div>
        </div>

        {/* Bottom metallic strip */}
        <div className="h-3 rounded-b-2xl bg-gradient-to-r from-[#3a3a5c] via-[#5a5a7c] to-[#3a3a5c]" />
      </div>
    </div>
  );
}
