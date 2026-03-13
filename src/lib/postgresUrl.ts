/**
 * Один URL для Postgres: сначала DATABASE_URL, иначе переменные интеграции Vercel + Supabase.
 * Порядок: непулящийся (миграции) → пулер → Prisma-строка.
 */
export function getPostgresConnectionString(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
  ];
  for (const u of candidates) {
    if (u && (u.startsWith("postgres://") || u.startsWith("postgresql://"))) {
      return u;
    }
  }
  return "";
}

export function isPostgresConnectionEnv(): boolean {
  return getPostgresConnectionString().length > 0;
}
