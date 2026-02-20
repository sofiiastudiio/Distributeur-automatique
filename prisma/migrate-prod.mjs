// Production migration script for Turso.
// Uses Turso's HTTP API directly (no @libsql/client import issues).
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

// Convert libsql:// → https:// for Turso HTTP API
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
  if (data.results?.[0]?.type === "error") {
    throw new Error(data.results[0].error.message);
  }
  return data.results?.[0]?.response?.result;
}

// Create migrations tracking table
await sql(`
  CREATE TABLE IF NOT EXISTS _applied_migrations (
    name TEXT PRIMARY KEY,
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

  // Check if already applied
  const result = await sql(
    "SELECT name FROM _applied_migrations WHERE name = ?",
    [{ type: "text", value: dir }]
  );
  if (result?.rows?.length > 0) {
    console.log(`  skip: ${dir}`);
    continue;
  }

  // Apply migration statement by statement
  const content = readFileSync(sqlFile, "utf-8");
  const statements = content
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await sql(stmt);
  }

  await sql("INSERT INTO _applied_migrations (name) VALUES (?)", [
    { type: "text", value: dir },
  ]);

  console.log(`  ✓ applied: ${dir}`);
}

console.log("Migrations complete.");
