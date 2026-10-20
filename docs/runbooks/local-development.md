# Local development

## Requirements

- Node.js 24 (`.nvmrc`), npm 11
- Docker Desktop (for Postgres)
- Optional: GitHub CLI (`gh`), AWS CLI

## First run

```bash
npm ci
cp .env.example .env.local
npm run db:setup     # docker compose up (Postgres 17) + migrations + catalog seed
npm run dev          # http://localhost:3000
```

Emails print to the dev server console (`EMAIL_DRIVER=log`).

## Everyday commands

| Task                   | Command                                                       |
| ---------------------- | ------------------------------------------------------------- |
| All checks             | `npm run check`                                               |
| Unit tests (watch)     | `npm run test:watch`                                          |
| End-to-end tests       | `npm run e2e` (reuses a running `npm run dev`)                |
| Production build + run | `npm run build && npm start`                                  |
| Schema change          | `npm run db:generate -- --name <x>` then `npm run db:migrate` |
| Browse the database    | `npm run db:studio`                                           |
| Stop Postgres          | `npm run db:down`                                             |
| Infra tests / synth    | `npm --prefix infra test` · `npm --prefix infra run synth`    |

## Troubleshooting

- **`npm run db:up` fails with "cannot find dockerDesktopLinuxEngine".** Docker Desktop's engine
  isn't running. Open Docker Desktop and finish any prompt it shows (updates, sign-in, terms).
  Any Postgres 17 works too: point `DATABASE_URL` in `.env.local` at it.
- **"JavaScript heap out of memory" at small heap sizes, or processes exiting with code 134.**
  Windows ran out of commit memory, not Node's heap limit. This happens when there is no pagefile
  (commit limit = physical RAM). Enable a system-managed pagefile, or close memory-heavy apps.
  Playwright runs one worker locally for this reason.
- **Playwright can't find a browser.** Run `npx playwright install chromium`.
- **A form says "too many submissions".** Rate limits are per IP hash per hour. Wait, or clear the
  rows in `wholesale_applications` / `contact_messages` locally.
- **Next.js API looks different from what you remember.** Check `node_modules/next/dist/docs/`.
  This project is on Next 16.4 with Cache Components.
