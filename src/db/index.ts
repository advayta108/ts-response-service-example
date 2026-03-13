import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { Pool } from "pg";
import * as schemaSqlite from "./schema";
import * as schemaPg from "./schema.pg";
import { mkdirSync, existsSync } from "fs";
import { dirname } from "path";
import {
  getPostgresConnectionString,
  isPostgresConnectionEnv,
  postgresNeedsSsl,
} from "@/lib/postgresUrl";
import type { SqliteConn } from "@/lib/sqliteConn";

const dbPath = (() => {
  const u = process.env.DATABASE_URL ?? "";
  if (u.startsWith("postgres://") || u.startsWith("postgresql://"))
    return "./data/app.db";
  return u || "./data/app.db";
})();

export function isPostgres(): boolean {
  return isPostgresConnectionEnv();
}

let _sqliteDb: BunSQLiteDatabase<typeof schemaSqlite> | null = null;
let _sqlite: (SqliteConn & { exec: (sql: string) => void }) | null = null;
let _pool: Pool | null = null;
let _pgDb: ReturnType<typeof drizzlePg> | null = null;

function ensureDir(filePath: string) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function loadSqliteDb() {
  if (isPostgres())
    throw new Error(
      "SQLite недоступен при Postgres; используйте getDbContext()"
    );
  if (!_sqliteDb) {
    const { Database } = await import(/* webpackIgnore: true */ "bun:sqlite");
    const { drizzle: drizzleSqlite } = await import(
      /* webpackIgnore: true */ "drizzle-orm/bun-sqlite"
    );
    ensureDir(dbPath);
    _sqlite = new Database(dbPath, { create: true }) as SqliteConn & {
      exec: (sql: string) => void;
    };
    try {
      _sqlite.exec("PRAGMA journal_mode = WAL;");
    } catch {
      /* ignore */
    }
    _sqlite.exec("PRAGMA foreign_keys = ON;");
    _sqliteDb = drizzleSqlite(_sqlite as never, { schema: schemaSqlite });
  }
  return _sqliteDb;
}

export async function getDb() {
  return loadSqliteDb();
}

export async function getSqlite() {
  if (isPostgres()) throw new Error("getSqlite недоступен при PostgreSQL");
  await loadSqliteDb();
  return _sqlite!;
}

export async function getPgPool(): Promise<Pool> {
  if (!isPostgres()) throw new Error("PostgreSQL URL не задан");
  if (!_pool) {
    const connectionString = getPostgresConnectionString();
    _pool = new Pool({
      connectionString,
      // Serverless: меньше висящих коннектов; пулер Supabase всё равно пулит
      max: process.env.VERCEL === "1" ? 3 : 5,
      connectionTimeoutMillis: 20_000,
      idleTimeoutMillis: process.env.VERCEL === "1" ? 10_000 : 30_000,
      // Supabase без этого на Vercel часто даёт ECONNREFUSED / SSL
      ...(postgresNeedsSsl(connectionString)
        ? { ssl: { rejectUnauthorized: false } }
        : {}),
    });
  }
  return _pool;
}

export async function getPgDrizzle() {
  if (_pgDb) return _pgDb;
  const pool = await getPgPool();
  _pgDb = drizzlePg(pool, { schema: schemaPg });
  return _pgDb;
}

export type DbContext =
  | {
      driver: "sqlite";
      db: Awaited<ReturnType<typeof loadSqliteDb>>;
      sqlite: SqliteConn; // runtime: Bun Database
      schema: typeof schemaSqlite;
    }
  | {
      driver: "pg";
      db: Awaited<ReturnType<typeof getPgDrizzle>>;
      pool: Pool;
      schema: typeof schemaPg;
    };

export async function getDbContext(): Promise<DbContext> {
  if (isPostgres()) {
    const pool = await getPgPool();
    const db = await getPgDrizzle();
    return { driver: "pg", db, pool, schema: schemaPg };
  }
  if (process.env.VERCEL === "1") {
    throw new Error(
      "Vercel: задайте DATABASE_URL или POSTGRES_URL* (Supabase)."
    );
  }
  const db = await loadSqliteDb();
  return {
    driver: "sqlite",
    db,
    sqlite: _sqlite!,
    schema: schemaSqlite,
  };
}

export { schemaSqlite as schema };
