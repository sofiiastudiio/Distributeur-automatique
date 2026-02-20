import "dotenv/config";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { products } from "../src/lib/products";

const adapter = new PrismaLibSql({ url: `file:${path.join(process.cwd(), "dev.db")}` });
const prisma = new PrismaClient({ adapter });

const DISTRIBUTORS = [
  { id: "SAFEBOX-A", name: "SafeBox A", location: "Bâtiment A — RDC", address: "Rue de la Paix 1, 1204 Genève" },
  { id: "SAFEBOX-B", name: "SafeBox B", location: "Bâtiment B — 1er étage", address: "Rue de la Paix 3, 1204 Genève" },
];

function randStock() {
  return Math.floor(Math.random() * 11) + 5; // 5–15
}

async function main() {
  console.log("Seeding database...");

  await prisma.event.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.session.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.distributor.deleteMany();

  // Distributors
  for (const d of DISTRIBUTORS) {
    await prisma.distributor.create({ data: d });
  }
  console.log(`Seeded ${DISTRIBUTORS.length} distributors`);

  // Products
  const createdProducts = [];
  for (const p of products) {
    const created = await prisma.product.create({
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
    createdProducts.push(created);
  }
  console.log(`Seeded ${products.length} products`);

  // Stocks
  for (const distributor of DISTRIBUTORS) {
    for (const product of createdProducts) {
      await prisma.stock.create({
        data: {
          distributor_id: distributor.id,
          product_id: product.id,
          quantity: randStock(),
        },
      });
    }
  }
  console.log(`Seeded stocks for ${DISTRIBUTORS.length} distributors × ${createdProducts.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
