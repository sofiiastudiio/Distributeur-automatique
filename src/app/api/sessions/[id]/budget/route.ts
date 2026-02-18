import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { amount } = await request.json();

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id: parseInt(id) },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.completed) {
    return NextResponse.json({ error: "Session already completed" }, { status: 400 });
  }

  const updated = await prisma.session.update({
    where: { id: parseInt(id) },
    data: { budget_set: session.budget_set + amount },
  });

  return NextResponse.json({ budget_set: updated.budget_set });
}
