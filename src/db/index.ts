import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_URL ?? "./data/app.db";

let _db: ReturnType<typeof drizzle> | null = null;
let _sqlite: Database.Database | null = null;

export function getDb() {
  if (!_db) {
    _sqlite = new Database(dbPath);
    _sqlite.pragma("journal_mode = WAL");
    _db = drizzle(_sqlite, { schema });
  }
  return _db;
}

export function getSqlite(): Database.Database {
  getDb();
  return _sqlite!;
}

export { schema };
