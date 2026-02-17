"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SessionRow {
  id: number;
  participant: { name: string | null; age_range: string; gender: string };
  budget_set: number;
  total_spent: number;
  items_purchased: number;
  session_start: string;
  session_end: string | null;
  completed: boolean;
  feedback_realism: number | null;
  feedback_would_use: string | null;
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/export?type=sessions&format=json")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((data) => { if (data) { setSessions(data); setLoading(false); } })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="p-8 text-center text-foreground/40">Chargement...</div>;

  return (
    <div className="min-h-dvh p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <button
          onClick={() => router.push("/admin")}
          className="rounded-xl bg-surface px-4 py-2 text-sm hover:bg-surface-light"
        >
          ← Dashboard
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/10 text-left text-foreground/50">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Participant</th>
              <th className="px-3 py-2">Âge</th>
              <th className="px-3 py-2">Budget</th>
              <th className="px-3 py-2">Dépensé</th>
              <th className="px-3 py-2">Articles</th>
              <th className="px-3 py-2">Durée</th>
              <th className="px-3 py-2">Réalisme</th>
              <th className="px-3 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const duration = s.session_end
                ? Math.round(
                    (new Date(s.session_end).getTime() - new Date(s.session_start).getTime()) / 1000
                  )
                : null;
              return (
                <tr
                  key={s.id}
                  className="border-b border-foreground/5 hover:bg-surface/50 cursor-pointer"
                  onClick={() => router.push(`/admin/sessions/${s.id}`)}
                >
                  <td className="px-3 py-2">{s.id}</td>
                  <td className="px-3 py-2">{s.participant.name || "Anonyme"}</td>
                  <td className="px-3 py-2">{s.participant.age_range}</td>
                  <td className="px-3 py-2">CHF {s.budget_set.toFixed(2)}</td>
                  <td className="px-3 py-2 text-accent">CHF {s.total_spent.toFixed(2)}</td>
                  <td className="px-3 py-2">{s.items_purchased}</td>
                  <td className="px-3 py-2">{duration ? `${duration}s` : "—"}</td>
                  <td className="px-3 py-2">{s.feedback_realism ? `${s.feedback_realism}/5` : "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      s.completed ? "bg-success/15 text-success" : "bg-accent/15 text-accent"
                    }`}>
                      {s.completed ? "Terminée" : "En cours"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sessions.length === 0 && (
          <p className="py-12 text-center text-foreground/40">Aucune session enregistrée</p>
        )}
      </div>
    </div>
  );
}
