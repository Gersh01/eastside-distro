# 0003. PostgreSQL + Drizzle; migrations at boot

- Status: Accepted
- Date: 2026-10-19

## Context

Orders, prices, accounts and audits are relational and need transactions. The database sits in
isolated subnets, so GitHub runners can't reach it to run migrations.

## Decision

- PostgreSQL 17 everywhere (Docker locally, a CI service container, RDS on AWS).
- Drizzle ORM with `casing: 'snake_case'`. The schema in `src/server/db/schema/` is the source of
  truth; drizzle-kit generates SQL migrations in `drizzle/` that are reviewed in PRs.
- On AWS, each container runs pending migrations (and the catalog sync) during startup, in
  `src/instrumentation-node.ts`, serialized with `pg_advisory_lock`. A failure exits the process,
  and the ECS circuit breaker rolls the deploy back.

## Consequences

- No separate migration job or bastion is needed.
- Rolling deploys run old code against the new schema briefly, so migrations must be backward
  compatible (expand → migrate → contract). `.claude/skills/db-change` spells this out, and a
  hook blocks edits to committed migrations.
- Long migrations delay startup; the health-check grace period is 120 s. Run heavy backfills as
  separate tasks instead.

## Alternatives considered

- **Prisma:** good DX, but a generate step and heavier runtime. Drizzle's TS schema composes well
  and runs anywhere Node runs.
- **Migrations from CI:** needs network access to RDS (bastion, VPN or public DB). Rejected for
  security.
