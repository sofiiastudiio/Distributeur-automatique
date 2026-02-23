import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await prisma.participant.update({
      where: { id: Number(id) },
      data: {
        ...(body.age_range && { age_range: body.age_range }),
        ...(body.gender && { gender: body.gender }),
        ...(body.allergies && { allergies: JSON.stringify(body.allergies) }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/participants/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
