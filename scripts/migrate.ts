import { readFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { getSqliteFilePath } from "../src/lib/sqlitePath";

const dbPath = getSqliteFilePath();
const dir = dirname(dbPath);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const sql = readFileSync(
  join(process.cwd(), "drizzle", "0000_init.sql"),
  "utf-8"
);

function migrateWithBetterSqlite() {
  const BetterSqlite =
    require("better-sqlite3") as typeof import("better-sqlite3");
  const db = new BetterSqlite(dbPath);
  db.pragma("foreign_keys = ON");
  db.exec(sql);
  db.close();
}

function migrateWithBun() {
  const { Database } = require("bun:sqlite");
  const db = new Database(dbPath, { create: true });
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(sql);
  db.close();
}

try {
  migrateWithBun();
} catch {
  migrateWithBetterSqlite();
}
console.log("Migrations OK:", dbPath);
