import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const events = body.events;

  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: "No events provided" }, { status: 400 });
  }

  await prisma.event.createMany({
    data: events.map((e: { session_id: number; event_type: string; product_id?: number; category?: string; metadata?: string; timestamp?: string }) => ({
      session_id: e.session_id,
      event_type: e.event_type,
      product_id: e.product_id || null,
      category: e.category || null,
      metadata: e.metadata || null,
      timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
    })),
  });

  return NextResponse.json({ ok: true });
}
