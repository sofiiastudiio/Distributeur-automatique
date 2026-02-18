"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import {
  AGE_RANGES,
  GENDER_OPTIONS,
  ALLERGENS,
} from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    age_range: "",
    gender: "",
    allergies: [] as string[],
  });

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Erreur ${res.status}: ${text || res.statusText}`);
      }
      const data = await res.json();
      setSession(data.session_id, data.participant_id);
      router.push("/machine");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-6 sm:py-10">
      <div className="glass flex w-full max-w-lg flex-col rounded-3xl p-6 sm:p-8" style={{ maxHeight: "calc(100dvh - 48px)" }}>
        {/* Progress dots */}
        <div className="mb-4 sm:mb-6 flex shrink-0 justify-center gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-2 w-12 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-surface-light"
              }`}
            />
          ))}
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Vos informations</h2>

              <div>
                <label className="mb-2 block text-sm text-foreground/60">Tranche d&apos;âge</label>
                <div className="grid grid-cols-3 gap-2">
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age}
                      onClick={() => setForm({ ...form, age_range: age })}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        form.age_range === age
                          ? "bg-primary text-white"
                          : "bg-surface-light text-foreground/70 hover:bg-surface-light/70"
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-foreground/60">Genre</label>
                <div className="grid grid-cols-2 gap-2">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setForm({ ...form, gender: g.value })}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        form.gender === g.value
                          ? "bg-primary text-white"
                          : "bg-surface-light text-foreground/70 hover:bg-surface-light/70"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="mb-3 text-2xl font-bold">Allergies</h2>
              <p className="mb-3 text-sm text-foreground/60">
                Avez-vous des allergies alimentaires ?
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setForm({ ...form, allergies: [] })}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    form.allergies.length === 0
                      ? "bg-primary text-white"
                      : "bg-surface-light text-foreground/70 hover:bg-surface-light/70"
                  }`}
                >
                  Aucune allergie
                </button>
                {ALLERGENS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() =>
                      setForm({ ...form, allergies: toggleArray(form.allergies, a.id) })
                    }
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      form.allergies.includes(a.id)
                        ? "bg-primary text-white"
                        : "bg-surface-light text-foreground/70 hover:bg-surface-light/70"
                    }`}
                  >
                    <span>{a.icon}</span> {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 shrink-0 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Fixed bottom buttons */}
        <div className="mt-4 shrink-0">
          {step === 0 ? (
            <div className="flex items-center justify-between">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl px-5 py-3 text-sm font-medium text-foreground/50 transition-colors hover:bg-surface-light active:scale-95"
              >
                Passer
              </button>
              <button
                onClick={() => setStep(step + 1)}
                className="rounded-xl bg-primary px-8 py-3 font-semibold text-white transition-all hover:bg-primary-light active:scale-95"
              >
                Suivant
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-xl bg-accent px-8 py-3 font-semibold text-background transition-all hover:bg-accent-light active:scale-95 disabled:opacity-40"
              >
                {submitting ? "Chargement..." : "Accéder au distributeur"}
              </button>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(step - 1)}
                  className="rounded-xl px-5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-surface-light"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl px-5 py-2 text-sm font-medium text-foreground/50 transition-colors hover:bg-surface-light active:scale-95"
                >
                  Passer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
