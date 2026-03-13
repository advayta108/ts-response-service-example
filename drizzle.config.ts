import { defineConfig } from "drizzle-kit";
import { getSqliteFilePath } from "./src/lib/sqlitePath";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: getSqliteFilePath() },
});
