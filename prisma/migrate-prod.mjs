// Production migration script for Turso.
// Uses Turso's HTTP API directly with fetch (no extra dependencies).
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl) {
  console.log("No TURSO_DATABASE_URL — skipping production migration.");
  process.exit(0);
}

const httpUrl = tursoUrl.replace(/^libsql:\/\//, "https://");

async function sql(query, args = []) {
  const res = await fetch(`${httpUrl}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        { type: "execute", stmt: { sql: query, args } },
        { type: "close" },
      ],
    }),
  });

  const data = await res.json();
  const result = data.results?.[0];
  if (result?.type === "error") {
    throw new Error(result.error.message);
  }
  return result?.response?.result;
}

// Create tracking table
await sql(`
  CREATE TABLE IF NOT EXISTS _applied_migrations (
    name       TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "migrations");

const dirs = readdirSync(migrationsDir)
  .filter((d) => d !== "migration_lock.toml")
  .sort();

for (const dir of dirs) {
  const sqlFile = join(migrationsDir, dir, "migration.sql");
  if (!existsSync(sqlFile)) continue;

  // Already tracked?
  const tracked = await sql(
    "SELECT name FROM _applied_migrations WHERE name = ?",
    [{ type: "text", value: dir }]
  );
  if (tracked?.rows?.length > 0) {
    console.log(`  skip (tracked): ${dir}`);
    continue;
  }

  const content = readFileSync(sqlFile, "utf-8");
  const statements = content.split(";").map((s) => s.trim()).filter(Boolean);

  let skipped = 0;
  for (const stmt of statements) {
    try {
      await sql(stmt);
    } catch (err) {
      // If table/index already exists, the migration was applied before we
      // started tracking — treat it as already done.
      if (
        err.message.includes("already exists") ||
        err.message.includes("duplicate column")
      ) {
        skipped++;
      } else {
        throw err;
      }
    }
  }

  // Mark as applied whether it ran fresh or was already there
  await sql("INSERT OR IGNORE INTO _applied_migrations (name) VALUES (?)", [
    { type: "text", value: dir },
  ]);

  if (skipped === statements.length) {
    console.log(`  ✓ marked as applied (was already on DB): ${dir}`);
  } else {
    console.log(`  ✓ applied: ${dir}`);
  }
}

console.log("Migrations complete.");

// Update nutritional_info for all products (idempotent — safe to run on every deploy)
const productNutrition = [
  { name: "Poulet rôti & riz basmati",        nutritional_info: JSON.stringify({ net_weight: "350 g",  energy_kcal: 155, proteins: 14.5, carbs: 17,   fats: 3.5,  fiber: 1.2, salt: 0.72, per: "100g"  }) },
  { name: "Bowl quinoa & légumes",             nutritional_info: JSON.stringify({ net_weight: "320 g",  energy_kcal: 125, proteins: 5.5,  carbs: 19,   fats: 3.5,  fiber: 3.5, salt: 0.52, per: "100g"  }) },
  { name: "Saumon grillé & purée",             nutritional_info: JSON.stringify({ net_weight: "300 g",  energy_kcal: 148, proteins: 13.5, carbs: 11.5, fats: 5.5,  fiber: 1.5, salt: 0.62, per: "100g"  }) },
  { name: "Curry thaï au tofu",                nutritional_info: JSON.stringify({ net_weight: "350 g",  energy_kcal: 128, proteins: 6.5,  carbs: 16,   fats: 4.8,  fiber: 2.2, salt: 0.78, per: "100g"  }) },
  { name: "Risotto aux champignons",           nutritional_info: JSON.stringify({ net_weight: "320 g",  energy_kcal: 138, proteins: 3.5,  carbs: 23.5, fats: 3.5,  fiber: 1.2, salt: 0.68, per: "100g"  }) },
  { name: "Bœuf bourguignon",                  nutritional_info: JSON.stringify({ net_weight: "350 g",  energy_kcal: 138, proteins: 11.5, carbs: 9.5,  fats: 5.5,  fiber: 1.8, salt: 0.88, per: "100g"  }) },
  { name: "Wrap poulet-avocat",                nutritional_info: JSON.stringify({ net_weight: "210 g",  energy_kcal: 192, proteins: 12,   carbs: 18.5, fats: 8,    fiber: 2.8, salt: 0.68, per: "100g"  }) },
  { name: "Poke bowl saumon",                  nutritional_info: JSON.stringify({ net_weight: "350 g",  energy_kcal: 148, proteins: 10.5, carbs: 18.5, fats: 4.5,  fiber: 1.8, salt: 0.88, per: "100g"  }) },
  { name: "Energy balls cacao-coco",           nutritional_info: JSON.stringify({ net_weight: "60 g",   energy_kcal: 382, proteins: 5,    carbs: 55,   fats: 15.5, fiber: 7.5, salt: 0.08, per: "100g"  }) },
  { name: "Chips de légumes",                  nutritional_info: JSON.stringify({ net_weight: "50 g",   energy_kcal: 425, proteins: 4,    carbs: 53.5, fats: 21.5, fiber: 6.5, salt: 1.25, per: "100g"  }) },
  { name: "Barre protéinée vanille",           nutritional_info: JSON.stringify({ net_weight: "60 g",   energy_kcal: 355, proteins: 30,   carbs: 37.5, fats: 9.5,  fiber: 2.5, salt: 0.42, per: "100g"  }) },
  { name: "Crackers sarrasin & romarin",       nutritional_info: JSON.stringify({ net_weight: "80 g",   energy_kcal: 398, proteins: 9.5,  carbs: 57.5, fats: 13,   fiber: 4.5, salt: 1.45, per: "100g"  }) },
  { name: "Fruits secs & graines",             nutritional_info: JSON.stringify({ net_weight: "50 g",   energy_kcal: 428, proteins: 10,   carbs: 48,   fats: 21.5, fiber: 6.5, salt: 0.08, per: "100g"  }) },
  { name: "Muffin chocolat sans gluten",       nutritional_info: JSON.stringify({ net_weight: "90 g",   energy_kcal: 375, proteins: 4.5,  carbs: 51,   fats: 17.5, fiber: 2.8, salt: 0.45, per: "100g"  }) },
  { name: "Smoothie vert détox",               nutritional_info: JSON.stringify({ net_weight: "330 ml", energy_kcal: 52,  proteins: 1.2,  carbs: 10.5, fats: 0.4,  fiber: 1.5, salt: 0.02, per: "100ml" }) },
  { name: "Jus d'orange pressé",               nutritional_info: JSON.stringify({ net_weight: "250 ml", energy_kcal: 43,  proteins: 0.7,  carbs: 9.5,  fats: 0.1,  fiber: 0.2, salt: 0.01, per: "100ml" }) },
  { name: "Lait d'avoine barista",             nutritional_info: JSON.stringify({ net_weight: "250 ml", energy_kcal: 48,  proteins: 1.0,  carbs: 7,    fats: 1.5,  fiber: 0.5, salt: 0.12, per: "100ml" }) },
  { name: "Kombucha gingembre-citron",         nutritional_info: JSON.stringify({ net_weight: "330 ml", energy_kcal: 18,  proteins: 0,    carbs: 3.8,  fats: 0,    fiber: 0,   salt: 0.01, per: "100ml" }) },
  { name: "Eau minérale Henniez",              nutritional_info: JSON.stringify({ net_weight: "500 ml", energy_kcal: 0,   proteins: 0,    carbs: 0,    fats: 0,    fiber: 0,   salt: 0.005, per: "100ml" }) },
  { name: "Thé glacé pêche",                   nutritional_info: JSON.stringify({ net_weight: "330 ml", energy_kcal: 26,  proteins: 0,    carbs: 6,    fats: 0,    fiber: 0,   salt: 0.01, per: "100ml" }) },
];

for (const p of productNutrition) {
  await sql("UPDATE Product SET nutritional_info = ? WHERE name = ?", [
    { type: "text", value: p.nutritional_info },
    { type: "text", value: p.name },
  ]);
}
console.log(`Nutritional info updated for ${productNutrition.length} products.`);

// Seed distributors if missing
await sql(`
  INSERT OR IGNORE INTO Distributor (id, name, location, address) VALUES
    ('SAFEBOX-A', 'SafeBox A', 'Bâtiment A — RDC', 'Rue de la Paix 1, 1204 Genève'),
    ('SAFEBOX-B', 'SafeBox B', 'Bâtiment B — 1er étage', 'Rue de la Paix 3, 1204 Genève')
`);
console.log("Distributors seeded.");

// Seed stocks (quantity=10) for any missing product × distributor combo
// Turso HTTP API returns rows as [{type, value}] objects — extract .value
const productsResult = await sql("SELECT id FROM Product");
const productIds = (productsResult?.rows ?? []).map((r) => {
  const cell = r[0];
  return cell && typeof cell === "object" && "value" in cell
    ? Number(cell.value)
    : Number(cell);
});
for (const productId of productIds) {
  for (const distId of ["SAFEBOX-A", "SAFEBOX-B"]) {
    const qty = Math.floor(Math.random() * 11) + 5; // 5–15
    await sql(
      `INSERT INTO Stock (distributor_id, product_id, quantity, updated_at) VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(distributor_id, product_id) DO UPDATE SET quantity = excluded.quantity, updated_at = datetime('now') WHERE quantity = 0`,
      [
        { type: "text", value: distId },
        { type: "integer", value: String(productId) },
        { type: "integer", value: String(qty) },
      ]
    );
  }
}
if (productIds.length > 0) {
  console.log(`Stocks seeded for ${productIds.length} products × 2 distributors.`);
}
