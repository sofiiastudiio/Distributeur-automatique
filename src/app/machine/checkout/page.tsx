"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";

export default function CheckoutPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"dispensing" | "receipt">("dispensing");
  const budget = useSessionStore((s) => s.budget);
  const amountSpent = useSessionStore((s) => s.amountSpent);

  useEffect(() => {
    const timer = setTimeout(() => setPhase("receipt"), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (phase === "dispensing") {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <div className="relative h-64 w-48 overflow-hidden rounded-2xl border-2 border-primary/30 bg-surface">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary/50" />
          <div className="animate-dispense absolute inset-x-4 top-0 flex h-20 items-center justify-center rounded-xl bg-gradient-to-b from-primary/20 to-primary/5 text-4xl">
            📦
          </div>
          <div className="absolute inset-x-0 bottom-0 h-12 rounded-b-2xl bg-surface-light" />
        </div>
        <p className="mt-6 text-xl font-semibold text-primary-light animate-pulse">
          Distribution en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12">
      <div className="glass max-w-md rounded-3xl p-8 text-center animate-fade-in-up">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="mb-2 text-2xl font-bold">Achat confirmé !</h2>
        <p className="mb-6 text-foreground/60">
          Vos articles ont été distribués avec succès.
        </p>

        <div className="mb-6 rounded-xl bg-surface p-4">
          <div className="flex justify-between text-sm text-foreground/60">
            <span>Total dépensé</span>
            <span className="font-bold text-accent">CHF {amountSpent.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-foreground/60">
            <span>Solde restant</span>
            <span className="font-bold text-success">
              CHF {(budget - amountSpent).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/machine")}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary-light active:scale-95"
          >
            Continuer mes achats
          </button>
          <button
            onClick={() => router.push("/feedback")}
            className="rounded-xl bg-surface px-6 py-3 font-medium text-foreground/70 transition-colors hover:bg-surface-light"
          >
            Terminer la session
          </button>
        </div>
      </div>
    </div>
  );
}
