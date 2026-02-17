import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { session_id, items } = body;

  if (!session_id || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const purchases = [];
    let totalSpent = 0;
    let totalItems = 0;

    for (const item of items) {
      const purchase = await tx.purchase.create({
        data: {
          session_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
        },
      });
      purchases.push(purchase);
      totalSpent += purchase.total_price;
      totalItems += item.quantity;
    }

    await tx.session.update({
      where: { id: session_id },
      data: {
        total_spent: { increment: totalSpent },
        items_purchased: { increment: totalItems },
      },
    });

    return { purchases, totalSpent, totalItems };
  });

  return NextResponse.json(result);
}
