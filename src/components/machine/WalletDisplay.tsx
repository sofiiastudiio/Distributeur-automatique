"use client";

import { useSessionStore } from "@/stores/sessionStore";
import { useCartStore } from "@/stores/cartStore";

export function WalletDisplay() {
  const budget = useSessionStore((s) => s.budget);
  const amountSpent = useSessionStore((s) => s.amountSpent);
  const cartTotal = useCartStore((s) => s.total());
  const remaining = budget - amountSpent - cartTotal;
  const pct = budget > 0 ? (remaining / budget) * 100 : 0;

  const color =
    pct > 50 ? "text-success" : pct > 20 ? "text-accent" : "text-danger";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xl">💰</span>
      <span className={`text-lg font-bold ${color}`}>
        CHF {remaining.toFixed(2)}
      </span>
    </div>
  );
}
