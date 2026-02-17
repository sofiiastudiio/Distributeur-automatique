import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");

  const products = await prisma.product.findMany({
    where: category ? { category } : undefined,
    orderBy: { id: "asc" },
  });

  const parsed = products.map((p) => ({
    ...p,
    nutritional_info: JSON.parse(p.nutritional_info),
    certifications: JSON.parse(p.certifications),
    allergen_free: JSON.parse(p.allergen_free),
  }));

  return NextResponse.json(parsed);
}
