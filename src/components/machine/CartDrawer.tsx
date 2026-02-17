"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = useCartStore((s) => s.total());
  const itemCount = useCartStore((s) => s.itemCount());
  const sessionId = useSessionStore((s) => s.sessionId);
  const addSpending = useSessionStore((s) => s.addSpending);
  const router = useRouter();

  const handlePurchase = async () => {
    if (!sessionId || items.length === 0) return;
    setPurchasing(true);

    await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          unit_price: i.product.price,
        })),
      }),
    });

    addSpending(total);
    clearCart();
    setPurchasing(false);
    setOpen(false);
    router.push("/machine/checkout");
  };

  return (
    <>
      {/* Cart toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl bg-surface p-3 transition-colors hover:bg-surface-light"
      >
        <span className="text-xl">🛒</span>
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-background">
            {itemCount}
          </span>
        )}
      </button>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transform rounded-t-3xl bg-white shadow-2xl border-t border-foreground/10 transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "70vh" }}
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Votre panier</h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-foreground/40 hover:bg-surface-light"
            >
              ✕
            </button>
          </div>

          {items.length === 0 ? (
            <p className="py-8 text-center text-foreground/40">Votre panier est vide</p>
          ) : (
            <>
              <div className="max-h-60 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between rounded-xl bg-surface-light p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.product.image_emoji}</span>
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-sm text-foreground/50">
                          CHF {item.product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-light text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-light text-sm font-bold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="ml-2 text-danger/60 hover:text-danger"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-foreground/10 pt-4">
                <div className="mb-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">CHF {total.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { clearCart(); setOpen(false); }}
                    className="flex-1 rounded-xl bg-surface-light px-4 py-3 font-medium text-foreground/60 transition-colors hover:bg-danger/20 hover:text-danger"
                  >
                    Vider le panier
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary-light active:scale-95 disabled:opacity-40"
                  >
                    {purchasing ? "Traitement..." : "Confirmer l'achat"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
