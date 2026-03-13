#!/bin/sh
set -e
cd /app
export DATABASE_URL="${DATABASE_URL:?DATABASE_URL}"
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do
  bun run scripts/migrate-pg.ts && break
  sleep 2
done
bun run scripts/migrate-pg.ts
bun run db:seed:pg || true
exec bun run next start -H 0.0.0.0 -p 3000
