#!/bin/sh
set -e
cd /app
export DATABASE_URL="${DATABASE_URL:-/data/app.db}"
mkdir -p "$(dirname "$DATABASE_URL")"
node ./node_modules/tsx/dist/cli.mjs scripts/migrate.ts
COUNT=$(node -e "const Database=require('better-sqlite3');const db=new Database(process.env.DATABASE_URL||'/data/app.db');console.log(db.prepare('SELECT COUNT(*) as c FROM users').get().c);db.close();" 2>/dev/null || echo 0)
if [ "$COUNT" = "0" ]; then node ./node_modules/tsx/dist/cli.mjs scripts/seed.ts; fi
exec bun run --bun next start -H 0.0.0.0 -p 3000
