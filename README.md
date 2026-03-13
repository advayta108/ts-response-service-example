<h1 align="center">ts-response-service-example</h1>

<!-- GitHub Actions (.github/workflows) — сверху, один ряд -->
<p align="center">
  <a href="https://github.com/advayta108/ts-response-service-example/actions/workflows/ci.yml"><img src="https://github.com/advayta108/ts-response-service-example/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  &#8285;
  <a href="https://github.com/advayta108/ts-response-service-example/actions/workflows/deploy.yml"><img src="https://github.com/advayta108/ts-response-service-example/actions/workflows/deploy.yml/badge.svg" alt="Deploy" /></a>
  &#8285;
  <a href="https://app.fossa.com/projects/custom%2B41348%2Fgithub.com%2Fadvayta108%2Fts-response-service-example"><img src="https://img.shields.io/badge/FOSSA-compliance-289E6D?style=flat-square&logo=fossa&logoColor=white" alt="FOSSA" /></a>
  &#8285;
  <a href="https://prettier.io/"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4?style=flat-square&logo=prettier&logoColor=white" alt="Prettier" /></a>
</p>

<p align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-2c2c2c?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" /></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" /></a>
  <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle-398464?style=for-the-badge&logo=drizzle&logoColor=white" alt="Drizzle" /></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /></a>
</p>

<p align="center">
  <a href="./README.md"><img src="https://img.shields.io/badge/English-0052CC?style=for-the-badge&logo=github&logoColor=white" alt="English" /></a>
  <a href="./README.ru.md"><img src="https://img.shields.io/badge/Русский-0052CC?style=for-the-badge&logo=github&logoColor=white" alt="Русский" /></a>
</p>

## 📋 Abstract

Web service for **repair / dispatch requests**: clients submit jobs; a **dispatcher** assigns work to **masters**; masters take jobs, complete or return them. Supports **race-safe** “take in progress” (SQLite / PostgreSQL), **SSE** toasts for live updates, optional **PWA** (manifest + service worker). Local dev: **Bun** + **SQLite**. **Vercel / Docker:** только **Postgres** (`DATABASE_URL` / Supabase) — сборка Next в Node подменяет `bun:sqlite`, SQLite в прод-API не используется.

**Repository:** [advayta108/ts-response-service-example](https://github.com/advayta108/ts-response-service-example)

---

## 🔍 Overview

### ✨ Features

- ✅ **Roles** — dispatcher vs master (session cookie)
- ✅ **Request lifecycle** — `new` → `assigned` → `in_progress` → `done` / `canceled`
- ✅ **Race-safe take** — parallel “take” → one success, other **409** + toast
- ✅ **SSE** — dispatcher / master lists and toasts stay in sync
- ✅ **PWA** — `public/manifest.json`, `sw.js` (prod registration)
- ✅ **Docker** — `docker compose up --build`

### 🛠️ Technology stack

| Layer                  | Choice                                                        |
| ---------------------- | ------------------------------------------------------------- |
| Framework              | **Next.js 15** (App Router)                                   |
| Runtime (API / SQLite) | **Bun**                                                       |
| DB local               | **SQLite** (`bun:sqlite`) + Drizzle                           |
| DB prod                | **PostgreSQL** (Supabase) optional                            |
| Styling                | **Tailwind CSS 4**                                            |
| Deploy                 | **Vercel**; CI uses **Makefile** + **Docker** smoke on `main` |

---

## 📦 Installation

```bash
git clone https://github.com/advayta108/ts-response-service-example.git
cd ts-response-service-example
bun install
```

Or: `make install`

---

## 🚀 Development

**What you run:** a small **repair-request** demo — dispatcher / master UIs, SQLite DB, SSE toasts. No Supabase required locally.

```bash
bun run db:migrate   # SQLite ./data/app.db (идемпотентно)
bun run db:seed      # dispatcher/disp123, мастера, заявки
bun run dev          # или: npx next dev — SQLite через better-sqlite3 (без Postgres в .env)
```

**Локально без Postgres:** в `.env` **не** задавай `DATABASE_URL` с `postgres://`. Иначе приложение ходит в Supabase, а не в SQLite.

→ [http://localhost:3000](http://localhost:3000)

Or: `make dev` (install + migrate + dev)

---

## 🏗️ Build & test

```bash
bun run build
bun test tests
```

Or: `make build` · `make test`

**Code style:** `bun run format` · `bun run lint:prettier` · `bun run lint`

---

## ☁️ Production (Supabase + Vercel)

1. **Supabase** — [Database → URI](https://supabase.com/dashboard) (пароль БД).
2. **Vercel → Settings → Environment Variables → Production** — добавь **`DATABASE_URL`** _или_ **`POSTGRES_URL`** (из интеграции Supabase). Без этого на проде будет «БД недоступна».
3. **Один раз** миграции + сиды (локально с тем же URL или GitHub secret + Deploy workflow):
   `bun run db:migrate:pg` → `bun run db:seed:pg`
4. **Redeploy** после смены env.

**Если логин пишет «Проверьте миграции»:** нет переменной Postgres в **Production**; не прогнаны миграции; неверный пароль в URI. Смотри логи функции в Vercel → Logs.

См. **[env.example](./env.example)**.

**Docker (host / VPS):**

```bash
docker compose up --build
# or: make deploy
```

---

## 👤 Demo users (after `db:seed`)

| Login      | Password |
| ---------- | -------- |
| dispatcher | disp123  |
| master1    | m1pass   |
| master2    | m2pass   |

---

## 📁 Project structure

```
ts-response-service-example/
├── src/app/                 # Next.js App Router (pages + API routes)
│   ├── api/                 # auth, requests, users, SSE stream
│   ├── dispatcher/          # dispatcher UI
│   ├── master/              # master UI
│   ├── login/ request/new/  # auth + create request
│   ├── layout.tsx           # shell, PWA metadata
│   └── globals.css
├── src/components/          # AuthNav, RegisterPWA, …
├── src/db/                  # Drizzle schema (SQLite + PG), getDbContext
├── src/lib/                 # realtime (SSE), session, toastMessages
├── tests/                   # bun tests (take race, validation)
├── scripts/                 # migrate, seed, migrate-pg, seed-pg
├── drizzle/                 # SQLite SQL migrate
├── drizzle-pg/              # PostgreSQL SQL migrate
├── public/                  # manifest.json, sw.js, icon.svg, robots.txt
├── .github/workflows/       # ci.yml, deploy.yml
├── Makefile
├── vercel.json
├── NOTICE.md                # third-party licenses (see FOSSA below)
└── package.json
```

---

## 📖 Documentation

| Doc                                                        | Purpose                |
| ---------------------------------------------------------- | ---------------------- |
| [docs/PROMPTS.md](./docs/PROMPTS.md)                       | AI / task log          |
| [docs/DECISIONS.md](./docs/DECISIONS.md)                   | Architecture decisions |
| [docs/REALTIME_LIST_SYNC.md](./docs/REALTIME_LIST_SYNC.md) | SSE & list sync        |
| [CONTRIBUTING.md](./CONTRIBUTING.md)                       | Contributing           |
| [SECURITY.md](./SECURITY.md)                               | Security               |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)                 | Code of conduct        |

---

## 🔎 FOSSA & licenses

This repo uses **[FOSSA](https://fossa.com)** (see [.fossa.yml](./.fossa.yml)) for dependency license scanning. Configure the project in the FOSSA dashboard and/or run `fossa analyze` in CI as you prefer.

**Third-party and dependency licenses** (MIT, Apache-2.0, MPL-2.0, BSD, ISC, CC-BY, etc.) are summarized in **[NOTICE.md](./NOTICE.md)** — include that file in distributions when required. Project license files: [LICENSE.Apache](./LICENSE.Apache), [LICENSE.MPL-2.0](./LICENSE.MPL-2.0); details in NOTICE.

---

## 📱 PWA

- **`/manifest.json`** — installable app metadata
- **`/sw.js`** — precache (active in production via `RegisterPWA`; dev: `?pwa=1`)

---

## 📜 License

Dual / multi-license per [NOTICE.md](./NOTICE.md) — [LICENSE.Apache](./LICENSE.Apache), [LICENSE.MPL-2.0](./LICENSE.MPL-2.0).
