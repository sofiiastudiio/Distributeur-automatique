"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
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

export default function PrintDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setStats(data); });
  }, [router]);

  useEffect(() => {
    if (stats) {
      // Auto-trigger print after charts render
      const timer = setTimeout(() => window.print(), 800);
      return () => clearTimeout(timer);
    }
  }, [stats]);

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Chargement du rapport...</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("fr-CH", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 1.5cm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-white p-8 text-slate-800" style={{ fontFamily: "system-ui, sans-serif" }}>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-teal-700">SafeBox — Rapport statistiques</h1>
            <p className="mt-1 text-sm text-slate-400">Étude comportementale GutFree · Généré le {today}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Imprimer / PDF
          </button>
        </div>

        {/* KPI grid */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Sessions complétées", value: stats.totalSessions },
            { label: "Dépense moyenne", value: `CHF ${stats.avgSpend}` },
            { label: "Budget moyen", value: `CHF ${stats.avgBudget}` },
            { label: "Utilisation budget", value: `${stats.budgetUtilization}%` },
            { label: "Durée moyenne", value: `${stats.avgDuration}s` },
            { label: "Réalisme moyen", value: `${stats.avgRealism} / 5` },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-400">{m.label}</p>
              <p className="mt-1 text-2xl font-bold text-teal-700">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          {/* Product popularity */}
          <div className="rounded-xl border border-slate-100 p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
              Popularité des produits
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.productPopularity.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={10} />
                <YAxis type="category" dataKey="name" width={130} stroke="#94A3B8" fontSize={9} />
                <Tooltip />
                <Bar dataKey="count" fill="#0D9488" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category revenue */}
          <div className="rounded-xl border border-slate-100 p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
              Revenus par catégorie (CHF)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.categoryRevenue.map((c) => ({ ...c, name: CATEGORY_NAMES[c.name] || c.name }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={40}
                  label={({ name, value }) => `${name}: CHF ${value}`}
                  labelLine={false}
                >
                  {stats.categoryRevenue.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback section */}
        <div className="mb-8 rounded-xl border border-slate-100 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
            Feedback participants
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="mb-1 text-xs text-slate-400">Réalisme perçu (moyenne)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-teal-700">{stats.avgRealism}</span>
                <span className="text-slate-400">/ 5</span>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs text-slate-400">Utiliserait SafeBox ?</p>
              <div className="space-y-2">
                {Object.entries(stats.wouldUseCounts).map(([key, count]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-24 text-xs capitalize text-slate-600">{key}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-teal-500"
                        style={{ width: `${(count / stats.totalSessions) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-xs text-slate-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top product table */}
        <div className="rounded-xl border border-slate-100 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
            Top 10 produits
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="pb-2 text-left font-semibold">#</th>
                <th className="pb-2 text-left font-semibold">Produit</th>
                <th className="pb-2 text-right font-semibold">Ventes</th>
              </tr>
            </thead>
            <tbody>
              {stats.productPopularity.slice(0, 10).map((p, i) => (
                <tr key={p.name} className="border-b border-slate-50">
                  <td className="py-1.5 text-slate-300">{i + 1}</td>
                  <td className="py-1.5 font-medium text-slate-700">{p.name}</td>
                  <td className="py-1.5 text-right font-bold text-teal-700">{p.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-slate-100 pt-4 text-center text-xs text-slate-300">
          SafeBox · Étude comportementale GutFree · Confidentiel
        </div>
      </div>
    </>
  );
}
