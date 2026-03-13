# Ключевые решения (DECISIONS)

1. **Bun** — установка зависимостей и запуск Next.js (`bun run dev`). Миграции/сид через **Node + tsx**, чтобы нативный `better-sqlite3` стабильно грузился (в т.ч. на Windows; Bun + этот нативный модуль может падать).
2. **SQLite + better-sqlite3** — без отдельного сервера БД; атомарные обновления для защиты от гонки на уровне одной строки SQL.
3. **Гонка «взять в работу»** — один `UPDATE ... WHERE id = ? AND status = 'assigned' AND assigned_to = ?`; при `changes === 0` ответ **409**, без отдельных блокировок приложения.
4. **Роли** — упрощённая авторизация: cookie `session_user_id` после POST `/api/auth/login`; проверка роли в API диспетчера/мастера.
5. **Миграции** — один SQL-файл `drizzle/0000_init.sql` с `IF NOT EXISTS`, идемпотентный запуск при старте Docker.
6. **Docker** — один образ с полным `node_modules` (нативный модуль SQLite); volume `/data` для файла БД.
7. **Tailwind 4** — через `@import "tailwindcss"` и `@tailwindcss/postcss`, без отдельного `tailwind.config.js` по необходимости.
