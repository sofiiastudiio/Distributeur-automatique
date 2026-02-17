"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import {
  AGE_RANGES,
  GENDER_OPTIONS,
  ALLERGENS,
  DIETARY_PREFERENCES,
  VENDING_FREQUENCY,
  WOULD_SEEK_OPTIONS,
  BUDGET_MIN,
  BUDGET_MAX,
  BUDGET_DEFAULT,
} from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age_range: "",
    gender: "",
    allergies: [] as string[],
    dietary_prefs: [] as string[],
    vending_freq: "",
    would_seek: "",
    budget: BUDGET_DEFAULT,
  });

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setSession(data.session_id, data.participant_id, form.budget);
      router.push("/machine");
    } catch {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.age_range && form.gender;
    if (step === 1) return true;
    if (step === 2) return form.vending_freq && form.would_seek;
    return true;
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="glass w-full max-w-lg rounded-3xl p-8">
        <div className="mb-6 flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
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
              <label className="mb-2 block text-sm text-foreground/60">Prénom (optionnel)</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl bg-surface-light px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
                placeholder="Votre prénom"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-foreground/60">Tranche d&apos;âge *</label>
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
              <label className="mb-2 block text-sm text-foreground/60">Genre *</label>
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
            <h2 className="text-2xl font-bold">Allergies & régime</h2>

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

            <div>
              <label className="mb-2 block text-sm text-foreground/60">
                Préférences alimentaires
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DIETARY_PREFERENCES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() =>
                      setForm({
                        ...form,
                        dietary_prefs: toggleArray(form.dietary_prefs, d.value),
                      })
                    }
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      form.dietary_prefs.includes(d.value)
                        ? "bg-primary text-white"
                        : "bg-surface-light text-foreground/70 hover:bg-surface-light/70"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Vos habitudes</h2>

            <div>
              <label className="mb-2 block text-sm text-foreground/60">
                À quelle fréquence utilisez-vous un distributeur automatique ?
              </label>
              <div className="space-y-2">
                {VENDING_FREQUENCY.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setForm({ ...form, vending_freq: v.value })}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                      form.vending_freq === v.value
                        ? "bg-primary text-white"
                        : "bg-surface-light text-foreground/70 hover:bg-surface-light/70"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-foreground/60">
                Rechercheriez-vous un distributeur garantissant l&apos;absence d&apos;allergènes ?
              </label>
              <div className="space-y-2">
                {WOULD_SEEK_OPTIONS.map((w) => (
                  <button
                    key={w.value}
                    onClick={() => setForm({ ...form, would_seek: w.value })}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                      form.would_seek === w.value
                        ? "bg-primary text-white"
                        : "bg-surface-light text-foreground/70 hover:bg-surface-light/70"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Votre portefeuille</h2>
            <p className="text-foreground/60">
              Imaginez que vous disposez de ce montant pour vos achats dans le distributeur.
            </p>

            <div className="text-center">
              <div className="mb-4 text-5xl font-bold text-accent">
                CHF {form.budget.toFixed(0)}
              </div>
              <input
                type="range"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={5}
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: parseInt(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="mt-2 flex justify-between text-sm text-foreground/40">
                <span>CHF {BUDGET_MIN}</span>
                <span>CHF {BUDGET_MAX}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-xl bg-surface px-6 py-3 font-medium text-foreground/70 transition-colors hover:bg-surface-light"
            >
              Retour
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="rounded-xl bg-primary px-8 py-3 font-semibold text-white transition-all hover:bg-primary-light active:scale-95 disabled:opacity-40"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-accent px-8 py-3 font-semibold text-background transition-all hover:bg-accent-light active:scale-95 disabled:opacity-40"
            >
              {submitting ? "Chargement..." : "Accéder au distributeur"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
