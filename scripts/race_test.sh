#!/usr/bin/env bash
# Параллельный take (нужен master1, заявка ID в статусе assigned на master1)
BASE="${1:-http://localhost:3000}"
RID="${2:-2}"
COOKIEJAR=$(mktemp)
trap 'rm -f "$COOKIEJAR"' EXIT
curl -s -c "$COOKIEJAR" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"name":"master1","password":"m1pass"}' >/dev/null
echo "Parallel POST .../requests/$RID/take"
curl -s -o /dev/null -w "%{http_code}\n" -b "$COOKIEJAR" -X POST "$BASE/api/requests/$RID/take" &
curl -s -o /dev/null -w "%{http_code}\n" -b "$COOKIEJAR" -X POST "$BASE/api/requests/$RID/take" &
wait
echo "Ожидается одна 200 и одна 409 (если заявка была assigned)."
