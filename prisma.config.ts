import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrate: {
    async adapter() {
      const { PrismaLibSql } = await import("@prisma/adapter-libsql");
      if (process.env.TURSO_DATABASE_URL) {
        return new PrismaLibSql({
          url: process.env.TURSO_DATABASE_URL,
          authToken: process.env.TURSO_AUTH_TOKEN,
        });
      }
      return new PrismaLibSql({ url: process.env.DATABASE_URL || "file:./dev.db" });
    },
  },
});
