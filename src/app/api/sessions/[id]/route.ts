import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = parseInt(id);

  try {
    await prisma.$transaction([
      prisma.event.deleteMany({ where: { session_id: sessionId } }),
      prisma.purchase.deleteMany({ where: { session_id: sessionId } }),
      prisma.session.delete({ where: { id: sessionId } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const session = await prisma.session.update({
    where: { id: parseInt(id) },
    data: { distributor_id: body.distributor_id },
  });
  return NextResponse.json({ ok: true, distributor_id: session.distributor_id });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id: parseInt(id) },
    include: {
      participant: true,
      purchases: { include: { product: true } },
      events: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}
