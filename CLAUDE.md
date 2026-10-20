# East Side Distro

@AGENTS.md

Website for **East Side Distro** (Eastside Distribution Co.), an Orlando, FL distributor of kava,
kratom ("botanicals"), hemp-derived THC and functional beverages. Visitors browse a paginated
catalogue, apply for wholesale, and contact sales. Next phases add sign-up with ID-based age
verification and online ordering for retail and wholesale customers.

Where things stand: `docs/roadmap.md`. How it fits together: `docs/architecture.md`.
Legal constraints: `docs/compliance.md`. Decisions and their reasons: `docs/decisions/`.

## Commands

| Task                                  | Command                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| First-time setup                      | `npm ci` · `cp .env.example .env.local` · `npm run db:setup` (Docker)                      |
| Dev server                            | `npm run dev` → http://localhost:3000                                                      |
| **All checks (run before finishing)** | `npm run check` (lint, typecheck, format check, unit tests)                                |
| Unit tests / one folder               | `npm test` · `npx vitest run src/features/compliance`                                      |
| End-to-end (needs the local DB)       | `npm run e2e`                                                                              |
| Production build (no DB needed)       | `npm run build`                                                                            |
| Schema change                         | edit `src/server/db/schema/*` → `npm run db:generate -- --name <x>` → `npm run db:migrate` |
| Reload catalog into the DB            | `npm run db:seed` (idempotent)                                                             |
| Infra checks                          | `npm --prefix infra test` · `npm --prefix infra run synth` (cdk-nag)                       |

## Stack

Next.js 16.4 (App Router, Turbopack, **Cache Components + Partial Prefetching**, React Compiler) ·
React 19.3 · TypeScript strict with `noUncheckedIndexedAccess` · Tailwind CSS 4 · PostgreSQL 17 +
Drizzle ORM (snake_case casing) · zod 4 · Vitest 5 · Playwright · AWS (ECS Fargate, RDS, S3+KMS,
SES) via CDK in `infra/` · GitHub Actions with OIDC deploys.

## Layout

```
src/app/                 routes only: thin pages that compose feature components
src/features/<feature>/  components/, actions.ts ('use server'), service.ts + queries.ts ('server-only'),
                         schema.ts (zod, shared with forms), *.test.ts next to the code
src/server/              infrastructure: db/ (client, schema/), email/ (log|ses), env.ts, request.ts
src/domain/              pure constants: ingredient classes, US states, business details
src/lib/                 pure helpers: pagination, form state, zod building blocks, cx
src/components/          shared UI: layout/, ui/, brand/
src/instrumentation*.ts  AWS boot tasks: migrations + catalog sync (behind env flags)
drizzle/                 generated SQL migrations     e2e/   Playwright specs
infra/                   AWS CDK app (own package; read infra/CLAUDE.md)     docs/   design docs
```

Imports flow `app → features → server | domain | lib | components`. `server/` never imports
`features/` (the composition roots are `src/instrumentation-node.ts` and `scripts/`). `domain/`
imports nothing.

## Rendering rules (Cache Components)

- **`next build` runs without a database.** Nothing may query the DB while prerendering.
- DB reads live in `'use cache'` functions (with `cacheLife` and `cacheTag`) that are called from a
  component inside `<Suspense>`, after it awaits request data (`params`, `searchParams`,
  `cookies()`). Pass the `params`/`searchParams` promise down instead of awaiting it at the top
  of a page or layout. Pattern: `src/app/catalog/[category]/page.tsx`.
- Current time or other per-request work: `await connection()` inside its own Suspense boundary
  (see `ProductAvailability`).
- After a write: `updateTag(tag)` in Server Actions, `revalidateTag(tag, 'max')` in route handlers.
- This Next version differs from older training data: `error.tsx` gets `{ error: unknown, retry }`,
  `next/image` uses `preload` (not `priority`), middleware is `proxy.ts`. Check
  `node_modules/next/dist/docs/` before using an API you haven't seen in this repo.

## Conventions

- Validate all input with zod **on the server**. Server Actions return `FormState`
  (`src/lib/form.ts`); forms use `useActionState` and re-populate from `state.values`.
- **Authorize inside every Server Action and route handler**; UI checks are not security.
- Business-significant writes: one transaction plus an `audit_events` row. Send email after the
  commit and log failures instead of throwing.
- Money in integer cents. Timestamps with time zone. Compliance dates are Eastern-time
  `YYYY-MM-DD` strings from `businessDate()`.
- Stored option codes (checkbox answers, statuses) are never renamed, only added.
- Environment variables go through `env()` in `src/server/env.ts` (lazy, zod-validated); add new
  ones there, in `.env.example`, and in `infra/lib/eastside-stack.ts`.
- Prettier runs automatically after every edit (hook). Brand tokens are in
  `src/app/globals.css`: `lime`, `ink`, `mist`, `sand`, `line`, `muted`, plus `label-mono`.
- Tests: Vitest unit tests beside the code; Playwright specs for user flows, using role-based
  selectors with exact names.

## Domain rules (never break these)

- **Compliance fails closed.** Anything a customer can buy or receive must pass `evaluate()` in
  `src/features/compliance/` for the destination state and today's date (pickup = FL).
  `needs_review` rules are still enforced. Change rules only with the `compliance-rule` skill.
- **21+ for every purchase** (`COMPANY_MINIMUM_AGE`), with an approved ID verification (Phase 1).
- **Hemp THC**: Florida only for now; prohibited everywhere from **2026-12-11** (federal cap).
- **No concentrated 7-OH products**, ever (a test enforces it).
- "Botanical" in catalogue copy means kratom; every product declares all its `ingredientClasses`.
- **Identity documents** are the most sensitive data here: private KMS-encrypted bucket,
  presigned URLs only, deleted after review, and never logged, emailed, cached, or sent to the client.
- No health or disease claims in copy; keep the FDA disclaimer in the footer.
- Payments: Stripe prohibits kava sellers, so payments go through a gateway adapter for a
  high-risk merchant account (`docs/decisions/0006-payments-gateway-adapter.md`).

## Catalog

Defined in code (`src/features/catalog/data/products.ts`, transcribed from
`docs/reference/EastSide-Catalogue.pdf`) and upserted into Postgres by `syncCatalog`. Prices are
not in the catalogue yet; open questions are in `docs/catalog-data-review.md`.

## Workflows

- Skills: `/feature <roadmap item>` (spec → schema → server → UI → tests → docs) · `/db-change` ·
  `/catalog-update` · `/compliance-rule` · `/ship` (checks, docs, PR).
- Agents: run `security-reviewer` (auth, PII, ID documents, infra) and `compliance-reviewer`
  (catalog, checkout, rules) on related diffs before merging.
- Hooks block edits to `.env*` (except `.env.example`), lockfiles, committed migrations,
  `drizzle/meta/` and `docs/reference/`.

## Deploys

CI runs on every PR and push. After CI passes on `main`, the Deploy workflow ships to staging.
Production is a manual run of the Deploy workflow and waits for an approver. Don't run
`cdk deploy`, `aws` commands with side effects, or `git push` unless the user asks.
Details: `docs/runbooks/deployments.md`.
