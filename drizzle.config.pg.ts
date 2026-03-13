import { defineConfig } from "drizzle-kit";

function pgUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ""
  );
}

export default defineConfig({
  schema: "./src/db/schema.pg.ts",
  out: "./drizzle-pg",
  dialect: "postgresql",
  dbCredentials: { url: pgUrl() },
});
