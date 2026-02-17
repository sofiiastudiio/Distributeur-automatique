"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import type { Product } from "@/types";

function SafeBoxLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="72" height="72" rx="18" fill="url(#logoGrad)" />
      <path d="M40 16C40 16 22 22 22 22V42C22 54 40 66 40 66C40 66 58 54 58 42V22L40 16Z" fill="white" fillOpacity="0.2" />
      <path d="M40 20C40 20 26 25 26 25V41C26 51 40 61 40 61C40 61 54 51 54 41V25L40 20Z" fill="white" fillOpacity="0.15" />
      <path d="M33 40L38 45L48 33" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="14" r="2" fill="white" fillOpacity="0.5" />
      <circle cx="62" cy="12" r="1.5" fill="white" fillOpacity="0.4" />
      <defs>
        <linearGradient id="logoGrad" x1="4" y1="4" x2="76" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06B6D4" />
          <stop offset="0.5" stopColor="#0D9488" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const SECTIONS = [
  { key: "meal", label: "Plats préparés", prefix: "A" },
  { key: "snack", label: "Snacks", prefix: "B" },
  { key: "drink", label: "Boissons", prefix: "C" },
] as const;

export default function HybrideDemo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dispensing, setDispensing] = useState<number | null>(null);
  const [lastDispensed, setLastDispensed] = useState<Product | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [lcdError, setLcdError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const getProductByCode = (letter: string, number: number): Product | null => {
    const section = SECTIONS.find((s) => s.prefix === letter);
    if (!section) return null;
    const sectionProducts = products.filter((p) => p.category === section.key);
    const idx = number - 1;
    return idx >= 0 && idx < sectionProducts.length ? sectionProducts[idx] : null;
  };

  const handleLetterPress = (letter: string) => {
    if (dispensing) return;
    setLcdError(null);
    setSelectedLetter(letter);
    setSelectedNumber(null);
  };

  const handleNumberPress = (num: number) => {
    if (dispensing || !selectedLetter) return;
    setLcdError(null);
    setSelectedNumber(num);
  };

  const handleCancel = () => {
    if (dispensing) return;
    setSelectedLetter(null);
    setSelectedNumber(null);
    setLcdError(null);
    setLastDispensed(null);
  };

  const handleValidate = () => {
    if (dispensing || !selectedLetter || selectedNumber === null) return;
    const product = getProductByCode(selectedLetter, selectedNumber);
    if (!product) {
      setLcdError("Code invalide");
      setTimeout(() => {
        setLcdError(null);
        setSelectedLetter(null);
        setSelectedNumber(null);
      }, 1500);
      return;
    }
    // Start dispensing
    setDispensing(product.id);
    setLastDispensed(null);
    setSelectedLetter(null);
    setSelectedNumber(null);
    setTimeout(() => {
      setDispensing(null);
      setLastDispensed(product);
    }, 2200);
  };

  // Determine the highlighted product code
  const highlightCode = selectedLetter && selectedNumber !== null
    ? `${selectedLetter}${selectedNumber}`
    : null;

  // LCD display text
  const lcdText = lcdError
    ? lcdError
    : selectedLetter && selectedNumber !== null
      ? `${selectedLetter}${selectedNumber}`
      : selectedLetter
        ? `${selectedLetter}_`
        : "Tapez un code";

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      <div className="flex flex-1 flex-col">

        {/* ═══ TOP BAR ═══ */}
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl shadow-[0_1px_30px_rgba(0,0,0,0.06)]">
          <div className="h-[3px] bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500" />
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <SafeBoxLogo size={48} />
                <div className="absolute -inset-2 -z-10 rounded-2xl bg-teal-400/10 blur-lg" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
                  Safe<span className="text-teal-600">Box</span>
                </h1>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal-500/80">
                  Distributeur sans allergènes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/50 px-5 py-3 ring-1 ring-slate-200/60">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-md shadow-teal-500/20">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Solde</p>
                  <p className="text-lg font-extrabold text-slate-800">CHF <span className="text-teal-600">30.00</span></p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative h-3 w-3">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
                  <div className="absolute inset-0 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/70">Actif</span>
              </div>
            </div>
          </div>
          <Link href="/demo" className="absolute top-3 left-2 text-[10px] text-slate-300 hover:text-slate-500 transition-colors px-2">←</Link>
        </div>

        {/* ═══ MAIN CONTENT: Vitrine (left) + Keypad (right) ═══ */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left: Product Vitrine (non-interactive) ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="mx-auto max-w-6xl space-y-6">
              {SECTIONS.map((section) => {
                const sectionProducts = products.filter((p) => p.category === section.key);
                if (sectionProducts.length === 0) return null;

                return (
                  <div key={section.key}>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-7 items-center rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 px-3 shadow-sm shadow-teal-500/15">
                        <span className="font-mono text-[11px] font-bold text-white tracking-wider">{section.prefix}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{section.label}</span>
                      <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 to-transparent" />
                    </div>

                    <div className="grid grid-cols-4 gap-3 lg:grid-cols-5 xl:grid-cols-6">
                      {sectionProducts.map((product, idx) => {
                        const slotCode = `${section.prefix}${idx + 1}`;
                        const isHighlighted = highlightCode === slotCode;

                        return (
                          <div
                            key={product.id}
                            className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] ring-1 transition-all duration-300 ${
                              isHighlighted
                                ? "ring-2 ring-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                                : "ring-black/[0.03]"
                            }`}
                          >
                            {/* Slot code */}
                            <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 shadow-sm backdrop-blur-sm ring-1 ring-black/[0.05]">
                              <div className={`h-1.5 w-1.5 rounded-full ${isHighlighted ? "bg-teal-400 animate-pulse" : "bg-teal-500"}`} />
                              <span className="font-mono text-[9px] font-bold text-slate-600">{slotCode}</span>
                            </div>

                            {/* Product photo */}
                            <div className="relative h-36 w-full overflow-hidden">
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="250px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                              <div className="absolute bottom-2 right-2 flex gap-1">
                                {product.is_vegan && (
                                  <span className="rounded-md bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-sm">
                                    VÉGAN
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex flex-1 flex-col p-3">
                              <p className="mb-1 text-left text-[12px] font-bold leading-snug text-slate-800 line-clamp-2">
                                {product.name}
                              </p>
                              <div className="mt-auto flex items-center justify-between pt-1">
                                <span className="text-[14px] font-extrabold text-slate-800">
                                  {product.price.toFixed(2)}
                                  <span className="ml-0.5 text-[10px] font-semibold text-slate-400">CHF</span>
                                </span>
                                <div className="rounded-md bg-white p-1 shadow-sm ring-1 ring-black/[0.05]" title="Scanner pour voir les détails">
                                  <QRCodeSVG
                                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/produit/${product.id}`}
                                    size={28}
                                    level="L"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Keypad Panel ── */}
          <div className="w-[280px] shrink-0 border-l border-slate-200/60 bg-gradient-to-b from-slate-100 to-slate-200/80 p-5 flex flex-col gap-5">

            {/* LCD Display */}
            <div className="rounded-xl bg-slate-900 p-4 shadow-inner">
              <div className="rounded-lg bg-[#1a2e1a] px-4 py-3 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
                <p className={`text-center font-mono text-2xl font-bold tracking-widest ${
                  lcdError ? "text-red-400" : selectedLetter ? "text-green-400" : "text-green-400/60"
                }`}>
                  {lcdText}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between px-1">
                <div className={`h-1.5 w-1.5 rounded-full ${dispensing ? "bg-yellow-400 animate-pulse" : "bg-green-500"}`} />
                <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500">SafeBox v2.0</span>
              </div>
            </div>

            {/* Letter buttons */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Rangée</p>
              <div className="grid grid-cols-3 gap-2">
                {["A", "B", "C"].map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleLetterPress(letter)}
                    disabled={!!dispensing}
                    className={`flex h-12 items-center justify-center rounded-xl font-mono text-lg font-bold shadow-md transition-all duration-150 active:translate-y-0.5 active:shadow-sm disabled:opacity-40 ${
                      selectedLetter === letter
                        ? "bg-teal-500 text-white shadow-teal-500/30 ring-2 ring-teal-300"
                        : "bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-700 ring-1 ring-slate-200/80"
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Number grid */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Numéro</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberPress(num)}
                    disabled={!!dispensing || !selectedLetter}
                    className={`flex h-12 items-center justify-center rounded-xl font-mono text-lg font-bold shadow-md transition-all duration-150 active:translate-y-0.5 active:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed ${
                      selectedNumber === num
                        ? "bg-teal-500 text-white shadow-teal-500/30 ring-2 ring-teal-300"
                        : "bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-700 ring-1 ring-slate-200/80"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-auto grid grid-cols-2 gap-2">
              <button
                onClick={handleCancel}
                disabled={!!dispensing}
                className="flex h-12 items-center justify-center rounded-xl bg-slate-300 font-semibold text-slate-700 text-sm shadow-md transition-all duration-150 hover:bg-slate-400 hover:text-white active:translate-y-0.5 active:shadow-sm disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                onClick={handleValidate}
                disabled={!!dispensing || !selectedLetter || selectedNumber === null}
                className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 font-semibold text-white text-sm shadow-md shadow-teal-500/25 transition-all duration-150 hover:shadow-lg hover:shadow-teal-500/30 active:translate-y-0.5 active:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Valider
              </button>
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM DISPENSING TRAY ═══ */}
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl shadow-[0_-1px_30px_rgba(0,0,0,0.06)]">
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500" />
          <div className="px-8 py-4">
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
              {dispensing ? (
                <div className="flex items-center gap-4">
                  <div className="relative h-6 w-6">
                    <div className="absolute inset-0 animate-spin rounded-full border-[2.5px] border-teal-200 border-t-teal-500" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600">Distribution en cours</span>
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              ) : lastDispensed ? (
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{lastDispensed.name}</p>
                    <p className="text-xs text-slate-400">Récupérez votre article — Bon appétit !</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-300">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <span className="text-sm font-medium">Entrez un code sur le clavier</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
