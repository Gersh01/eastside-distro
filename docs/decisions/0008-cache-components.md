# 0008. Cache Components rendering; no database at build time

- Status: Accepted
- Date: 2026-10-19

## Context

Next.js 16.4 enables Cache Components and Partial Prefetching by default: pages prerender a static
shell, and uncached or request-specific data must sit behind `<Suspense>` or in `'use cache'`
functions. Docker and CI builds have no database.

## Decision

- Keep the framework defaults (`cacheComponents: true`, `partialPrefetching: true`).
- **No database access during prerendering.** Data components await request data (params,
  searchParams, cookies) inside `<Suspense>`, then call cached query functions
  (`'use cache'` + `cacheLife` + `cacheTag`).
- Time-dependent output (compliance availability) calls `connection()` in its own boundary.
- Catalog reads are tagged `catalog`; writes call `updateTag`.

## Consequences

- Builds never need secrets or a database, and every page has an instant static shell.
- Developers (and Claude) must follow these patterns. The dev overlay and `next build` flag
  violations, CLAUDE.md lists the rules, and the bundled docs in `node_modules/next/dist/docs/`
  are the reference.
- The in-memory cache is per task. Each ECS task warms its own cache; use
  `'use cache: remote'` with a shared handler only if hit rates justify it.
