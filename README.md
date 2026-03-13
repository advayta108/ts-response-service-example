# ts-response-example — заявки в ремонтную службу

Next.js 15, TypeScript 5, Tailwind 4, SQLite (Drizzle), Bun.

## Запуск локально (Bun)

```bash
bun install
bun run db:migrate   # через Node + tsx (стабильно с better-sqlite3 на Windows)
bun run db:seed
bun run dev
```

Если `bun run db:migrate` не подходит, миграции можно выполнить в Docker.

Откройте http://localhost:3000

## Docker Compose

```bash
docker compose up --build
```

Приложение: http://localhost:3000

При первом старте выполняются миграции и сид (если БД пустая).

## Тестовые пользователи (сиды)

| Логин       | Пароль   | Роль        |
|------------|----------|-------------|
| dispatcher | disp123  | диспетчер   |
| master1    | m1pass   | мастер      |
| master2    | m2pass   | мастер      |

## Сценарий

1. **Новая заявка** (`/request/new`) — без входа; статус `new`.
2. **Диспетчер** — войти как `dispatcher`, панель `/dispatcher`: список, фильтр по статусу, назначить мастера (`assigned`), отменить (`canceled`).
3. **Мастер** — войти как `master1`, панель `/master`: «Взять в работу» (`in_progress`), «Завершить» (`done`).

## Проверка гонки («Взять в работу»)

Два параллельных `POST` на один и тот же id в статусе `assigned` для **одного** мастера: один запрос получает `200`, второй — **`409 Conflict`** (атомарный `UPDATE ... WHERE status = 'assigned' AND assigned_to = ?`).

Пример (после входа cookie можно взять из браузера или сначала залогиниться через curl с `-c cookies.txt`):

```bash
# Логин мастера (сохраняет cookie)
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"master1","password":"m1pass"}'

# Два параллельных take на заявку #2 (должна быть assigned на master1)
curl -b cookies.txt -X POST http://localhost:3000/api/requests/2/take &
curl -b cookies.txt -X POST http://localhost:3000/api/requests/2/take &
wait
```

Один ответ будет с телом `{"ok":true}`, второй — статус 409 и `code: "CONFLICT"`.

Скрипт: `scripts/race_test.sh` (Linux/macOS) или вручную два терминала PowerShell с `Invoke-WebRequest`.

## Тесты

```bash
bun test
```

## Vercel

Serverless не держит файловый SQLite на диске надёжно. Для прод-деплоя нужен **Postgres** (Neon/Supabase) и смена драйвера БД. Локально и в Docker SQLite достаточно. См. `vercel.json` при необходимости только статики/edge — полноценный деплой с БД вынесите в отдельный хост или Vercel + внешняя БД.

## Репозиторий

Инициализация Git (имя проекта **`ts-response-example`**):

```bash
git init
git remote add origin <url-вашего-репозитория-ts-response-example>
```
