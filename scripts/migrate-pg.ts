import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";
import { getPostgresConnectionString } from "../src/lib/postgresUrl";

const url = getPostgresConnectionString();
if (!url)
  throw new Error(
    "Задайте DATABASE_URL или переменные Vercel+Supabase: POSTGRES_URL_NON_POOLING / POSTGRES_URL"
  );

const sql = readFileSync(
  join(process.cwd(), "drizzle-pg", "0000_init.sql"),
  "utf-8"
);
const pool = new Pool({ connectionString: url });
await pool.query(sql);
await pool.end();
console.log("PostgreSQL migrations OK");
