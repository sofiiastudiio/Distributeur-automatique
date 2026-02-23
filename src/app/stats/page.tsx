"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
} from "recharts";

const COLORS = ["#0d9488", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const CAT_COLORS: Record<string, string> = { Plats: "#0d9488", Snacks: "#06b6d4", Boissons: "#10b981" };

const DISTRIBUTORS = [
  { id: "SAFEBOX-A", label: "SafeBox A — Bât. A RDC" },
  { id: "SAFEBOX-B", label: "SafeBox B — Bât. B 1er" },
];

interface Stats {
  overview: {
    totalSessions: number;
    totalPurchases: number;
    totalRevenue: number;
    avgSpend: number;
    avgBudget: number;
    budgetUtilization: number;
    mostPopular: string;
    avgDuration: number;
    invalidCodes: number;
    cancellations: number;
    totalParticipants: number;
  };
  productPopularity: { name: string; count: number; revenue: number; category: string }[];
  categoryRevenue: { name: string; value: number; count: number }[];
  spendingDistribution: { name: string; budget: number; spent: number; items: number }[];
  demographics: {
    age: { name: string; value: number }[];
    gender: { name: string; value: number }[];
    allergies: { name: string; value: number }[];
  };
  recentSessions: {
    id: number;
    participant: string;
    budget: number;
    spent: number;
    items: number;
    date: string;
    products: { name: string; quantity: number; price: number }[];
  }[];
}

interface StockItem { product_id: number; quantity: number; }
interface ProductInfo { id: number; name: string; category: string; }

function MetricCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${accent ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white" : "bg-white ring-1 ring-slate-200/60"}`}>
      <p className={`text-xs font-bold uppercase tracking-wider ${accent ? "text-white/60" : "text-slate-400"}`}>{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent ? "text-white" : "text-slate-800"}`}>{value}</p>
      {sub && <p className={`mt-0.5 text-xs ${accent ? "text-white/50" : "text-slate-400"}`}>{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-lg font-bold text-slate-800">{children}</h2>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [selectedDistributor, setSelectedDistributor] = useState("SAFEBOX-A");
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [allProducts, setAllProducts] = useState<ProductInfo[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [restocking, setRestocking] = useState(false);
  const [restockSuccess, setRestockSuccess] = useState(false);

  const loadStats = () => {
    setLoading(true);
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const loadStock = (distId: string) => {
    setStockLoading(true);
    Promise.all([
      fetch(`/api/stock?distributor=${distId}`).then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([stockData, productsData]) => {
      setStocks(stockData);
      setAllProducts(productsData);
      setStockLoading(false);
    }).catch(() => setStockLoading(false));
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadStock(selectedDistributor); }, [selectedDistributor]);

  const handleDeleteSession = async (id: number) => {
    setDeletingId(id);
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setDeletingId(null);
    loadStats();
  };

  const handleReset = async () => {
    setResetting(true);
    await fetch("/api/stats/reset", { method: "POST" });
    setConfirmReset(false);
    setResetting(false);
    loadStats();
  };

  const handleRestock = async () => {
    setRestocking(true);
    setRestockSuccess(false);
    try {
      await fetch("/api/stock/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distributor_id: selectedDistributor }),
      });
      setRestockSuccess(true);
      loadStock(selectedDistributor);
      setTimeout(() => setRestockSuccess(false), 3000);
    } catch { /* silent */ }
    finally { setRestocking(false); }
  };

  // Build stock map for display
  const stockMap: Record<number, number> = {};
  for (const s of stocks) stockMap[s.product_id] = s.quantity;

  const CATEGORIES: Record<string, string> = { meal: "Plats préparés", snack: "Snacks", drink: "Boissons" };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-200 border-t-teal-500" />
          Chargement des statistiques...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <p className="text-slate-400">Impossible de charger les statistiques.</p>
      </div>
    );
  }

  const o = stats.overview;
  const genderLabels: Record<string, string> = { male: "Homme", female: "Femme", other: "Autre", prefer_not: "Non précisé" };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1 — Vue d'ensemble
    const overviewRows = [
      { "Indicateur": "Sessions", "Valeur": o.totalSessions },
      { "Indicateur": "Achats", "Valeur": o.totalPurchases },
      { "Indicateur": "Revenu total (CHF)", "Valeur": o.totalRevenue },
      { "Indicateur": "Dépense moyenne (CHF)", "Valeur": o.avgSpend },
      { "Indicateur": "Budget moyen (CHF)", "Valeur": o.avgBudget },
      { "Indicateur": "Utilisation budget (%)", "Valeur": o.budgetUtilization },
      { "Indicateur": "Produit star", "Valeur": o.mostPopular },
      { "Indicateur": "Durée moy. session (s)", "Valeur": o.avgDuration },
      { "Indicateur": "Codes invalides", "Valeur": o.invalidCodes },
      { "Indicateur": "Annulations", "Valeur": o.cancellations },
      { "Indicateur": "Participants", "Valeur": o.totalParticipants },
    ];
    const ws1 = XLSX.utils.json_to_sheet(overviewRows);
    ws1["!cols"] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Vue d'ensemble");

    // Sheet 2 — Popularité produits
    const ws2 = XLSX.utils.json_to_sheet(
      stats.productPopularity.map((p) => ({
        "Produit": p.name,
        "Catégorie": p.category,
        "Ventes": p.count,
        "Revenu (CHF)": p.revenue,
      }))
    );
    ws2["!cols"] = [{ wch: 30 }, { wch: 14 }, { wch: 10 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Popularité produits");

    // Sheet 3 — Revenus par catégorie
    const ws3 = XLSX.utils.json_to_sheet(
      stats.categoryRevenue.map((c) => ({
        "Catégorie": c.name,
        "Revenu (CHF)": c.value,
        "Articles vendus": c.count,
      }))
    );
    ws3["!cols"] = [{ wch: 16 }, { wch: 14 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Revenus catégories");

    // Sheet 4 — Budget vs Dépenses
    const ws4 = XLSX.utils.json_to_sheet(
      stats.spendingDistribution.map((s) => ({
        "Participant": s.name,
        "Budget (CHF)": s.budget,
        "Dépensé (CHF)": s.spent,
        "Articles": s.items,
      }))
    );
    ws4["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws4, "Budget vs Dépenses");

    // Sheet 5 — Démographies
    const demoRows = [
      { "Type": "— Tranches d'âge —", "Valeur": "", "Count": "" },
      ...stats.demographics.age.map((d) => ({ "Type": d.name, "Valeur": "", "Count": d.value })),
      { "Type": "— Genre —", "Valeur": "", "Count": "" },
      ...stats.demographics.gender.map((d) => ({ "Type": genderLabels[d.name] || d.name, "Valeur": "", "Count": d.value })),
      { "Type": "— Allergies —", "Valeur": "", "Count": "" },
      ...stats.demographics.allergies.map((d) => ({ "Type": d.name.replace(/-/g, " "), "Valeur": "", "Count": d.value })),
    ];
    const ws5 = XLSX.utils.json_to_sheet(demoRows);
    ws5["!cols"] = [{ wch: 24 }, { wch: 10 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws5, "Démographies");

    // Sheet 6 — Sessions récentes
    const ws6 = XLSX.utils.json_to_sheet(
      stats.recentSessions.map((s) => ({
        "ID": s.id,
        "Participant": s.participant,
        "Budget (CHF)": s.budget,
        "Dépensé (CHF)": s.spent,
        "Articles": s.items,
        "Produits": s.products.map((p) => `${p.name}${p.quantity > 1 ? ` x${p.quantity}` : ""}`).join(", "),
        "Date": new Date(s.date).toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      }))
    );
    ws6["!cols"] = [{ wch: 6 }, { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 50 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws6, "Sessions récentes");

    XLSX.writeFile(wb, `safebox-stats-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportCSV = () => {
    const rows = [
      ["Indicateur", "Valeur"],
      ["Sessions", o.totalSessions],
      ["Achats", o.totalPurchases],
      ["Revenu total (CHF)", o.totalRevenue],
      ["Dépense moyenne (CHF)", o.avgSpend],
      ["Budget moyen (CHF)", o.avgBudget],
      ["Utilisation budget (%)", o.budgetUtilization],
      ["Produit star", o.mostPopular],
      ["Durée moy. session (s)", o.avgDuration],
      ["Participants", o.totalParticipants],
      [],
      ["Produit", "Catégorie", "Ventes", "Revenu (CHF)"],
      ...stats.productPopularity.map((p) => [p.name, p.category, p.count, p.revenue]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safebox-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">
              Safe<span className="text-teal-600">Box</span> <span className="text-base font-medium text-slate-400">Statistiques</span>
            </h1>
            <p className="text-xs text-slate-400">TM GutFree — Étude comportementale</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Export buttons */}
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              PDF
            </button>

            <div className="mx-1 h-6 w-px bg-slate-200" />

            {confirmReset ? (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 ring-1 ring-red-200">
                <span className="text-sm text-red-700">Tout supprimer ?</span>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {resetting ? "..." : "Confirmer"}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 ring-1 ring-red-200/60 hover:bg-red-100 transition-colors"
              >
                Réinitialiser
              </button>
            )}
            <a
              href="/"
              className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 transition-colors"
            >
              Retour accueil
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-10">

        {/* Overview metrics */}
        <section>
          <SectionTitle>Vue d&apos;ensemble</SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <MetricCard label="Sessions" value={o.totalSessions} accent />
            <MetricCard label="Achats" value={o.totalPurchases} />
            <MetricCard label="Revenu total" value={`${o.totalRevenue} CHF`} />
            <MetricCard label="Dépense moy." value={`${o.avgSpend} CHF`} sub={`Budget moy. ${o.avgBudget} CHF`} />
            <MetricCard label="Utilisation budget" value={`${o.budgetUtilization}%`} sub="Dépensé / alloué" />
            <MetricCard label="Produit star" value={o.mostPopular} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard label="Participants" value={o.totalParticipants} />
            <MetricCard label="Durée moy. session" value={o.avgDuration > 0 ? `${o.avgDuration}s` : "N/A"} />
            <MetricCard label="Codes invalides" value={o.invalidCodes} sub="Erreurs de saisie" />
            <MetricCard label="Annulations" value={o.cancellations} sub="Sélections annulées" />
          </div>
        </section>

        {/* ═══ STOCK PANEL ═══ */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionTitle>Niveaux de stock</SectionTitle>
            <div className="flex items-center gap-3">
              {/* Distributor selector */}
              <div className="flex rounded-xl overflow-hidden ring-1 ring-slate-200">
                {DISTRIBUTORS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDistributor(d.id)}
                    className={`px-4 py-2 text-xs font-semibold transition-colors ${
                      selectedDistributor === d.id
                        ? "bg-teal-500 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {d.id === "SAFEBOX-A" ? "Bât. A" : "Bât. B"}
                  </button>
                ))}
              </div>
              {/* Restock button */}
              <button
                onClick={handleRestock}
                disabled={restocking}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 ${
                  restockSuccess
                    ? "bg-emerald-500 text-white"
                    : "bg-teal-50 text-teal-700 ring-1 ring-teal-200 hover:bg-teal-100"
                }`}
              >
                {restocking ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                ) : restockSuccess ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {restockSuccess ? "Réapprovisionné !" : "Réapprovisionner"}
              </button>
            </div>
          </div>

          {stockLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-200 border-t-teal-500" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {allProducts.map((product) => {
                const qty = stockMap[product.id] ?? 0;
                const isOut = qty === 0;
                const isLow = !isOut && qty <= 3;
                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 ring-1 ${
                      isOut ? "bg-red-50 ring-red-100" : isLow ? "bg-orange-50 ring-orange-100" : "bg-slate-50 ring-slate-100"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{product.name}</p>
                      <p className="text-[10px] text-slate-400">{CATEGORIES[product.category] ?? product.category}</p>
                    </div>
                    <div className={`ml-2 shrink-0 rounded-lg px-2 py-1 text-xs font-bold ${
                      isOut ? "bg-red-500 text-white" : isLow ? "bg-orange-400 text-white" : "bg-emerald-500 text-white"
                    }`}>
                      {qty}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Charts row */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product popularity */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <SectionTitle>Popularité des produits</SectionTitle>
            {stats.productPopularity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.productPopularity.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} vendus`, "Quantité"]} />
                  <Bar dataKey="count" fill="#0d9488" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-slate-400">Aucune donnée encore</p>
            )}
          </section>

          {/* Category revenue */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <SectionTitle>Revenus par catégorie</SectionTitle>
            {stats.categoryRevenue.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="60%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.categoryRevenue}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.categoryRevenue.map((entry) => (
                        <Cell key={entry.name} fill={CAT_COLORS[entry.name] || "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} CHF`, "Revenu"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {stats.categoryRevenue.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CAT_COLORS[cat.name] || "#94a3b8" }} />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{cat.name}</p>
                        <p className="text-xs text-slate-400">{cat.value} CHF &middot; {cat.count} articles</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-slate-400">Aucune donnée encore</p>
            )}
          </section>
        </div>

        {/* Budget vs Spend scatter */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <SectionTitle>Budget alloué vs Dépenses réelles</SectionTitle>
          {stats.spendingDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ bottom: 10, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="budget" name="Budget" unit=" CHF" tick={{ fontSize: 12 }} />
                <YAxis dataKey="spent" name="Dépensé" unit=" CHF" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v, name) => [`${v} CHF`, name === "budget" ? "Budget" : "Dépensé"]} />
                <Scatter data={stats.spendingDistribution} fill="#0d9488" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-slate-400">Aucune donnée encore</p>
          )}
        </section>

        {/* Demographics */}
        <div className="grid gap-8 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <SectionTitle>Tranches d&apos;âge</SectionTitle>
            {stats.demographics.age.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.demographics.age}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">Aucune donnée</p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <SectionTitle>Genre</SectionTitle>
            {stats.demographics.gender.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats.demographics.gender.map((g) => ({ ...g, name: genderLabels[g.name] || g.name }))} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {stats.demographics.gender.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">Aucune donnée</p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <SectionTitle>Allergies déclarées</SectionTitle>
            {stats.demographics.allergies.length > 0 ? (
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {stats.demographics.allergies.map((a) => (
                  <div key={a.name} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 capitalize">{a.name.replace(/-/g, " ")}</span>
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">{a.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">Aucune allergie déclarée</p>
            )}
          </section>
        </div>

        {/* Recent sessions table */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>Sessions récentes</SectionTitle>
            <span className="text-xs text-slate-400">{stats.recentSessions.length} dernières sessions</span>
          </div>
          {stats.recentSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="pb-3 pr-4 font-semibold text-slate-500">Participant</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-500">Budget</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-500">Dépensé</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-500">Articles</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-500">Produits achetés</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-500">Date</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSessions.map((s) => (
                    <tr key={s.id} className="group border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 pr-4 font-medium text-slate-700">{s.participant}</td>
                      <td className="py-3 pr-4 text-slate-600">{s.budget} CHF</td>
                      <td className="py-3 pr-4 font-semibold text-teal-600">{s.spent} CHF</td>
                      <td className="py-3 pr-4 text-slate-600">{s.items}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {s.products.map((p, i) => (
                            <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {p.name}{p.quantity > 1 ? ` x${p.quantity}` : ""}
                            </span>
                          ))}
                          {s.products.length === 0 && <span className="text-xs text-slate-300">Aucun</span>}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-400">
                        {new Date(s.date).toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteSession(s.id)}
                          disabled={deletingId === s.id}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
                          title="Supprimer cette session"
                        >
                          {deletingId === s.id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border border-slate-300 border-t-slate-500" />
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">Aucune session enregistrée</p>
          )}
        </section>

      </div>
    </div>
  );
}
