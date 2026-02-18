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
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setSession(data.session_id, data.participant_id);
      router.push("/machine");
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="glass w-full max-w-lg rounded-3xl p-8">
        <div className="mb-6 flex justify-center gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-2 w-12 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-surface-light"
              }`}
            />
          ))}
        </div>

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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Allergies</h2>

            <div>
              <label className="mb-2 block text-sm text-foreground/60">
                Avez-vous des allergies alimentaires ?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setForm({ ...form, allergies: [] })}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
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
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
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
          </div>
        )}

        <div className="mt-8">
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
            <div className="space-y-3">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-xl bg-accent px-8 py-4 font-semibold text-background transition-all hover:bg-accent-light active:scale-95 disabled:opacity-40"
              >
                {submitting ? "Chargement..." : "Accéder au distributeur"}
              </button>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(step - 1)}
                  className="rounded-xl bg-surface px-6 py-3 font-medium text-foreground/70 transition-colors hover:bg-surface-light"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl px-5 py-3 text-sm font-medium text-foreground/50 transition-colors hover:bg-surface-light active:scale-95"
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
