import Database from "better-sqlite3";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";

const dbPath = process.env.DATABASE_URL ?? join(process.cwd(), "data", "app.db");
const dir = dirname(dbPath);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const sql = readFileSync(join(process.cwd(), "drizzle", "0000_init.sql"), "utf-8");
const sqlite = new Database(dbPath);
sqlite.exec("PRAGMA foreign_keys = ON;");
sqlite.exec(sql);
sqlite.close();
console.log("Migrations OK:", dbPath);
