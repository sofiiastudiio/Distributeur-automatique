"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function SafeBoxLogo() {
  return (
    <svg width={88} height={88} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="72" height="72" rx="18" fill="url(#wlGrad)" />
      <path d="M40 16C40 16 22 22 22 22V42C22 54 40 66 40 66C40 66 58 54 58 42V22L40 16Z" fill="white" fillOpacity="0.2" />
      <path d="M40 20C40 20 26 25 26 25V41C26 51 40 61 40 61C40 61 54 51 54 41V25L40 20Z" fill="white" fillOpacity="0.15" />
      <path d="M33 40L38 45L48 33" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="14" r="2" fill="white" fillOpacity="0.5" />
      <circle cx="62" cy="12" r="1.5" fill="white" fillOpacity="0.4" />
      <defs>
        <linearGradient id="wlGrad" x1="4" y1="4" x2="76" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06B6D4" />
          <stop offset="0.5" stopColor="#0D9488" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const FEATURES = [
  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "0 allergène", sub: "14 allergènes majeurs exclus" },
  { icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4", label: "Traçabilité", sub: "Scan QR par produit" },
  { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", label: "100% suisse", sub: "Ateliers certifiés" },
];

export default function WelcomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/30 px-6">
      {/* Soft background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-teal-200/30 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-200/30 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/3 right-1/4 h-[250px] w-[250px] rounded-full bg-cyan-100/40 blur-[100px]" />
      </div>

      {/* Dot pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(circle, rgb(148 163 184 / 0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Logo with soft glow */}
        <div className="relative mb-8">
          <SafeBoxLogo />
          <div className="absolute -inset-6 -z-10 rounded-full bg-teal-400/15 blur-2xl" />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-6xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
            Safe
          </span>
          <span className="text-slate-800">Box</span>
        </h1>

        <p className="mb-1 text-lg font-medium text-slate-500">
          Distributeur automatique sans allergènes
        </p>
        <p className="mb-10 text-xs font-medium uppercase tracking-[0.3em] text-teal-600/50">
          TM GutFree — Étude comportementale
        </p>

        {/* Feature pills */}
        <div className={`mb-12 flex flex-wrap justify-center gap-3 transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-3 rounded-2xl bg-white/70 px-5 py-3 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 ring-1 ring-teal-200/40">
                <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                <p className="text-[11px] text-slate-400">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className={`transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <button
            onClick={() => router.push("/machine")}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-14 py-5 text-lg font-bold text-white shadow-xl shadow-teal-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/30 hover:scale-[1.03] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative flex items-center gap-3">
              Commencer
              <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        {/* Bottom subtle text */}
        <p className={`mt-16 text-[11px] text-slate-400 transition-all duration-1000 delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
          Scannez les QR codes sur la machine pour consulter les fiches produit
        </p>
      </div>
    </div>
  );
}
