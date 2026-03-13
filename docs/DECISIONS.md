# Ключевые решения (DECISIONS)

1. **Bun** — локально `bun install`, `bun run dev/build/start`; API на SQLite через **`bun:sqlite`** (без `better-sqlite3` на Windows).
2. **Продакшен (Vercel)** — **PostgreSQL (Supabase)**; при `DATABASE_URL=postgresql://...` приложение использует **`pg`** + Drizzle (`schema.pg.ts`). Миграции: `bun run db:migrate:pg`, SQL в `drizzle-pg/0000_init.sql`.
3. **Гонка «взять в работу»** — атомарный `UPDATE ... WHERE status = 'assigned' AND assigned_to = ?`; второй запрос → **409** + тост.
4. **Ошибки API** — try/catch → **503**; клиент — `safeJson`.
5. **Локальные миграции SQLite** — `bun run db:migrate` → `drizzle/0000_init.sql`. Сид: `bun run db:seed`. Сид Supabase: `bun run db:seed:pg` (после миграции PG).
6. **Docker** — образ Bun; без обязательного Postgres в compose (по желанию добавить сервис `postgres` и `DATABASE_URL`).
7. **CI** — `.github/workflows/deploy.yml`: миграция Supabase → опционально seed → деплой Vercel (секреты в README).
8. **SSE** — in-memory; на serverless несколько инстансов события не шарятся — приемлемо для демо.
