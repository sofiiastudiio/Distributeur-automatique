"use client";

import type { Product } from "@/types";
import { QRCodeSVG } from "qrcode.react";
import { ProductImage } from "./ProductImage";
import { AllergenBadge } from "./AllergenBadge";

interface ProductCardProps {
  product: Product;
  onView: () => void;
  onAdd: () => void;
  canAfford: boolean;
}

export function ProductCard({ product, onView, onAdd, canAfford }: ProductCardProps) {
  return (
    <div
      className="glass group flex cursor-pointer flex-col rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
      onClick={onView}
    >
      <div className="mb-3 flex justify-center">
        <ProductImage
          emoji={product.image_emoji}
          colorFrom={product.color_from}
          colorTo={product.color_to}
        />
      </div>

      <h3 className="mb-1 text-base font-semibold leading-tight">{product.name}</h3>

      <div className="mb-2 flex flex-wrap gap-1">
        {product.allergen_free.slice(0, 3).map((a) => (
          <AllergenBadge key={a} allergenId={a} size="sm" />
        ))}
        {product.allergen_free.length > 3 && (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
            +{product.allergen_free.length - 3}
          </span>
        )}
      </div>

      <div className="mb-2 flex gap-1">
        {product.is_vegan && (
          <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
            Végan
          </span>
        )}
        {product.is_vegetarian && !product.is_vegan && (
          <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
            Végétarien
          </span>
        )}
      </div>

      {/* QR code — scan pour fiche produit */}
      <div className="mb-3 flex justify-center">
        <div
          className="rounded-lg bg-white/80 p-1.5 ring-1 ring-white/20 backdrop-blur-sm cursor-default"
          onClick={(e) => e.stopPropagation()}
          title="Scanner pour voir ingrédients & traçabilité"
        >
          <QRCodeSVG
            value={`${typeof window !== "undefined" ? window.location.origin : ""}/produit/${product.id}`}
            size={48}
            level="L"
            bgColor="transparent"
          />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-lg font-bold text-accent">
          CHF {product.price.toFixed(2)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          disabled={!canAfford}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-light active:scale-95 disabled:opacity-30"
        >
          + Ajouter
        </button>
      </div>
    </div>
  );
}
