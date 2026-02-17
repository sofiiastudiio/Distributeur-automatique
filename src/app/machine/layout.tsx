"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";

export default function MachineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionId = useSessionStore((s) => s.sessionId);
  const router = useRouter();

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
    }
  }, [sessionId, router]);

  if (!sessionId) return null;

  return <>{children}</>;
}
