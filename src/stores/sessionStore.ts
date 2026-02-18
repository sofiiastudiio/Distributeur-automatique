"use client";

import { create } from "zustand";

interface SessionState {
  sessionId: number | null;
  participantId: number | null;
  budget: number;
  amountSpent: number;
  status: "idle" | "active" | "completed";
  moneyInserted: boolean;
  setSession: (sessionId: number, participantId: number) => void;
  insertMoney: (amount: number) => Promise<void>;
  addSpending: (amount: number) => void;
  remaining: () => number;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  participantId: null,
  budget: 0,
  amountSpent: 0,
  status: "idle",
  moneyInserted: false,

  setSession: (sessionId, participantId) =>
    set({ sessionId, participantId, budget: 0, amountSpent: 0, status: "active", moneyInserted: false }),

  insertMoney: async (amount) => {
    const { sessionId, budget } = get();
    set({ budget: budget + amount, moneyInserted: true });
    if (sessionId) {
      try {
        await fetch(`/api/sessions/${sessionId}/budget`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });
      } catch { /* silent */ }
    }
  },

  addSpending: (amount) =>
    set((state) => ({ amountSpent: state.amountSpent + amount })),

  remaining: () => {
    const state = get();
    return Math.max(0, state.budget - state.amountSpent);
  },

  reset: () =>
    set({
      sessionId: null,
      participantId: null,
      budget: 0,
      amountSpent: 0,
      status: "idle",
      moneyInserted: false,
    }),
}));
