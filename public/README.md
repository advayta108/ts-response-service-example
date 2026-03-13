# `public/` — static + PWA

| File              | URL              | Purpose                                                               |
| ----------------- | ---------------- | --------------------------------------------------------------------- |
| **manifest.json** | `/manifest.json` | Web App Manifest (install, theme, icons)                              |
| **icon.svg**      | `/icon.svg`      | Favicon / maskable icon                                               |
| **sw.js**         | `/sw.js`         | Service worker (precache shell; registered in prod via `RegisterPWA`) |
| **robots.txt**    | `/robots.txt`    | Crawlers                                                              |

PWA checklist: HTTPS (e.g. Vercel) + valid manifest + SW. Local dev: open `?pwa=1` to register SW.

---

## Badges (CI · Deploy · FOSSA)

[![CI](https://github.com/advayta108/ts-response-service-example/actions/workflows/ci.yml/badge.svg)](https://github.com/advayta108/ts-response-service-example/actions/workflows/ci.yml)
[![Deploy](https://github.com/advayta108/ts-response-service-example/actions/workflows/deploy.yml/badge.svg)](https://github.com/advayta108/ts-response-service-example/actions/workflows/deploy.yml)
[![FOSSA](https://app.fossa.com/api/projects/custom%2B41348%2Fgithub.com%2Fadvayta108%2Fts-response-service-example.svg?type=shield)](https://app.fossa.com/projects/custom%2B41348%2Fgithub.com%2Fadvayta108%2Fts-response-service-example)

---

## FOSSA: авто-PR с бейджем / отчётом

У FOSSA **нет** отдельной настройки «всегда класть отчёт именно в `public/README.md`». Обычно делают так:

1. **При импорте репо (Quick Import)** в мастере FOSSA для GitHub иногда есть опция вроде **«Submit badge PR after import»** — тогда открывается PR с фрагментом для README (часто корневой `README.md`).
2. Чтобы бейджи жили в **`public/README.md`**: либо **вручную** вставить блок (как выше), либо после PR от FOSSA **перенести** строки в этот файл и смержить.
3. **Полный отчёт (attribution / SBOM)** — в FOSSA UI: **Actions → Generate Compliance Report** или API; авто-PR с полным отчётом в репо — через **GitHub Action** [`fossas/fossa-action`](https://github.com/fossas/fossa-action) + свой шаг, который коммитит артефакт (это уже кастом, не «бот FOSSA» сам по пути файла).

Итого: **бот FOSSA** чаще всего предлагает PR **один раз** при подключении; путь файла в PR не настраивается — правите файл сами или дублируйте бейдж сюда.
