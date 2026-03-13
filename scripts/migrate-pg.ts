import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url?.startsWith("postgres"))
  throw new Error("DATABASE_URL должен быть postgresql://... (Supabase)");

const sql = readFileSync(
  join(process.cwd(), "drizzle-pg", "0000_init.sql"),
  "utf-8"
);
const pool = new Pool({ connectionString: url });
await pool.query(sql);
await pool.end();
console.log("PostgreSQL migrations OK");
