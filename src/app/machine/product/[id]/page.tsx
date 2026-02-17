"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Product } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useEventTracker } from "@/hooks/useEventTracker";
import { ProductImage } from "@/components/machine/ProductImage";
import { AllergenBadge } from "@/components/machine/AllergenBadge";
import { QRCodeSVG } from "qrcode.react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const cartTotal = useCartStore((s) => s.total());
  const budget = useSessionStore((s) => s.budget);
  const amountSpent = useSessionStore((s) => s.amountSpent);
  const { track } = useEventTracker();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => {
        const found = data.find((p) => p.id === Number(params.id));
        if (found) {
          setProduct(found);
          track("product_detail_open", { product_id: found.id });
        }
      });
  }, [params.id, track]);

  if (!product) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-foreground/40">Chargement...</div>
      </div>
    );
  }

  const remaining = budget - amountSpent - cartTotal;
  const canAfford = remaining >= product.price;
  const ni = product.nutritional_info;

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <button
        onClick={() => {
          track("product_detail_close", { product_id: product.id });
          router.back();
        }}
        className="mb-6 rounded-xl bg-surface px-4 py-2 text-sm text-foreground/60 hover:bg-surface-light"
      >
        ← Retour
      </button>

      <div className="glass rounded-3xl p-6">
        <div className="mb-6 flex flex-col items-center gap-6 sm:flex-row">
          <ProductImage
            emoji={product.image_emoji}
            colorFrom={product.color_from}
            colorTo={product.color_to}
            size="lg"
          />
          <div>
            <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
            <p className="mb-3 text-lg text-foreground/60">{product.description}</p>
            <div className="mb-3 text-3xl font-bold text-accent">
              CHF {product.price.toFixed(2)}
            </div>
            <button
              onClick={() => {
                const success = addItem(product, budget, amountSpent);
                if (success) {
                  track("add_to_cart", {
                    product_id: product.id,
                    metadata: { price: product.price, from: "detail" },
                  });
                }
              }}
              disabled={!canAfford}
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary-light active:scale-95 disabled:opacity-30"
            >
              + Ajouter au panier
            </button>
          </div>
        </div>

        {/* Allergen badges */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground/50 uppercase tracking-wider">
            Garanti sans allergènes
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.allergen_free.map((a) => (
              <AllergenBadge key={a} allergenId={a} size="lg" />
            ))}
          </div>
          <p className="mt-2 text-sm text-success/80">
            Contient : Aucun des 14 allergènes majeurs
          </p>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-foreground/50 uppercase tracking-wider">
            Ingrédients
          </h3>
          <p className="text-foreground/70">{product.ingredients}</p>
        </div>

        {/* Nutrition table */}
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-foreground/50 uppercase tracking-wider">
            Valeurs nutritionnelles (par {ni.per})
          </h3>
          <div className="overflow-hidden rounded-xl bg-surface">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Énergie", `${ni.energy_kcal} kcal`],
                  ["Protéines", `${ni.proteins} g`],
                  ["Glucides", `${ni.carbs} g`],
                  ["Lipides", `${ni.fats} g`],
                  ["Fibres", `${ni.fiber} g`],
                  ["Sel", `${ni.salt} g`],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-foreground/5 last:border-0">
                    <td className="px-4 py-2 text-foreground/60">{label}</td>
                    <td className="px-4 py-2 text-right font-medium">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traceability */}
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-foreground/50 uppercase tracking-wider">
            Traçabilité & Origine
          </h3>
          <p className="mb-2 text-foreground/70">{product.origin_info}</p>
          <div className="flex flex-wrap gap-2">
            {product.certifications.map((cert) => (
              <span
                key={cert}
                className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="rounded-xl bg-white p-4">
            <QRCodeSVG
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/machine/product/${product.id}`}
              size={120}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
