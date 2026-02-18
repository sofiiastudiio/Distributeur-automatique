import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const IMAGE_MAP: Record<string, string> = {
  "Poulet rôti & riz basmati": "/products/poulet-roti.png",
  "Bowl quinoa & légumes": "/products/bowl-quinoa.png",
  "Saumon grillé & purée": "/products/saumon-grille.png",
  "Curry thaï au tofu": "/products/curry-thai.png",
  "Risotto aux champignons": "/products/risotto-champignons.png",
  "Bœuf bourguignon": "/products/boeuf-bourguignon.png",
  "Wrap poulet-avocat": "/products/wrap-poulet.png",
  "Poke bowl saumon": "/products/poke-saumon.png",
  "Energy balls cacao-coco": "/products/energy-balls.png",
};

export async function POST() {
  const results: string[] = [];

  for (const [name, imageUrl] of Object.entries(IMAGE_MAP)) {
    const updated = await prisma.product.updateMany({
      where: { name },
      data: { image_url: imageUrl },
    });
    results.push(`${name}: ${updated.count} updated`);
  }

  return NextResponse.json({ results });
}
