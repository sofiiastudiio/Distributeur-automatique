import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function buildPrisma() {
  // In production (Vercel), use Turso via libsql adapter
  if (process.env.TURSO_DATABASE_URL) {
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  // In dev, use local SQLite file
  const adapter = new PrismaLibSql({
    url: `file:${process.cwd()}/dev.db`,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || buildPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
