"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import type { Product } from "@/types";
import { useSessionStore } from "@/stores/sessionStore";
import { useEventTracker } from "@/hooks/useEventTracker";
import { DENOMINATIONS } from "@/lib/constants";

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

const DISTRIBUTORS = [
  { id: "SAFEBOX-A", label: "SafeBox A — Bât. A RDC" },
  { id: "SAFEBOX-B", label: "SafeBox B — Bât. B 1er" },
];

export default function MachinePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMap, setStockMap] = useState<Record<number, number>>({});
  const [dispensing, setDispensing] = useState<number | null>(null);
  const [lastDispensed, setLastDispensed] = useState<Product | null>(null);
  const [showPickup, setShowPickup] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [lcdError, setLcdError] = useState<string | null>(null);
  const [insertAnim, setInsertAnim] = useState<string | null>(null);

  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const router = useRouter();
  const sessionId = useSessionStore((s) => s.sessionId);
  const distributorId = useSessionStore((s) => s.distributorId);
  const setDistributor = useSessionStore((s) => s.setDistributor);
  const moneyInserted = useSessionStore((s) => s.moneyInserted);
  const insertMoney = useSessionStore((s) => s.insertMoney);
  const addSpending = useSessionStore((s) => s.addSpending);
  const budget = useSessionStore((s) => s.budget);
  const amountSpent = useSessionStore((s) => s.amountSpent);
  const { track, flush } = useEventTracker();

  const credit = budget - amountSpent;
  const amountNeeded = pendingProduct ? Math.max(0, pendingProduct.price - credit) : 0;

  const loadStock = useCallback(() => {
    fetch(`/api/stock?distributor=${distributorId}`)
      .then((r) => r.json())
      .then((data: { product_id: number; quantity: number }[]) => {
        const map: Record<number, number> = {};
        for (const s of data) map[s.product_id] = s.quantity;
        setStockMap(map);
      })
      .catch(() => {});
  }, [distributorId]);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  // Auto-dispense when enough money is inserted
  useEffect(() => {
    if (pendingProduct && credit >= pendingProduct.price && !dispensing) {
      const product = pendingProduct;
      track("purchase_confirm", { product_id: product.id, category: product.category, metadata: { price: product.price } });
      recordPurchase(product);
      setDispensing(product.id);
      setLastDispensed(null);
      setPendingProduct(null);
      setSelectedLetter(null);
      setSelectedNumber(null);
      setTimeout(() => {
        setDispensing(null);
        setLastDispensed(product);
        setShowPickup(true);
        loadStock();
      }, 2200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingProduct, credit, dispensing]);

  const handleInsertMoney = useCallback((value: number, label: string) => {
    setInsertAnim(label);
    insertMoney(value);
    track("money_insert", { metadata: { denomination: value, total_inserted: budget + value } });
    setTimeout(() => setInsertAnim(null), 600);
  }, [insertMoney, track, budget]);

  const handleFinish = useCallback(() => {
    track("session_end", { metadata: { total_spent: amountSpent, remaining: budget - amountSpent } });
    flush();
    router.push("/feedback");
  }, [track, flush, router, amountSpent, budget]);

  const handleProductClick = (sectionPrefix: string, idx: number, product: Product) => {
    if (dispensing || pendingProduct) return;
    if (stockMap[product.id] === 0) return;
    const letter = sectionPrefix;
    const num = idx + 1;
    setLcdError(null);
    setSelectedLetter(letter);
    setSelectedNumber(num);
    track("product_view", { metadata: { action: "card_tap", code: `${letter}${num}` } });
  };

  const recordPurchase = useCallback(
    async (product: Product) => {
      if (!sessionId) return;
      addSpending(product.price);
      try {
        await fetch("/api/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            items: [{ product_id: product.id, quantity: 1, unit_price: product.price }],
          }),
        });
      } catch { /* silent */ }
    },
    [sessionId, addSpending],
  );

  const getProductByCode = (letter: string, number: number): Product | null => {
    const section = SECTIONS.find((s) => s.prefix === letter);
    if (!section) return null;
    const sectionProducts = products.filter((p) => p.category === section.key);
    const idx = number - 1;
    return idx >= 0 && idx < sectionProducts.length ? sectionProducts[idx] : null;
  };

  const handleLetterPress = (letter: string) => {
    if (dispensing || pendingProduct) return;
    setLcdError(null);
    setSelectedLetter(letter);
    setSelectedNumber(null);
    track("category_switch", { category: letter, metadata: { action: "keypad_letter" } });
  };

  const handleNumberPress = (num: number) => {
    if (dispensing || pendingProduct || !selectedLetter) return;
    setLcdError(null);
    setSelectedNumber(num);
    track("product_view", { metadata: { action: "keypad_number", code: `${selectedLetter}${num}` } });
  };

  const handleCancel = () => {
    if (dispensing) return;
    const hadSelection = selectedLetter !== null || pendingProduct !== null;
    setSelectedLetter(null);
    setSelectedNumber(null);
    setLcdError(null);
    setLastDispensed(null);
    setShowPickup(false);
    setPendingProduct(null);
    if (hadSelection) {
      track("cart_abandon", { metadata: { action: "keypad_cancel" } });
    }
  };

  const handleValidate = () => {
    if (dispensing || pendingProduct || !selectedLetter || selectedNumber === null) return;
    const code = `${selectedLetter}${selectedNumber}`;
    const product = getProductByCode(selectedLetter, selectedNumber);
    if (!product) {
      setLcdError("Code invalide");
      track("hesitation", { metadata: { action: "invalid_code", code } });
      setTimeout(() => {
        setLcdError(null);
        setSelectedLetter(null);
        setSelectedNumber(null);
      }, 1500);
      return;
    }
    if (stockMap[product.id] === 0) {
      setLcdError("Épuisé");
      setTimeout(() => { setLcdError(null); setSelectedLetter(null); setSelectedNumber(null); }, 1500);
      return;
    }
    if (credit >= product.price) {
      track("purchase_confirm", { product_id: product.id, category: product.category, metadata: { code, price: product.price } });
      recordPurchase(product);
      setDispensing(product.id);
      setLastDispensed(null);
      setShowPickup(false);
      setSelectedLetter(null);
      setSelectedNumber(null);
      setTimeout(() => {
        setDispensing(null);
        setLastDispensed(product);
        setShowPickup(true);
        loadStock();
      }, 2200);
    } else {
      setPendingProduct(product);
    }
  };

  const highlightCode = pendingProduct
    ? `${selectedLetter}${selectedNumber}`
    : selectedLetter && selectedNumber !== null
      ? `${selectedLetter}${selectedNumber}`
      : null;

  const lcdText = lcdError
    ? lcdError
    : pendingProduct
      ? pendingProduct.name
      : selectedLetter && selectedNumber !== null
        ? `${selectedLetter}${selectedNumber}`
        : selectedLetter
          ? `${selectedLetter}_`
          : "Tapez un code";

  const lcdSubText = pendingProduct
    ? `CHF ${pendingProduct.price.toFixed(2)}${amountNeeded > 0 ? ` — Insérez CHF ${amountNeeded.toFixed(2)}` : ""}`
    : null;

  // ═══ MONEY INSERTION PANEL ═══
  const MoneyInsertPanel = () => (
    <div className="space-y-3 rounded-xl bg-amber-50/80 p-3 ring-1 ring-amber-200/60">
      <div className="text-center">
        <p className="text-xs font-bold text-amber-700">
          Insérez CHF {amountNeeded.toFixed(2)}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {DENOMINATIONS.coins.map((coin) => (
          <button
            key={coin.value}
            onClick={() => handleInsertMoney(coin.value, coin.label)}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-sm font-bold text-amber-800 shadow ring-1 ring-amber-300/50 transition-all hover:scale-110 active:scale-95 ${
              insertAnim === coin.label ? "scale-90 opacity-60" : ""
            }`}
          >
            {coin.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {DENOMINATIONS.bills.map((bill) => (
          <button
            key={bill.value}
            onClick={() => handleInsertMoney(bill.value, bill.label)}
            className={`flex h-10 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-emerald-200 text-sm font-bold text-emerald-800 shadow ring-1 ring-emerald-300/50 transition-all hover:scale-110 active:scale-95 ${
              insertAnim === bill.label ? "scale-90 opacity-60" : ""
            }`}
          >
            {bill.label}
          </button>
        ))}
      </div>
    </div>
  );

  // ═══ KEYPAD COMPONENT ═══
  const KeypadContent = ({ compact = false }: { compact?: boolean }) => (
    <>
      {/* LCD Display */}
      <div className={`rounded-xl bg-slate-900 ${compact ? "p-3" : "p-4"} shadow-inner`}>
        <div className="rounded-lg bg-[#1a2e1a] px-4 py-2.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
          <p className={`text-center font-mono font-bold ${
            pendingProduct
              ? `${compact ? "text-sm" : "text-base"} tracking-wide text-amber-400`
              : `${compact ? "text-lg" : "text-2xl"} tracking-widest ${lcdError ? "text-red-400" : selectedLetter ? "text-green-400" : "text-green-400/60"}`
          }`}>
            {lcdText}
          </p>
          {lcdSubText && (
            <p className={`text-center font-mono ${compact ? "text-[10px]" : "text-xs"} mt-1 ${
              amountNeeded > 0 ? "text-amber-400/80" : "text-green-400/80"
            }`}>
              {lcdSubText}
            </p>
          )}
        </div>
        {!compact && (
          <div className="mt-2 flex items-center justify-between px-1">
            <div className={`h-1.5 w-1.5 rounded-full ${dispensing ? "bg-yellow-400 animate-pulse" : pendingProduct ? "bg-amber-400 animate-pulse" : "bg-green-500"}`} />
            <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500">SafeBox v2.0</span>
          </div>
        )}
      </div>

      {/* Money panel when pending purchase */}
      {pendingProduct && <MoneyInsertPanel />}

      {/* Letter buttons */}
      <div>
        {!compact && <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Rangée</p>}
        <div className={`grid grid-cols-3 ${compact ? "gap-1.5" : "gap-2"}`}>
          {["A", "B", "C"].map((letter) => (
            <button
              key={letter}
              onClick={() => handleLetterPress(letter)}
              disabled={!!dispensing || !!pendingProduct}
              className={`flex ${compact ? "h-10" : "h-12"} items-center justify-center rounded-xl font-mono ${compact ? "text-base" : "text-lg"} font-bold shadow-md transition-all duration-150 active:translate-y-0.5 active:shadow-sm disabled:opacity-40 ${
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
        {!compact && <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Numéro</p>}
        <div className={`grid grid-cols-4 ${compact ? "gap-1.5" : "gap-2"}`}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberPress(num)}
              disabled={!!dispensing || !!pendingProduct || !selectedLetter}
              className={`flex ${compact ? "h-10" : "h-12"} items-center justify-center rounded-xl font-mono ${compact ? "text-base" : "text-lg"} font-bold shadow-md transition-all duration-150 active:translate-y-0.5 active:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed ${
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
      <div className={`grid grid-cols-2 ${compact ? "gap-1.5" : "gap-2"}`}>
        <button
          onClick={handleCancel}
          disabled={!!dispensing}
          className={`flex ${compact ? "h-10" : "h-12"} items-center justify-center rounded-xl bg-slate-300 font-semibold text-slate-700 text-sm shadow-md transition-all duration-150 hover:bg-slate-400 hover:text-white active:translate-y-0.5 active:shadow-sm disabled:opacity-40`}
        >
          Annuler
        </button>
        <button
          onClick={handleValidate}
          disabled={!!dispensing || !!pendingProduct || !selectedLetter || selectedNumber === null}
          className={`flex ${compact ? "h-10" : "h-12"} items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 font-semibold text-white text-sm shadow-md shadow-teal-500/25 transition-all duration-150 hover:shadow-lg hover:shadow-teal-500/30 active:translate-y-0.5 active:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          Valider
        </button>
      </div>

      {/* Dispensing indicator (desktop) */}
      {dispensing && !compact && (
        <div className="flex items-center justify-center gap-3 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200/60">
          <div className="relative h-5 w-5">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-teal-200 border-t-teal-500" />
          </div>
          <span className="text-sm font-semibold text-slate-600">Distribution en cours...</span>
        </div>
      )}

      {/* Finish shopping */}
      {amountSpent > 0 && !pendingProduct && !dispensing && (
        <button
          onClick={() => setShowFinishConfirm(true)}
          className="w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-900 active:scale-95"
        >
          Terminer mes achats
        </button>
      )}
    </>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      <div className="flex flex-1 flex-col">

        {/* ═══ TOP BAR ═══ */}
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl shadow-[0_1px_30px_rgba(0,0,0,0.06)]">
          <div className="h-[3px] bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500" />
          <div className="flex items-center justify-between px-4 py-3 lg:px-8 lg:py-4">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="relative">
                <SafeBoxLogo size={40} />
                <div className="absolute -inset-2 -z-10 rounded-2xl bg-teal-400/10 blur-lg" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-800 lg:text-xl">
                  Safe<span className="text-teal-600">Box</span>
                </h1>
                <p className="hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-teal-500/80 sm:block">
                  Distributeur sans allergènes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-5">
              {/* Distributor selector — only before money is inserted */}
              {!moneyInserted && (
                <select
                  value={distributorId}
                  onChange={async (e) => {
                    const newId = e.target.value;
                    setDistributor(newId);
                    if (sessionId) {
                      try {
                        await fetch(`/api/sessions/${sessionId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ distributor_id: newId }),
                        });
                      } catch { /* silent */ }
                    }
                  }}
                  className="hidden sm:block rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  {DISTRIBUTORS.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/50 px-3 py-2 ring-1 ring-slate-200/60 lg:gap-3 lg:px-5 lg:py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-md shadow-teal-500/20 lg:h-9 lg:w-9">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Crédit</p>
                  <p className="text-base font-extrabold text-slate-800 lg:text-lg">CHF <span className="text-teal-600">{credit.toFixed(2)}</span></p>
                </div>
              </div>
              <div className="hidden flex-col items-center gap-1.5 sm:flex">
                <div className="relative h-3 w-3">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
                  <div className="absolute inset-0 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/70">Actif</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">

          {/* ── Left: Product Vitrine ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-5">
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

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {sectionProducts.map((product, idx) => {
                        const slotCode = `${section.prefix}${idx + 1}`;
                        const isHighlighted = highlightCode === slotCode;
                        const stock = stockMap[product.id] ?? null;
                        const isOutOfStock = stock !== null && stock === 0;

                        return (
                          <div
                            key={product.id}
                            onClick={() => handleProductClick(section.prefix, idx, product)}
                            className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] ring-1 transition-all duration-300 ${
                              isOutOfStock
                                ? "opacity-50 cursor-not-allowed grayscale"
                                : "cursor-pointer hover:shadow-lg active:scale-[0.98]"
                            } ${
                              isHighlighted
                                ? "ring-2 ring-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                                : "ring-black/[0.03] hover:ring-teal-200"
                            }`}
                          >
                            {/* Slot code */}
                            <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm ring-1 ring-black/[0.05]">
                              <div className={`h-1.5 w-1.5 rounded-full ${isHighlighted ? "bg-teal-400 animate-pulse" : "bg-teal-500"}`} />
                              <span className="font-mono text-[10px] font-bold text-slate-600">{slotCode}</span>
                            </div>

                            {/* QR code badge */}
                            <div className="absolute top-2.5 right-2.5 z-20 rounded-md bg-white/90 p-1 shadow-sm backdrop-blur-sm ring-1 ring-black/[0.05]" title="Scanner pour voir ingrédients & traçabilité">
                              <QRCodeSVG
                                value={`${typeof window !== "undefined" ? window.location.origin : ""}/produit/${product.id}`}
                                size={28}
                                level="L"
                              />
                            </div>

                            {/* Product photo */}
                            <div className="relative h-52 w-full overflow-hidden bg-slate-50">
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-contain p-2"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                              {/* Stock badge */}
                              {stock !== null && (
                                <div className={`absolute bottom-2 left-2 rounded-md px-1.5 py-0.5 text-[9px] font-bold shadow-sm ${
                                  isOutOfStock
                                    ? "bg-red-500 text-white"
                                    : stock <= 3
                                      ? "bg-orange-400 text-white"
                                      : "bg-white/90 text-slate-600"
                                }`}>
                                  {isOutOfStock ? "Épuisé" : `${stock} restant${stock > 1 ? "s" : ""}`}
                                </div>
                              )}

                              <div className="absolute bottom-2 right-2 flex gap-1">
                                {product.is_vegan && (
                                  <span className="rounded-md bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-sm">
                                    VÉGAN
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex flex-1 flex-col p-4">
                              <p className="mb-1 text-left text-sm font-bold leading-snug text-slate-800 line-clamp-2">
                                {product.name}
                              </p>

                              <div className="mt-auto flex items-center justify-between pt-1">
                                <span className="text-base font-extrabold text-slate-800">
                                  {product.price.toFixed(2)}
                                  <span className="ml-0.5 text-[10px] font-semibold text-slate-400">CHF</span>
                                </span>
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

            {/* Spacer for mobile bottom keypad */}
            <div className="h-80 lg:hidden" />
          </div>

          {/* ── Right: Keypad Panel (DESKTOP) ── */}
          <div className="hidden w-[300px] shrink-0 border-l border-slate-200/60 bg-gradient-to-b from-slate-100 to-slate-200/80 p-5 lg:flex lg:flex-col lg:gap-4 lg:overflow-y-auto">
            <KeypadContent />
          </div>
        </div>

        {/* ═══ MOBILE BOTTOM PANEL ═══ */}
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/60 bg-gradient-to-b from-slate-100 to-slate-200/80 shadow-[0_-4px_30px_rgba(0,0,0,0.1)] lg:hidden">
          {/* Mobile dispensing spinner */}
          {dispensing && (
            <div className="border-b border-slate-200/60 bg-white px-4 py-3">
              <div className="flex items-center justify-center gap-3">
                <div className="relative h-5 w-5">
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-teal-200 border-t-teal-500" />
                </div>
                <span className="text-sm font-semibold text-slate-600">Distribution en cours...</span>
              </div>
            </div>
          )}

          <div className="max-h-[45vh] overflow-y-auto px-3 py-2">
            <div className="space-y-2">
              <KeypadContent compact />
            </div>
          </div>
        </div>

        {/* ═══ PICKUP OVERLAY ═══ */}
        {showPickup && lastDispensed && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
              onClick={() => setShowPickup(false)}
            />
            <div className="relative z-10 m-4 w-full max-w-sm animate-[slideUp_0.4s_ease-out] rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 animate-[scaleIn_0.5s_ease-out]">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="mx-auto mb-4 h-40 w-40 overflow-hidden rounded-2xl shadow-md">
                <Image
                  src={lastDispensed.image_url}
                  alt={lastDispensed.name}
                  width={160}
                  height={160}
                  className="h-full w-full object-cover"
                />
              </div>

              <h3 className="text-center text-lg font-bold text-slate-800">{lastDispensed.name}</h3>
              <p className="mt-1 text-center text-sm text-slate-400">CHF {lastDispensed.price.toFixed(2)}</p>
              <p className="mt-3 text-center text-sm font-medium text-emerald-600">
                Récupérez votre article ci-dessous
              </p>

              <button
                onClick={() => setShowPickup(false)}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-500/25 transition-all active:scale-95"
              >
                OK — Continuer
              </button>
            </div>
          </div>
        )}

        {/* ═══ FINISH CONFIRMATION MODAL ═══ */}
        {showFinishConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
              onClick={() => setShowFinishConfirm(false)}
            />
            <div className="relative z-10 m-4 w-full max-w-sm animate-[slideUp_0.4s_ease-out] rounded-3xl bg-white p-6 shadow-2xl">
              <h3 className="text-center text-lg font-bold text-slate-800">Terminer vos achats ?</h3>
              {credit > 0 && (
                <p className="mt-2 text-center text-sm text-slate-500">
                  Votre monnaie de <span className="font-bold text-teal-600">CHF {credit.toFixed(2)}</span> vous sera rendue.
                </p>
              )}
              <p className="mt-2 text-center text-sm text-slate-400">
                Total dépensé : CHF {amountSpent.toFixed(2)}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowFinishConfirm(false)}
                  className="rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
                >
                  Continuer
                </button>
                <button
                  onClick={() => { setShowFinishConfirm(false); handleFinish(); }}
                  className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-3 text-sm font-bold text-white shadow-md shadow-teal-500/25 transition-all active:scale-95"
                >
                  Terminer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
