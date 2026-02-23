"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter,
} from "recharts";

interface Stats {
  totalSessions: number;
  avgSpend: number;
  avgBudget: number;
  budgetUtilization: number;
  mostPopular: string;
  avgDuration: number;
  spendingDistribution: { spent: number; budget: number }[];
  productPopularity: { name: string; count: number }[];
  categoryRevenue: { name: string; value: number }[];
  avgRealism: number;
  wouldUseCounts: Record<string, number>;
}

const COLORS = ["#0D9488", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"];
const CATEGORY_NAMES: Record<string, string> = { meal: "Plats", snack: "Snacks", drink: "Boissons" };

type Tab = "stats" | "export";

const EXPORTS = [
  {
    type: "sessions",
    label: "Sessions complètes",
    desc: "Sessions, participants, budget, dépense, durée, feedback — 4 onglets",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0",
    recommended: true,
  },
  {
    type: "purchases",
    label: "Achats",
    desc: "Tous les achats avec produit, quantité et prix",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    recommended: false,
  },
  {
    type: "events",
    label: "Événements",
    desc: "Tracking comportemental complet (clics, hésitations, navigation)",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    recommended: false,
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("stats");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setStats(data); })
      .catch(() => setError(true));
  }, [router]);

  if (error) return <div className="p-8 text-center text-danger">Erreur de chargement</div>;
  if (!stats) return <div className="p-8 text-center text-foreground/40">Chargement...</div>;

  const download = (type: string, format: string) => {
    window.open(`/api/admin/export?type=${type}&format=${format}`, "_blank");
  };

  return (
    <div className="min-h-dvh p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard SafeBox</h1>
        <button
          onClick={() => router.push("/admin/sessions")}
          className="rounded-xl bg-surface px-4 py-2 text-sm hover:bg-surface-light"
        >
          Sessions détaillées
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-2xl bg-surface p-1 w-fit">
        {([
          { key: "stats", label: "Statistiques", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
          { key: "export", label: "Exporter", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
        ] as { key: Tab; label: string; icon: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              tab === t.key
                ? "bg-white shadow text-foreground"
                : "text-foreground/50 hover:text-foreground/80"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: STATS ── */}
      {tab === "stats" && (
        <>
          {/* Metric cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Sessions", value: stats.totalSessions, color: "text-primary-light" },
              { label: "Dépense moy.", value: `CHF ${stats.avgSpend}`, color: "text-accent" },
              { label: "Budget moy.", value: `CHF ${stats.avgBudget}`, color: "text-foreground" },
              { label: "Utilisation", value: `${stats.budgetUtilization}%`, color: "text-success" },
              { label: "Top produit", value: stats.mostPopular, color: "text-primary-light", small: true },
              { label: "Durée moy.", value: `${stats.avgDuration}s`, color: "text-foreground" },
            ].map((m) => (
              <div key={m.label} className="glass rounded-2xl p-4">
                <p className="text-xs text-foreground/50">{m.label}</p>
                <p className={`${m.color} ${(m as { small?: boolean }).small ? "text-sm" : "text-xl"} font-bold mt-1`}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 font-semibold">Popularité des produits</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.productPopularity.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" stroke="#64748B" />
                  <YAxis type="category" dataKey="name" width={150} stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="#0D9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 font-semibold">Revenus par catégorie</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.categoryRevenue.map((c) => ({ ...c, name: CATEGORY_NAMES[c.name] || c.name }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    label={({ name, value }) => `${name}: CHF ${value}`}
                  >
                    {stats.categoryRevenue.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 font-semibold">Budget vs Dépense réelle</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="budget" name="Budget" stroke="#64748B" />
                  <YAxis dataKey="spent" name="Dépensé" stroke="#64748B" />
                  <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px" }} />
                  <Scatter data={stats.spendingDistribution} fill="#F59E0B" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 font-semibold">Feedback</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/50">Réalisme moyen</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-accent">{stats.avgRealism}</span>
                    <span className="text-foreground/40">/ 5</span>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm text-foreground/50">Utiliserait SafeBox ?</p>
                  {Object.entries(stats.wouldUseCounts).map(([key, count]) => (
                    <div key={key} className="mb-1 flex items-center gap-2">
                      <span className="w-24 text-sm capitalize">{key}</span>
                      <div className="h-4 flex-1 rounded-full bg-surface-light">
                        <div
                          className="h-4 rounded-full bg-primary"
                          style={{ width: `${(count / stats.totalSessions) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-foreground/50">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TAB: EXPORT ── */}
      {tab === "export" && (
        <div className="space-y-4 max-w-3xl">

          {/* PDF */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Rapport PDF</p>
                  <p className="text-sm text-foreground/50">KPIs, graphiques et top produits — prêt à imprimer</p>
                </div>
              </div>
              <button
                onClick={() => window.open("/admin/print", "_blank")}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light active:scale-95 transition-all"
              >
                Télécharger PDF
              </button>
            </div>
          </div>

          {/* Excel / CSV / JSON exports */}
          {EXPORTS.map(({ type, label, desc, icon, recommended }) => (
            <div key={type} className={`glass rounded-2xl p-6 ${recommended ? "ring-2 ring-accent/30" : ""}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${recommended ? "bg-accent/10" : "bg-surface-light"}`}>
                    <svg className={`h-6 w-6 ${recommended ? "text-accent" : "text-foreground/50"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{label}</p>
                      {recommended && (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                          Recommandé
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/50">{desc}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => download(type, "xlsx")}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                    </svg>
                    Excel
                  </button>
                  <button
                    onClick={() => download(type, "csv")}
                    className="rounded-xl bg-surface px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-surface-light active:scale-95 transition-all"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => download(type, "json")}
                    className="rounded-xl bg-surface px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-surface-light active:scale-95 transition-all"
                  >
                    JSON
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
