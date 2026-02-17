"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import type { EventType } from "@/types";

const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 5000;

export function useEventTracker() {
  const sessionId = useSessionStore((s) => s.sessionId);
  const queueRef = useRef<Array<{
    session_id: number;
    event_type: string;
    product_id?: number;
    category?: string;
    metadata?: string;
    timestamp: string;
  }>>([]);
  const pathname = usePathname();

  const flush = useCallback(() => {
    if (queueRef.current.length === 0) return;
    const events = [...queueRef.current];
    queueRef.current = [];
    const blob = new Blob([JSON.stringify({ events })], {
      type: "application/json",
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", blob);
    } else {
      fetch("/api/events", {
        method: "POST",
        body: JSON.stringify({ events }),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  const track = useCallback(
    (
      eventType: EventType,
      data?: { product_id?: number; category?: string; metadata?: Record<string, unknown> }
    ) => {
      if (!sessionId) return;
      queueRef.current.push({
        session_id: sessionId,
        event_type: eventType,
        product_id: data?.product_id,
        category: data?.category,
        metadata: data?.metadata ? JSON.stringify(data.metadata) : undefined,
        timestamp: new Date().toISOString(),
      });
      if (queueRef.current.length >= BATCH_SIZE) flush();
    },
    [sessionId, flush]
  );

  // Auto-flush on interval
  useEffect(() => {
    const timer = setInterval(flush, FLUSH_INTERVAL);
    return () => {
      clearInterval(timer);
      flush();
    };
  }, [flush]);

  // Track page views
  useEffect(() => {
    if (sessionId && pathname) {
      track("page_view", { metadata: { path: pathname } });
    }
  }, [pathname, sessionId, track]);

  // Flush on page unload
  useEffect(() => {
    const handleBeforeUnload = () => flush();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [flush]);

  return { track, flush };
}
