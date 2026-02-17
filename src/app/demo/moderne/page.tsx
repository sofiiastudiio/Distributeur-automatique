"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";

export default function ModerneDemo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("meal");
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const filtered = products.filter((p) => p.category === category);

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <Link href="/demo" className="px-6 pt-4 text-sm text-gray-400 hover:text-gray-600">
        ← Retour aux démos
      </Link>

      {/* Kiosk header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-2xl text-white">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SafeBox</h1>
            <p className="text-xs text-gray-400">Distributeur sans allergènes</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-400">Votre solde</p>
            <p className="text-2xl font-bold text-teal-600">CHF 30.00</p>
          </div>
          <button className="relative rounded-2xl bg-gray-100 p-4 transition-colors hover:bg-gray-200">
            <span className="text-2xl">🛒</span>
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
              0
            </span>
          </button>
        </div>
      </header>

      {/* Category pills */}
      <div className="flex gap-3 px-8 py-5">
        {[
          { key: "meal", label: "🍽️ Plats préparés" },
          { key: "snack", label: "🍪 Snacks" },
          { key: "drink", label: "🥤 Boissons" },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
              category === cat.key
                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product grid — large hero cards */}
      <div className="flex-1 px-8 pb-8">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => setSelected(product)}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100 transition-all hover:shadow-xl hover:ring-teal-200 active:scale-[0.98]"
            >
              {/* Image — large */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-1.5">
                  {product.is_vegan && (
                    <span className="rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      VÉGAN
                    </span>
                  )}
                  <span className="rounded-full bg-teal-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    SANS ALLERGÈNES
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="mb-1 text-left text-base font-bold text-gray-900">
                  {product.name}
                </h3>
                <p className="mb-3 text-left text-xs text-gray-400 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-teal-600">
                    CHF {product.price.toFixed(2)}
                  </span>
                  <span className="rounded-full bg-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-all group-hover:bg-teal-600">
                    Sélectionner
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="fixed inset-x-4 bottom-4 top-auto z-50 max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:inset-x-auto md:left-1/2 md:w-[500px] md:-translate-x-1/2">
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
            <div className="relative mb-4 h-56 w-full overflow-hidden rounded-2xl">
              <Image src={selected.image_url} alt={selected.name} fill className="object-cover" sizes="500px" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">{selected.name}</h2>
            <p className="mb-4 text-gray-500">{selected.description}</p>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-3xl font-bold text-teal-600">CHF {selected.price.toFixed(2)}</span>
              <button
                onClick={() => setSelected(null)}
                className="rounded-2xl bg-teal-500 px-8 py-3 text-lg font-bold text-white shadow-lg shadow-teal-500/25 hover:bg-teal-600 active:scale-95"
              >
                Commander
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
