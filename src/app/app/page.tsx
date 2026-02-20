"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { Product } from "@/types";

const DISTRIBUTORS = [
  { id: "SAFEBOX-A", label: "SafeBox A", sublabel: "Bâtiment A — RDC" },
  { id: "SAFEBOX-B", label: "SafeBox B", sublabel: "Bâtiment B — 1er étage" },
];

interface StockItem { product_id: number; quantity: number; }

// Product as returned from API (JSON fields may still be strings)
type ProductDetail = Omit<Product, "nutritional_info" | "certifications" | "allergen_free"> & {
  nutritional_info: Record<string, unknown> | string;
  certifications: string[] | string;
  allergen_free: string[] | string;
};

function SafeBoxLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="72" height="72" rx="18" fill="url(#pwaLogoGrad)" />
      <path d="M40 16C40 16 22 22 22 22V42C22 54 40 66 40 66C40 66 58 54 58 42V22L40 16Z" fill="white" fillOpacity="0.2" />
      <path d="M33 40L38 45L48 33" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="pwaLogoGrad" x1="4" y1="4" x2="76" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06B6D4" />
          <stop offset="0.5" stopColor="#0D9488" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function parseJson<T>(val: string | T): T {
  if (typeof val === "string") {
    try { return JSON.parse(val) as T; } catch { return val as unknown as T; }
  }
  return val;
}

export default function PWAPage() {
  const [distributorId, setDistributorId] = useState("SAFEBOX-A");
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMap, setStockMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = useCallback(async (distId: string) => {
    setLoading(true);
    try {
      const [productsRes, stockRes] = await Promise.all([
        fetch("/api/products"),
        fetch(`/api/stock?distributor=${distId}`),
      ]);
      const productsData: Product[] = await productsRes.json();
      const stockData: StockItem[] = await stockRes.json();

      const map: Record<number, number> = {};
      for (const s of stockData) map[s.product_id] = s.quantity;

      setProducts(productsData);
      setStockMap(map);
      setLastRefresh(new Date());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadData(distributorId);
  }, [distributorId, loadData]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => loadData(distributorId), 30_000);
    return () => clearInterval(interval);
  }, [distributorId, loadData]);

  const SECTIONS = [
    { key: "meal", label: "Plats préparés" },
    { key: "snack", label: "Snacks" },
    { key: "drink", label: "Boissons" },
  ];

  const availableCount = Object.values(stockMap).filter((q) => q > 0).length;
  const totalProducts = products.length;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-teal-50/30 pb-safe">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="h-[3px] bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500" />
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SafeBoxLogo size={36} />
            <div>
              <h1 className="text-base font-extrabold text-slate-800 leading-none">
                Safe<span className="text-teal-600">Box</span>
              </h1>
              <p className="text-[10px] text-teal-500 font-semibold uppercase tracking-wider">Stock en direct</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400">
              {availableCount}/{totalProducts} dispo
            </p>
            <p className="text-[9px] text-slate-300">
              {lastRefresh.toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* Distributor selector */}
        <div className="px-4 pb-3 flex gap-2">
          {DISTRIBUTORS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDistributorId(d.id)}
              className={`flex-1 rounded-xl py-2 px-3 text-left transition-all ${
                distributorId === d.id
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <p className="text-xs font-bold">{d.label}</p>
              <p className={`text-[10px] ${distributorId === d.id ? "text-white/70" : "text-slate-400"}`}>{d.sublabel}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-200 border-t-teal-500" />
            <span className="text-sm">Chargement...</span>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-6">
          {SECTIONS.map((section) => {
            const sectionProducts = products.filter((p) => p.category === section.key);
            if (sectionProducts.length === 0) return null;
            return (
              <div key={section.key}>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{section.label}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {sectionProducts.map((product) => {
                    const stock = stockMap[product.id] ?? null;
                    const isOut = stock !== null && stock === 0;
                    return (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product as unknown as ProductDetail)}
                        className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 text-left transition-all active:scale-[0.97] ${
                          isOut ? "opacity-50 grayscale ring-slate-100" : "ring-slate-200/60 hover:shadow-md"
                        }`}
                      >
                        {/* Image */}
                        <div className="relative h-32 w-full bg-slate-50">
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                            sizes="50vw"
                          />
                          {/* Stock badge */}
                          {stock !== null && (
                            <div className={`absolute bottom-1.5 left-1.5 rounded-lg px-2 py-0.5 text-[9px] font-bold shadow ${
                              isOut
                                ? "bg-red-500 text-white"
                                : stock <= 3
                                  ? "bg-orange-400 text-white"
                                  : "bg-emerald-500 text-white"
                            }`}>
                              {isOut ? "Épuisé" : `${stock} restant${stock > 1 ? "s" : ""}`}
                            </div>
                          )}
                          {product.is_vegan && (
                            <div className="absolute top-1.5 right-1.5 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
                              VÉGAN
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-3">
                          <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">{product.name}</p>
                          <p className="mt-1 text-sm font-extrabold text-slate-700">
                            {product.price.toFixed(2)} <span className="text-[10px] font-medium text-slate-400">CHF</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Refresh button */}
          <button
            onClick={() => loadData(distributorId)}
            className="w-full rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 transition-all active:scale-95 hover:bg-slate-200"
          >
            Actualiser le stock
          </button>
        </div>
      )}

      {/* Product detail modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          />
          <div className="relative z-10 w-full max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">
            {/* Handle */}
            <div className="sticky top-0 bg-white pt-3 pb-2 px-4 border-b border-slate-100">
              <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-slate-200" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800 pr-4 line-clamp-1">{selectedProduct.name}</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-4 pb-8 pt-4 space-y-5">
              {/* Image + price */}
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-50">
                  <Image src={selectedProduct.image_url} alt={selectedProduct.name} fill className="object-contain p-2" sizes="96px" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-800">{selectedProduct.price.toFixed(2)} <span className="text-sm font-medium text-slate-400">CHF</span></p>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {selectedProduct.is_vegan && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Végan</span>}
                    {selectedProduct.is_vegetarian && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Végétarien</span>}
                  </div>
                  {(() => {
                    const stock = stockMap[selectedProduct.id] ?? null;
                    if (stock === null) return null;
                    const isOut = stock === 0;
                    return (
                      <div className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        isOut ? "bg-red-100 text-red-600" : stock <= 3 ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                      }`}>
                        {isOut ? "Épuisé" : `${stock} en stock`}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
                  <p className="text-sm text-slate-600">{selectedProduct.description}</p>
                </div>
              )}

              {/* Ingredients */}
              {selectedProduct.ingredients && (
                <div>
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Ingrédients</h3>
                  <p className="text-sm text-slate-600">{selectedProduct.ingredients}</p>
                </div>
              )}

              {/* Allergen free */}
              {(() => {
                const allergenFree = parseJson<string[]>(selectedProduct.allergen_free as string);
                if (!allergenFree || allergenFree.length === 0) return null;
                return (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Sans allergènes</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {allergenFree.map((a: string) => (
                        <span key={a} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-100">
                          {a.replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Nutritional info */}
              {(() => {
                const nutri = parseJson<Record<string, string>>(selectedProduct.nutritional_info as string);
                if (!nutri || typeof nutri !== "object" || Object.keys(nutri).length === 0) return null;
                return (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Infos nutritionnelles</h3>
                    <div className="rounded-xl bg-slate-50 p-3 space-y-1">
                      {Object.entries(nutri).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-slate-500 capitalize">{k.replace(/_/g, " ")}</span>
                          <span className="font-semibold text-slate-700">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Origin */}
              {selectedProduct.origin_info && (
                <div>
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Traçabilité & origine</h3>
                  <p className="text-sm text-slate-600">{selectedProduct.origin_info}</p>
                </div>
              )}

              {/* Certifications */}
              {(() => {
                const certs = parseJson<string[]>(selectedProduct.certifications as string);
                if (!certs || certs.length === 0) return null;
                return (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Certifications</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {certs.map((c: string) => (
                        <span key={c} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">{c}</span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
