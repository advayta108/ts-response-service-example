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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sqliteDb: any = null;
let _sqlite: (SqliteConn & { exec: (sql: string) => void }) | null = null;
let _pool: Pool | null = null;
let _pgDb: ReturnType<typeof drizzlePg> | null = null;

function ensureDir(filePath: string) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function wrapBetterRaw(raw: {
  exec: (s: string) => void;
  prepare: (sql: string) => {
    run: (...a: unknown[]) => { changes: number };
    get: (...a: unknown[]) => unknown;
  };
}): SqliteConn & { exec: (sql: string) => void } {
  return {
    exec: (s) => raw.exec(s),
    run: (sql, params) => ({
      changes: raw.prepare(sql).run(...(params ?? [])).changes,
    }),
    query: (sql) => ({
      get: (...args) => raw.prepare(sql).get(...args),
    }),
  };
}

/** SQLite: Bun (bun dev) или better-sqlite3 (next dev на Node). */
async function loadSqliteDb(): Promise<BunSQLiteDatabase<typeof schemaSqlite>> {
  if (isPostgres())
    throw new Error(
      "SQLite недоступен при Postgres; используйте getDbContext()"
    );
  if (!_sqliteDb) {
    ensureDir(dbPath);
    let bunOk = false;
    try {
      const { Database } = await import(/* webpackIgnore: true */ "bun:sqlite");
      const { drizzle: drizzleSqlite } = await import(
        /* webpackIgnore: true */ "drizzle-orm/bun-sqlite"
      );
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
      bunOk = true;
    } catch {
      /* Node / next dev — нет bun:sqlite */
    }
    if (!bunOk) {
      const BetterSqlite = (
        await import(/* webpackIgnore: true */ "better-sqlite3")
      ).default;
      const raw = new BetterSqlite(dbPath);
      try {
        raw.pragma("journal_mode = WAL");
      } catch {
        /* ignore */
      }
      raw.pragma("foreign_keys = ON");
      const { drizzle: drizzleBetter } =
        await import("drizzle-orm/better-sqlite3");
      _sqlite = wrapBetterRaw(raw as never);
      _sqliteDb = drizzleBetter(raw as never, { schema: schemaSqlite });
    }
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
      max: process.env.VERCEL === "1" ? 3 : 5,
      connectionTimeoutMillis: 20_000,
      idleTimeoutMillis: process.env.VERCEL === "1" ? 10_000 : 30_000,
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
      sqlite: SqliteConn;
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
