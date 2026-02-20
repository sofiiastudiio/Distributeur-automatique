import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      const participant = await tx.participant.create({
        data: {
          name: body.name || null,
          age_range: body.age_range || "non renseigné",
          gender: body.gender || "non renseigné",
          allergies: JSON.stringify(body.allergies || []),
          dietary_prefs: JSON.stringify(body.dietary_prefs || []),
          vending_freq: body.vending_freq || "non renseigné",
          would_seek: body.would_seek || "non renseigné",
        },
      });

      const session = await tx.session.create({
        data: {
          participant_id: participant.id,
          distributor_id: body.distributor_id || "SAFEBOX-A",
          budget_set: 0,
        },
      });

      return { participant, session };
    });

    return NextResponse.json({
      participant_id: result.participant.id,
      session_id: result.session.id,
    });
  } catch (err) {
    console.error("POST /api/participants error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
