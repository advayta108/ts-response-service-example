import { Database } from "bun:sqlite";
import { drizzle as drizzleSqlite } from "drizzle-orm/bun-sqlite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schemaSqlite from "./schema";
import * as schemaPg from "./schema.pg";
import { mkdirSync, existsSync } from "fs";
import { dirname } from "path";

const dbPath = process.env.DATABASE_URL ?? "./data/app.db";

export function isPostgres(): boolean {
  const u = process.env.DATABASE_URL ?? "";
  return u.startsWith("postgres://") || u.startsWith("postgresql://");
}

let _sqliteDb: ReturnType<typeof drizzleSqlite> | null = null;
let _sqlite: Database | null = null;
let _pool: Pool | null = null;
let _pgDb: ReturnType<typeof drizzlePg> | null = null;

function ensureDir(filePath: string) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/** SQLite (локально / Docker без DATABASE_URL postgres). */
export function getDb() {
  if (isPostgres())
    throw new Error(
      "getDb() sync только для SQLite; используйте getDbContext()"
    );
  if (!_sqliteDb) {
    ensureDir(dbPath);
    _sqlite = new Database(dbPath, { create: true });
    try {
      _sqlite.exec("PRAGMA journal_mode = WAL;");
    } catch {
      /* ignore */
    }
    _sqlite.exec("PRAGMA foreign_keys = ON;");
    _sqliteDb = drizzleSqlite(_sqlite, { schema: schemaSqlite });
  }
  return _sqliteDb;
}

export function getSqlite(): Database {
  if (isPostgres()) throw new Error("getSqlite недоступен при PostgreSQL");
  getDb();
  return _sqlite!;
}

export async function getPgPool(): Promise<Pool> {
  if (!isPostgres()) throw new Error("PostgreSQL URL не задан");
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 10_000,
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
      db: ReturnType<typeof drizzleSqlite>;
      sqlite: Database;
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
  return {
    driver: "sqlite",
    db: getDb(),
    sqlite: getSqlite(),
    schema: schemaSqlite,
  };
}

export { schemaSqlite as schema };
