/**
 * URL Postgres для Vercel + Supabase.
 * На Vercel надёжнее сначала пулер (POSTGRES_URL), затем DATABASE_URL.
 */
export function getPostgresConnectionString(): string {
  const onVercel = process.env.VERCEL === "1";
  const candidates = onVercel
    ? [
        process.env.DATABASE_URL,
        process.env.POSTGRES_URL,
        process.env.POSTGRES_URL_NON_POOLING,
        process.env.POSTGRES_PRISMA_URL,
      ]
    : [
        process.env.DATABASE_URL,
        process.env.POSTGRES_URL_NON_POOLING,
        process.env.POSTGRES_URL,
        process.env.POSTGRES_PRISMA_URL,
      ];
  for (const u of candidates) {
    if (u && (u.startsWith("postgres://") || u.startsWith("postgresql://"))) {
      return u.trim();
    }
  }
  return "";
}

export function isPostgresConnectionEnv(): boolean {
  return getPostgresConnectionString().length > 0;
}

/** Нужен ли SSL (Supabase / облако). */
export function postgresNeedsSsl(url: string): boolean {
  return (
    /supabase\.co|pooler\.supabase|amazonaws\.com|sslmode=require/i.test(url) ||
    url.includes("ssl=true")
  );
}
