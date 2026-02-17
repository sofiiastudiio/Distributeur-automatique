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

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { type: "sessions", label: "Sessions", desc: "Toutes les sessions avec données participants" },
          { type: "purchases", label: "Achats", desc: "Tous les achats avec détails produits" },
          { type: "events", label: "Événements", desc: "Tous les événements de tracking" },
        ].map(({ type, label, desc }) => (
          <div key={type} className="glass rounded-2xl p-6">
            <h3 className="mb-2 text-lg font-semibold">{label}</h3>
            <p className="mb-4 text-sm text-foreground/50">{desc}</p>
            <div className="flex gap-3">
              <button
                onClick={() => download(type, "csv")}
                className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
              >
                CSV
              </button>
              <button
                onClick={() => download(type, "json")}
                className="flex-1 rounded-xl bg-surface px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-surface-light"
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
