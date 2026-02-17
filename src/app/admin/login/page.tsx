"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="glass w-full max-w-sm rounded-3xl p-8">
        <h2 className="mb-6 text-2xl font-bold text-center">Admin SafeBox</h2>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="mb-4 w-full rounded-xl bg-surface-light px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
        />

        {error && (
          <p className="mb-4 text-center text-sm text-danger">Mot de passe incorrect</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary-light disabled:opacity-40"
        >
          {loading ? "..." : "Connexion"}
        </button>
      </form>
    </div>
  );
}
