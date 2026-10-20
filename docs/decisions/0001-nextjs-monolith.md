# 0001. Next.js monolith with feature modules

- Status: Accepted
- Date: 2026-10-19

## Context

A small business needs a storefront, forms, accounts, staff tools and checkout, maintained mostly
with Claude Code. Separate frontend and backend services would double the deploys, contracts and
docs to keep in sync.

## Decision

One Next.js 16 App Router application. Server Components for pages, Server Actions for mutations,
route handlers only for webhooks and health checks. Code is grouped by feature
(`src/features/<feature>`), with shared infrastructure in `src/server` and pure helpers in
`src/domain` and `src/lib`.

## Consequences

- One deployable, one test suite, one type system from database to UI.
- Feature folders keep changes local, which suits AI-assisted edits.
- If a mobile app or partner API appears later, expose route handlers (or a separate service) over
  the same feature services.

## Alternatives considered

- **Shopify / BigCommerce:** fastest storefront, but kratom/kava payment restrictions, custom ID
  review, and dated state rules fight the platform.
- **Medusa (headless commerce) + Next frontend:** strong B2B features, but two services and an
  extra admin to run.
