"use client";

import { CATEGORY_LABELS } from "@/lib/constants";

interface CategoryTabsProps {
  active: string;
  onChange: (category: string) => void;
}

const CATEGORIES = ["meal", "snack", "drink"];

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
            active === cat
              ? "bg-primary text-white glow"
              : "bg-surface text-foreground/60 hover:bg-surface-light"
          }`}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  );
}
