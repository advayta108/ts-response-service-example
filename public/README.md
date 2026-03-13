# `public/` — static + PWA

| File | URL | Purpose |
|------|-----|--------|
| **manifest.json** | `/manifest.json` | Web App Manifest (install, theme, icons) |
| **icon.svg** | `/icon.svg` | Favicon / maskable icon |
| **sw.js** | `/sw.js` | Service worker (precache shell; registered in prod via `RegisterPWA`) |
| **robots.txt** | `/robots.txt` | Crawlers |

PWA checklist: HTTPS (e.g. Vercel) + valid manifest + SW. Local dev: open `?pwa=1` to register SW.
