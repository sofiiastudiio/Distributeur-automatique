"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { useCartStore } from "@/stores/cartStore";
import { AUTO_RESET_SECONDS } from "@/lib/constants";

export function useAutoReset() {
  const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS);
  const router = useRouter();
  const resetSession = useSessionStore((s) => s.reset);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (countdown <= 0) {
      resetSession();
      clearCart();
      router.push("/");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router, resetSession, clearCart]);

  return countdown;
}
