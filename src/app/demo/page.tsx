"use client";

import Link from "next/link";

export default function DemoSelector() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <h1 className="text-3xl font-bold">Choisissez un style de distributeur</h1>
      <p className="text-foreground/60 max-w-md text-center">
        3 prototypes visuels pour simuler un distributeur automatique. Cliquez pour comparer.
      </p>
      <div className="grid gap-6 md:grid-cols-3 w-full max-w-4xl">
        <Link href="/demo/classique" className="glass rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform">
          <div className="text-5xl mb-4">🏭</div>
          <h2 className="text-xl font-bold mb-2">Classique</h2>
          <p className="text-sm text-foreground/60">
            Grille avec compartiments vitrés numérotés, cadre métallique, spirales — style Selecta
          </p>
        </Link>
        <Link href="/demo/moderne" className="glass rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-xl font-bold mb-2">Moderne</h2>
          <p className="text-sm text-foreground/60">
            Borne tactile épurée type McDonald&apos;s kiosk, navigation fluide, grandes images
          </p>
        </Link>
        <Link href="/demo/hybride" className="glass rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform">
          <div className="text-5xl mb-4">🔲</div>
          <h2 className="text-xl font-bold mb-2">Hybride</h2>
          <p className="text-sm text-foreground/60">
            Cadre métallique de vrai distributeur avec interface tactile moderne à l&apos;intérieur
          </p>
        </Link>
      </div>
    </div>
  );
}
