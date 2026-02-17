"use client";

import { ALLERGENS } from "@/lib/constants";

interface AllergenBadgeProps {
  allergenId: string;
  size?: "sm" | "lg";
}

export function AllergenBadge({ allergenId, size = "sm" }: AllergenBadgeProps) {
  const allergen = ALLERGENS.find((a) => a.id === allergenId);
  if (!allergen) return null;

  if (size === "lg") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1.5 text-sm font-medium text-success">
        <span>{allergen.icon}</span> Sans {allergen.label.toLowerCase()}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
      <span>{allergen.icon}</span> Sans {allergen.label.toLowerCase()}
    </span>
  );
}
