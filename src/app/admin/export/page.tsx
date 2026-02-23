"use client";

import { useRouter } from "next/navigation";

export default function AdminExportPage() {
  const router = useRouter();

  const download = (type: string, format: string) => {
    window.open(`/api/admin/export?type=${type}&format=${format}`, "_blank");
  };

  return (
    <div className="min-h-dvh p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exporter les données</h1>
        <button
          onClick={() => router.push("/admin")}
          className="rounded-xl bg-surface px-4 py-2 text-sm hover:bg-surface-light"
        >
          ← Dashboard
        </button>
      </div>

      {/* Excel complet — export recommandé */}
      <div className="mb-6 glass rounded-2xl p-6 border-2 border-accent/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📊</span>
              <h2 className="text-lg font-bold">Export Excel complet</h2>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">Recommandé</span>
            </div>
            <p className="text-sm text-foreground/50 mb-4">
              Classeur Excel avec 4 onglets : Sessions, Achats, Statistiques résumées, Feedback — idéal pour l&apos;analyse.
            </p>
            <button
              onClick={() => download("sessions", "xlsx")}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* PDF du dashboard */}
      <div className="mb-6 glass rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📄</span>
              <h2 className="text-lg font-bold">Export PDF du dashboard</h2>
            </div>
            <p className="text-sm text-foreground/50 mb-4">
              Ouvre le dashboard dans un nouvel onglet et lance l&apos;impression. Choisissez &quot;Enregistrer en PDF&quot; dans la boîte de dialogue.
            </p>
            <button
              onClick={() => window.open("/admin/print", "_blank")}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-light active:scale-95 transition-all"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimer / Enregistrer PDF
            </button>
          </div>
        </div>
      </div>

      {/* Exports individuels */}
      <h2 className="mb-3 text-base font-semibold text-foreground/60">Exports individuels</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { type: "sessions", label: "Sessions", desc: "Toutes les sessions avec données participants" },
          { type: "purchases", label: "Achats", desc: "Tous les achats avec détails produits" },
          { type: "events", label: "Événements", desc: "Tous les événements de tracking comportemental" },
        ].map(({ type, label, desc }) => (
          <div key={type} className="glass rounded-2xl p-5">
            <h3 className="mb-1 font-semibold">{label}</h3>
            <p className="mb-4 text-sm text-foreground/50">{desc}</p>
            <div className="flex gap-2">
              <button
                onClick={() => download(type, "xlsx")}
                className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Excel
              </button>
              <button
                onClick={() => download(type, "csv")}
                className="flex-1 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-light transition-colors"
              >
                CSV
              </button>
              <button
                onClick={() => download(type, "json")}
                className="flex-1 rounded-xl bg-surface px-3 py-2 text-xs font-medium text-foreground/70 hover:bg-surface-light transition-colors"
              >
                JSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
