"use client";

interface ProductImageProps {
  emoji: string;
  colorFrom: string;
  colorTo: string;
  size?: "sm" | "lg";
}

export function ProductImage({ emoji, colorFrom, colorTo, size = "sm" }: ProductImageProps) {
  const sizeClasses = size === "lg" ? "h-48 w-48 text-7xl" : "h-24 w-24 text-4xl";

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-2xl`}
      style={{
        background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
      }}
    >
      {emoji}
    </div>
  );
}
