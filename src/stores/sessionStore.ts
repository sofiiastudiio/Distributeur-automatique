"use client";

import { create } from "zustand";

interface SessionState {
  sessionId: number | null;
  participantId: number | null;
  budget: number;
  amountSpent: number;
  status: "idle" | "active" | "completed";
  setSession: (sessionId: number, participantId: number, budget: number) => void;
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

  setSession: (sessionId, participantId, budget) =>
    set({ sessionId, participantId, budget, amountSpent: 0, status: "active" }),

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
    }),
}));
