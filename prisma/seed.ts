import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { products } from "../src/lib/products";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.event.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.session.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.product.deleteMany();

  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description,
        ingredients: p.ingredients,
        nutritional_info: JSON.stringify(p.nutritional_info),
        origin_info: p.origin_info,
        certifications: JSON.stringify(p.certifications),
        allergen_free: JSON.stringify(p.allergen_free),
        image_emoji: p.image_emoji,
        image_url: p.image_url,
        color_from: p.color_from,
        color_to: p.color_to,
        is_vegan: p.is_vegan,
        is_vegetarian: p.is_vegetarian,
      },
    });
  }

  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
