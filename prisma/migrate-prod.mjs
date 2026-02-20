// Custom migration script for Turso (production).
// Prisma's migration engine doesn't support libsql:// URLs directly,
// so we apply pending migrations manually via @libsql/client.
import { createClient } from "@libsql/client";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.log("No TURSO_DATABASE_URL found — skipping production migration (local dev)");
  process.exit(0);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const client = createClient({ url, authToken });

// Ensure tracking table exists
await client.execute(`
  CREATE TABLE IF NOT EXISTS _prisma_migrations (
    id         TEXT PRIMARY KEY,
    migration_name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const migrationsDir = join(__dirname, "migrations");
const dirs = readdirSync(migrationsDir)
  .filter((d) => d !== "migration_lock.toml")
  .sort();

for (const dir of dirs) {
  const sqlFile = join(migrationsDir, dir, "migration.sql");
  if (!existsSync(sqlFile)) continue;

  const { rows } = await client.execute({
    sql: "SELECT id FROM _prisma_migrations WHERE migration_name = ?",
    args: [dir],
  });

  if (rows.length > 0) {
    console.log(`  skip (already applied): ${dir}`);
    continue;
  }

  const sql = readFileSync(sqlFile, "utf-8");
  const statements = sql.split(";").map((s) => s.trim()).filter(Boolean);

  for (const stmt of statements) {
    await client.execute(stmt);
  }

  await client.execute({
    sql: "INSERT INTO _prisma_migrations (id, migration_name) VALUES (?, ?)",
    args: [randomUUID(), dir],
  });

  console.log(`  ✓ applied: ${dir}`);
}

console.log("Migrations complete.");
await client.close();
