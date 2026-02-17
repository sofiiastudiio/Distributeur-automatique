import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await prisma.$transaction(async (tx) => {
    const participant = await tx.participant.create({
      data: {
        name: body.name || null,
        age_range: body.age_range,
        gender: body.gender,
        allergies: JSON.stringify(body.allergies || []),
        dietary_prefs: JSON.stringify(body.dietary_prefs || []),
        vending_freq: body.vending_freq,
        would_seek: body.would_seek,
      },
    });

    const session = await tx.session.create({
      data: {
        participant_id: participant.id,
        budget_set: body.budget,
      },
    });

    return { participant, session };
  });

  return NextResponse.json({
    participant_id: result.participant.id,
    session_id: result.session.id,
  });
}
