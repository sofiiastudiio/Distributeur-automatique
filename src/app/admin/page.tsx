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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => setError(true));
  }, [router]);

  if (error) return <div className="p-8 text-center text-danger">Erreur de chargement</div>;
  if (!stats) return <div className="p-8 text-center text-foreground/40">Chargement...</div>;

  return (
    <div className="min-h-dvh p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard SafeBox</h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/sessions")}
            className="rounded-xl bg-surface px-4 py-2 text-sm hover:bg-surface-light"
          >
            Sessions
          </button>
          <button
            onClick={() => router.push("/admin/export")}
            className="rounded-xl bg-surface px-4 py-2 text-sm hover:bg-surface-light"
          >
            Export
          </button>
        </div>
      </div>

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
        {/* Product popularity */}
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

        {/* Category revenue */}
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

        {/* Budget vs Spend scatter */}
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

        {/* Feedback */}
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
                      style={{
                        width: `${(count / stats.totalSessions) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-foreground/50">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
