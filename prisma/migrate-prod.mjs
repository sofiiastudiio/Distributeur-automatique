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
    await sql(
      `INSERT INTO Stock (distributor_id, product_id, quantity) VALUES (?, ?, 10)
       ON CONFLICT(distributor_id, product_id) DO UPDATE SET quantity = 10 WHERE quantity = 0`,
      [
        { type: "text", value: distId },
        { type: "integer", value: String(productId) },
      ]
    );
  }
}
if (productIds.length > 0) {
  console.log(`Stocks seeded for ${productIds.length} products × 2 distributors.`);
}
