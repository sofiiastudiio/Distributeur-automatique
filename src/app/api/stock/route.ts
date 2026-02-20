import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const distributor = request.nextUrl.searchParams.get("distributor");
  if (!distributor) {
    return NextResponse.json({ error: "Missing distributor parameter" }, { status: 400 });
  }

  const stocks = await prisma.stock.findMany({
    where: { distributor_id: distributor },
    select: { product_id: true, quantity: true },
  });

  return NextResponse.json(stocks);
}
