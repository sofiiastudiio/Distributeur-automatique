import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function randStock() {
  return Math.floor(Math.random() * 11) + 5; // 5–15
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distributor_id } = body;

    if (!distributor_id) {
      return NextResponse.json({ error: "Missing distributor_id" }, { status: 400 });
    }

    const stocks = await prisma.stock.findMany({
      where: { distributor_id },
    });

    if (stocks.length === 0) {
      return NextResponse.json({ error: "Distributor not found or no stocks" }, { status: 404 });
    }

    await prisma.$transaction(
      stocks.map((s) =>
        prisma.stock.update({
          where: { id: s.id },
          data: { quantity: randStock() },
        })
      )
    );

    const updated = await prisma.stock.findMany({
      where: { distributor_id },
      select: { product_id: true, quantity: true },
    });

    return NextResponse.json({ success: true, stocks: updated });
  } catch (err) {
    console.error("POST /api/stock/restock error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
