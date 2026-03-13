import { Database } from "bun:sqlite";
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
const db = new Database(dbPath, { create: true });
db.exec("PRAGMA foreign_keys = ON;");
db.exec(sql);
db.close();
console.log("Migrations OK:", dbPath);
