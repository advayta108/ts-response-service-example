/**
 * Подмена `bun:sqlite` при сборке Next на Node (Vercel). Реальный SQLite только под Bun.
 */
module.exports = {
  Database: class Database {
    constructor() {
      throw new Error(
        "bun:sqlite недоступен на Node. Локально/Docker: Bun + SQLite. Vercel: DATABASE_URL или POSTGRES_* (Supabase)."
      );
    }
  },
};
