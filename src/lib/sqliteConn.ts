/** Поверхность Bun SQLite, без import из bun:sqlite (сборка Node). */
export type SqliteConn = {
  run: (sql: string, params?: unknown[]) => { changes: number };
  query: (sql: string) => { get: (...args: unknown[]) => unknown };
};
