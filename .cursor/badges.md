<h1 align="center">Response Service Example</h1>

<p align="center">
  <a href="https://github.com/advayta108/response-service-example/actions/workflows/vercel-deploy.yml" style="display:inline-block;margin:0 6px;"><img src="https://github.com/advayta108/response-service-example/actions/workflows/vercel-deploy.yml/badge.svg" alt="Vercel Deploy" /></a>
  <a href="https://github.com/advayta108/response-service-example/actions/workflows/ci.yml" style="display:inline-block;margin:0 6px;"><img src="https://github.com/advayta108/response-service-example/actions/workflows/ci.yml/badge.svg" alt="CI Status" /></a>
  <a href="https://github.com/advayta108/response-service-example/actions/workflows/fossa.yml" style="display:inline-block;margin:0 6px;"><img src="https://github.com/advayta108/response-service-example/actions/workflows/fossa.yml/badge.svg" alt="FOSSA Analysis" /></a>
  <a href="https://app.fossa.com/projects/custom%2B41348%2Fgithub.com%2Fadvayta108%2Fresponse-service-example?ref=badge_shield&issueType=security" style="display:inline-block;margin:0 6px;"><img src="https://app.fossa.com/api/projects/custom%2B41348%2Fgithub.com%2Fadvayta108%2Fresponse-service-example.svg?type=shield&issueType=security" alt="FOSSA Security Scan" /></a>
  <a href="https://app.fossa.com/projects/custom%2B41348%2Fgithub.com%2Fadvayta108%2Fresponse-service-example?ref=badge_shield&issueType=license" style="display:inline-block;margin:0 6px;"><img src="https://app.fossa.com/api/projects/custom%2B41348%2Fgithub.com%2Fadvayta108%2Fresponse-service-example.svg?type=shield&issueType=license" alt="FOSSA License Scan" /></a>
</p>

<p align="center">
  <a href="https://nextjs.org/" style="display:inline-block;margin:0 6px;"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://react.dev/" style="display:inline-block;margin:0 6px;"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
  <a href="https://www.typescriptlang.org/" style="display:inline-block;margin:0 6px;"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/" style="display:inline-block;margin:0 6px;"><img src="https://img.shields.io/badge/Tailwind_CSS-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://supabase.com/" style="display:inline-block;margin:0 6px;"><img src="https://img.shields.io/badge/Supabase-2c2c2c?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" /></a>
  <a href="https://tradingview.github.io/lightweight-charts/" style="display:inline-block;margin:0 6px;"><img src="https://img.shields.io/badge/Lightweight_Charts-1C1C1C?style=for-the-badge&logo=tradingview&logoColor=1E90FF" alt="Lightweight Charts" /></a>
  <a href="https://core.telegram.org/bots/webapps" style="display:inline-block;margin:0 6px;"><img src="https://img.shields.io/badge/Telegram-Mini_App-26A5E4?style=for-the-badge&logo=telegram" alt="Telegram Mini App" /></a>
</p>

FlowStocks is a TypeScript-first wealth management portal that helps professional investors access US blue-chip equities through a concierge workflow. The platform combines Telegram-based onboarding, a secure investor cabinet, and rich market analytics delivered with lightweight visualizations.

## Key features

- **Investor cabinet** – manage allocations, track filled orders, and monitor portfolio health in one place.
- **Marketplace** – explore curated US equities with fundamentals, live price feeds, and add them to your allocation.
- **Profitability modeling** – configure portfolio size, holding period, and commission schedules to forecast passive income.
- **Telegram authentication** – frictionless login flow powered by the official Telegram Authorization widgets.
- **Supabase integration** – secure storage for customer profiles and investment preferences with granular RLS policies.

## Technology stack

- [Next.js 16](https://nextjs.org/) with the App Router and React Server Components.
- [React 19](https://react.dev/) + modern Server Actions.
- [Tailwind CSS](https://tailwindcss.com/) v4 for utility-first styling.
- [Supabase](https://supabase.com/) as the persistence layer and authentication broker.
- [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) for fast market visualizations.
- TypeScript everywhere for reliable typing and IDE assistance.

## Getting started

### Prerequisites

- Node.js **20.10+** (Next.js 16 requires Node 18.18 at minimum; we recommend the current LTS v20).
- npm **10+** or pnpm/yarn if you prefer an alternative package manager.
- A Supabase project with the SQL schema from the `supabase` directory applied.
- A Telegram bot configured for login via [Telegram Authentication](https://core.telegram.org/widgets/login).

### Installation

```bash
git clone https://github.com/advayta108/response-service-example.git
cd response-service-example
npm install
```

### Environment variables

Create a `.env.local` file at the repository root and provide the following variables:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
TELEGRAM_BOT_TOKEN=...
JWT_SECRET=...
TON_DEV_ADDRESS=...
TON_USDT_JETTON_MASTER=...

NEXT_KYC_PROVIDER_API_KEY=...
NEXT_KYC_PROVIDER_API_URL=...
NEXT_PUBLIC_APP_URL=...
RESEND_API_KEY=re_... # Resend API key (required for email sending)
RESEND_FROM_EMAIL=onboarding@resend.dev # Sender email (optional, defaults to onboarding@resend.dev)
INVITE_RECIPIENT_EMAIL=launch@flowstocks.trade # Email recipient for access requests (optional)
```

#### Supabase Storage Setup

For profile avatar uploads, you need to create a storage bucket named `avatars` in your Supabase project:

1. Go to your Supabase Dashboard → Storage
2. Create a new bucket named `avatars`
3. Set it as **Public** (or configure RLS policies if you prefer private buckets)
4. Configure bucket policies to allow authenticated users to upload files

Alternatively, you can create the bucket using SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update their own avatars
CREATE POLICY "Allow authenticated users to update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow public read access (if bucket is public)
CREATE POLICY "Allow public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

> The application will fail fast during startup if any required variable is missing.

#### Email Service (Resend)

The `RESEND_API_KEY` variable should contain your Resend API key. To set up email sending:

1. Create an account at [Resend](https://resend.com)
2. Get your API key from the dashboard (starts with `re_`)
3. Set `RESEND_API_KEY` to your API key
4. (Optional) Set `INVITE_RECIPIENT_EMAIL` to the email address where access requests should be sent (defaults to `launch@flowstocks.trade`)
5. (Optional) Verify your domain in Resend and set `RESEND_FROM_EMAIL` to your verified domain email (e.g., `onboarding@flowstocks.trade`)

For testing, you can use `onboarding@resend.dev` as the sender email without domain verification.

### Local development

```bash
npm run dev
```

The Next.js development server runs on [http://localhost:3000](http://localhost:3000). Use the `supabase` CLI or the hosted Supabase dashboard to apply migrations from `supabase/migrations`.

### Quality checks

- `npm run lint` – run ESLint across the entire project.
- `npm run build` – compile a production-ready build.
- `npm run start` – serve the prebuilt application.

## Project structure

- `src/app` – Next.js routes, including the public landing page, cabinet, and market views.
- `src/components` – shared React components such as charts and modal flows.
- `src/context` – React contexts for managing cart state and Telegram authentication.
- `src/lib` – environment helpers and Supabase server client factories.
- `supabase` – SQL schema, row-level security policies, and migration history.

## Contributing

We welcome ideas, bug reports, and pull requests. Please read the updated [contribution guidelines](.github/CONTRIBUTING.md) before you start. Feature proposals and defect reports can be filed via GitHub Issues.

## License

FlowStocks is dual-licensed under the [MIT license](LICENSE.md) and the [Apache 2.0 license](LICENSE.Apache). Choose the one that best fits your project requirements.

### Third-Party Licenses

This project uses third-party dependencies with various licenses. For complete information about all dependencies and their licenses, please see the [NOTICE.md](NOTICE.md) file.

**Summary of third-party licenses:**

- **MIT License** – Most dependencies (Next.js, React, TypeScript, Tailwind CSS, Supabase, etc.)
- **Apache 2.0** – Some accessibility and testing libraries, sharp image processing
- **MPL-2.0** – @vercel/og and Satori packages
- **ISC License** – Some utility packages (compatible with MIT)
- **BSD-3-Clause, BSD-2-Clause, 0BSD** – Various utility libraries (compatible with MIT/Apache-2.0)
- **LGPL-3.0-or-later, FTL** – Native libraries for sharp/libvips (used as unmodified dependencies)
- **Python-2.0** – argparse package (compatible with MIT)
- **CC-BY-4.0, CC-BY-SA-4.0, CC0-1.0** – Documentation and data files
- **Unlicense** – Some utility packages (public domain)

All third-party licenses are compatible with the project's dual MIT/Apache-2.0 licensing. License compliance is maintained through automated scanning with [FOSSA](https://fossa.com/).

**License files:**

- [LICENSE.md](LICENSE.md) – MIT License
- [LICENSE.Apache](LICENSE.Apache) – Apache License 2.0
- [LICENSE.MPL-2.0](LICENSE.MPL-2.0) – Mozilla Public License 2.0 (for @vercel/og and Satori dependencies)
- [NOTICE.md](NOTICE.md) – Third-party software notices and license information
