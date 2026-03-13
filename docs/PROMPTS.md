# PROMPTS.md — журнал запросов к AI

Полный журнал перенесён из корня. **Репозиторий:** `https://github.com/advayta108/ts-response-service-example`

| Параметр     | Значение                             |
| ------------ | ------------------------------------ |
| **Prod БД**  | Supabase PostgreSQL (`DATABASE_URL`) |
| **Локально** | SQLite (`./data/app.db`)             |

---

## Промпт 12 — таски (документация, Community Standards, Supabase, CI)

Разбивка запроса:

| #    | Задача                                                                                                | Статус           |
| ---- | ----------------------------------------------------------------------------------------------------- | ---------------- |
| 12.1 | README: бейджи стека (прод), ссылки на **docs/**                                                      | ✅               |
| 12.2 | Community Standards: **CONTRIBUTING**, **SECURITY**, **CODE_OF_CONDUCT** в корне под репозиторий      | ✅               |
| 12.3 | Перенос **DECISIONS.md**, **PROMPTS.md** → **docs/**; корень — краткие указатели                      | ✅               |
| 12.4 | `.cursor/PROMPTS.md` — этот список тасков                                                             | ✅               |
| 12.5 | `bun run db:seed` (SQLite)                                                                            | по необходимости |
| 12.6 | Миграция продакшена на **PostgreSQL**: `drizzle-pg/`, `getDbContext()`, `db:migrate:pg`, `db:seed:pg` | ✅               |
| 12.7 | **env.example.txt** (шаблон переменных; `.env.example` может быть в ignore)                           | ✅               |
| 12.8 | **deploy.yml**: push main → миграция Supabase → Vercel                                                | ✅               |
| 12.9 | README: секреты GitHub / переменные Vercel                                                            | ✅               |

---

### 1–11 (кратко, см. историю коммитов)

1. Инициализация Next.js, Bun, TASK.txt, Docker.
2. `bun:sqlite`, safeJson.
3. Диспетчер/мастер, AuthNav.
4. SSE, назначение, возврат диспетчеру.
5. Тосты диспетчера, модалка мастера.
6. Синхронизация списка, `docs/REALTIME_LIST_SYNC.md`.
7. `globalThis` для SSE, поле `toast` в API.
8. История диспетчера, исполнитель, детали.  
   9–11. Сиды, тесты гонки, Vercel CLI, README PowerShell.

### 10. Следующие идеи

Postgres audit log, E2E, полный перенос на PG локально.

---

## Промпт 13 — UX «Подробнее о заявке»: tel + Яндекс.Карты

**Дата:** 2025-03-13

**Запрос (суть):**

- В блоке **«Подробнее о заявке»** (история диспетчера):
  - **Телефон** — ссылка **`tel:`** (звонок с устройства).
  - **Адрес** — ссылка на **Яндекс.Карты** со **строкой поиска** = адрес заявки.
- Пример запроса к `suggest-maps.yandex.com` в промпте — **не используем** на клиенте (куки, CORS, лишняя сложность). Достаточно открытия карт с параметром **`?text=`** + `encodeURIComponent(адрес)` — Яндекс сам подставляет запрос в поиск (как «просто отправить в карты»).

**Результат:**

- `telHref(phone)` → `tel:+7...`
- `yandexMapsSearchUrl(address)` → `https://yandex.com/maps/?text=...`
- Документировано здесь; реализация в `dispatcher/page.tsx` (история → details).

---

### 14. (следующий)

_по необходимости_

---

## Промпт 15 — «Все заявки» карточка, история отдельно, мастер tel/maps

**Дата:** 2025-03-13

**Запрос:**

1. Панель диспетчера: сворачиваемая карточка **«Все заявки»** вместе с **фильтром** и списком.
2. У мастеров в карточках заявок — **tel:** и ссылки **Яндекс.Карты** (как у диспетчера).
3. При смене фильтра в кабинете диспетчера «ломалась» история: она строилась из отфильтрованного списка → при фильтре «new» история пустая. **История не должна зависеть от фильтра списка**; у истории **свой фильтр** (все завершённые/отменённые · только завершённые · только отменённые).

**Результат:**

- Состояние **`allRequests`** — всегда полный `GET /api/requests`; фильтр списка только на клиенте (`listFilter`).
- **`historyRows`** из `allRequests` + **`historyFilter`**.
- Карточка `<details open>` «Все заявки»: фильтр + список.
- Мастер: `RequestCard` — ссылки tel + maps.

---

## Промпт 16 — Главная и шапка после входа

**Дата:** 2025-03-13

**Запрос:**

1. После авторизации на **Главной**: вместо блока «Вход (диспетчер / мастер)» — один пункт **«Перейти в кабинет»** с URL `/dispatcher` или `/master` по роли.
2. **«Создать заявку»** — доступна **всем** (и гостям, и диспетчеру, и мастеру), в т.ч. в **шапке (AuthNav)** у авторизованных (раньше «Новая заявка» скрывалась после входа).

**Результат:**

- `page.tsx` — client, `/api/auth/me`; гость: CTA «Создать заявку» + «Вход…»; авторизован: «Создать заявку» + «Перейти в кабинет».
- `AuthNav` — всегда ссылка «Создать заявку»; для авторизованных вместо отдельных «Диспетчер»/«Мастер» — «Перейти в кабинет»; гостям по-прежнему Вход + быстрые ссылки на кабинеты (редирект на логин).

---

## Промпт 17 — Лицензии в корень, ссылки, FOSSA

**Сделано:** `LICENSE.Apache`, `LICENSE.MPL-2.0`, `CODE_OF_CONDUCT.md` в корне; ISSUE_TEMPLATE + NOTICE + CONTRIBUTING; FOSSA locator `custom+41348/github.com/advayta108/ts-response-service-example`.

---

## Промпт 18 — Косметика: Prettier, CI/CD, README EN

**Запрос:**

1. README — бейдж **Code Style: Prettier** (как в промпте).
2. Вверху статусы **CI/CD**; **ci.yml**: тесты, билд, линтеры; этап деплоя/проверки через **docker-compose**.
3. Позже: по умолчанию **README.md на EN**, русский — **README.ru.md** (см. промпт 19).

**Сделано:** см. промпт 19 (актуальные имена файлов).

---

## Промпт 19 — advayta108, README EN по умолчанию, public PWA

**Запрос:**

1. Заменить опечатку **`adavayta108` → `advayta108`** во всех MD (docs, .github, корень) и связанных yml (FOSSA, шаблоны).
2. Документация по умолчанию — **английская**: основной **`README.md` (EN)**; русский — **`README.ru.md`**. Файл `README.en.md` удалён.
3. Почему в `public` не было Next-файлов — добавить **icon**, **manifest**, **robots** для нормальной работы и PWA-заготовки.

**Сделано:**

- Массовая замена URL на `github.com/advayta108/ts-response-service-example`; FOSSA locator обновлён.
- **README.md** — EN (default для GitHub); **README.ru.md** — RU; ссылки RU↔EN в шапке.
- **`public/icon.svg`**, **`public/robots.txt`**; позже **`public/manifest.json`** + SW (промпт 20).
- **`layout.tsx`**: `metadataBase` (Vercel URL или localhost), `icons`, `appleWebApp`, title/description EN.

**Почему раньше пустой `public`:** в скaffold не клали статику; Next не создаёт иконки сам — их задают вручную или через `create-next-app` с шаблоном. Без `icon`/`manifest` приложение работает, но хуже для вкладки браузера, «Добавить на экран» и SEO.

---

## Промпт 20 — Makefile, manifest.json, PWA, tests/

**Запрос:**

1. **Makefile**: `all` (PHONY), по умолчанию **`make` → dev**; `install`, `dev`, `build`, `deploy`, `vercel`.
2. В **public** — **`manifest.json`**, полноценная **PWA** (manifest + при необходимости SW).
3. Тесты из **`src/lib`** перенести в **`tests/`**, поправить запуск.
4. Дальше пользователь сам настраивает `.env`, GitHub Actions, Vercel.

**Сделано:**

- **Makefile**: `.DEFAULT_GOAL := dev`, цели `install`, `migrate`, `seed`, `test`, `dev` (install+migrate+dev), `build`, `deploy`/`docker-up`, `vercel`.
- **`public/manifest.json`** — id, scope, standalone, icons; удалён дублирующий `app/manifest.ts`.
- **`public/sw.js`** + **`RegisterPWA`** (регистрация SW в production; в dev — `?pwa=1`); **`layout`**: `manifest`, `viewport.themeColor`.
- **`vercel.json`**: заголовки для `manifest.json` и `sw.js`.
- **`tests/take-race.test.ts`**, **`tests/take-logic.test.ts`**; `bun test tests`; CI обновлён.

---

## Промпт 21 — README как в примере linecut: бейджи EN/RU, FOSSA, структура

**Запрос:**

1. Переключатель языка — **бейджи-ссылки** English / Русский (как в примере), без длинного текстового «Language (default)…».
2. Описание демо (dispatcher/master, SQLite, SSE) — в разделе **запуска**, не в шапке.
3. Раздел **FOSSA** + лицензии со ссылкой на **NOTICE.md**; вернуть **unicode-иконки** у разделов; убрать лишний блок **CI/CD** из README.
4. Структура README по образцу (Abstract, Overview, Install, Dev, Build, Production, Structure, Docs, License).
5. Раздел **структура проекта** (дерево каталогов).

**Сделано:** переписан **README.md** (EN default) и **README.ru.md**; CI-бейджи убраны из шапки; FOSSA + NOTICE; дерево `src/`, `tests/`, `public/`, workflows.

---

## Промпт 22 — Автор git advayta108, один Initial commit, бейджи CI/FOSSA, FOSSA PR

**Дата:** 2026-03-14

**Запрос (как от пользователя):**

- Код уже в репозитории; в коммитах автор **local** — из-за `user.name` в git; **переписать на advayta108** и **схлопнуть коммиты в один**: сообщение **`Initial commit`**.
- **Не видны бейджи CI и FOSSA** (интеграции не до конца настроены) — **всё равно добавить бейджи** в README; лицензии в FOSSA позже.
- Подключены **Vercel** и **FOSSA**; как настроить, чтобы **бот FOSSA сам открывал PR** с отчётом в **`public/README.md`**.
- Добавить этот промпт в **docs/PROMPTS.md** и **force push** (перезапись истории).

**Сделано:**

- История: `git checkout --orphan` → один коммит **`Initial commit`**, автор **`advayta108 <advayta108@users.noreply.github.com>`** (или email из `git config`), затем **`git push -f origin main`**.
- **README.md** / **README.ru.md**: бейджи **CI** (`actions/workflows/ci.yml/badge.svg`) и **FOSSA** (shield по locator из `.fossa.yml`: `custom+41348/github.com/advayta108/ts-response-service-example`).
- **public/README.md**: те же бейджи + кратко **как FOSSA PR**: при Quick Import опция badge PR (часто в корневой README); явного «только public/README.md» нет — перенос вручную или дублирование бейджа; полный отчёт — Action/ручная генерация в FOSSA.

**Почему в логах был `local`:** в `git config user.name` (глобально или в репо) стояло имя **local** — GitHub показывает его как автора коммита; после amend/orphan с нужным `--author` отображается **advayta108**.
