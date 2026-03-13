#!/bin/sh
set -e
cd /app
export DATABASE_URL="${DATABASE_URL:-/data/app.db}"
mkdir -p "$(dirname "$DATABASE_URL")"
bun run scripts/migrate.ts
COUNT=$(bun run scripts/count-users.ts 2>/dev/null || echo 0)
if [ "$COUNT" = "0" ]; then bun run scripts/seed.ts; fi
exec bun run --bun next start -H 0.0.0.0 -p 3000
