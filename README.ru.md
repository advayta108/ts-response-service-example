<h1 align="center">ts-response-service-example</h1>

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

<p align="center">
  <a href="https://prettier.io/"><img src="https://img.shields.io/badge/Code_Style-Prettier-f7b93e?style=for-the-badge&logo=prettier&logoColor=white" alt="Prettier" /></a>
</p>

## 📋 Кратко

Веб-сервис **заявок в ремонтную службу**: диспетчер назначает мастеров, мастера берут заявки в работу. Локально — **Bun + SQLite**, прод — **Supabase + Vercel**, **SSE**-тосты, **PWA**. Полная английская версия: **[README.md](./README.md)**.

**Репозиторий:** [advayta108/ts-response-service-example](https://github.com/advayta108/ts-response-service-example)

---

## 🚀 Запуск

Демо: роли диспетчер/мастер, SQLite, тосты в реальном времени.

```bash
bun install
bun run db:migrate
bun run db:seed
bun run dev
```

Или `make dev`. Сборка: `make build`. Docker: `make deploy`.

Пользователи после seed: **dispatcher/disp123**, **master1/m1pass**, **master2/m2pass**.

---

## 📁 Структура

См. дерево в **[README.md → Project structure](./README.md#-project-structure)**.

---

## 🔎 FOSSA и лицензии

Сканирование зависимостей — **[FOSSA](https://fossa.com)** ([.fossa.yml](./.fossa.yml)). Тексты и список лицензий сторонних компонентов — **[NOTICE.md](./NOTICE.md)**.

---

## 📖 Документация

[docs/PROMPTS.md](./docs/PROMPTS.md) · [docs/DECISIONS.md](./docs/DECISIONS.md) · [CONTRIBUTING.md](./CONTRIBUTING.md)
