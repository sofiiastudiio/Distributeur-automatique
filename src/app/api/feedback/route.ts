import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { session_id, realism, would_use, comment } = body;

  if (!session_id) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  await prisma.session.update({
    where: { id: session_id },
    data: {
      feedback_realism: realism,
      feedback_would_use: would_use,
      feedback_comment: comment || null,
      session_end: new Date(),
      completed: true,
    },
  });

  return NextResponse.json({ ok: true });
}
