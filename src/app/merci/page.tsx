"use client";

import { useAutoReset } from "@/hooks/useAutoReset";

export default function MerciPage() {
  const countdown = useAutoReset();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="animate-fade-in-up text-center">
        <div className="mb-6 text-7xl">🎉</div>
        <h1 className="mb-4 text-5xl font-bold text-primary-light">Merci !</h1>
        <p className="mb-2 text-xl text-foreground/70">
          Votre participation nous aide à améliorer SafeBox.
        </p>
        <p className="mb-8 text-foreground/40">
          TM GutFree — Étude comportementale
        </p>

        <div className="glass inline-block rounded-2xl px-8 py-4">
          <p className="text-foreground/50">Retour à l&apos;accueil dans</p>
          <p className="text-4xl font-bold text-accent">{countdown}s</p>
        </div>
      </div>
    </div>
  );
}
