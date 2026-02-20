import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { session_id, items } = body;

  if (!session_id || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    // Get the session to know which distributor
    const session = await tx.session.findUnique({
      where: { id: session_id },
      select: { distributor_id: true },
    });
    const distributor_id = session?.distributor_id ?? "SAFEBOX-A";

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

      // Decrement stock (floor at 0)
      const stock = await tx.stock.findUnique({
        where: { distributor_id_product_id: { distributor_id, product_id: item.product_id } },
      });
      if (stock) {
        await tx.stock.update({
          where: { id: stock.id },
          data: { quantity: Math.max(0, stock.quantity - item.quantity) },
        });
      }
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
