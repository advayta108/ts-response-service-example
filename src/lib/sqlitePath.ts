import { join } from "path";

/** Путь к SQLite: при Postgres в DATABASE_URL всё равно ./data/app.db (миграции SQLite локально/CI). */
export function getSqliteFilePath(): string {
  const u = process.env.DATABASE_URL ?? "";
  if (u.startsWith("postgres://") || u.startsWith("postgresql://")) {
    return join(process.cwd(), "data", "app.db");
  }
  return u || join(process.cwd(), "data", "app.db");
}
