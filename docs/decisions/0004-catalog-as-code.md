# 0004. Catalog as code until an admin UI exists

- Status: Accepted
- Date: 2026-10-19

## Context

The catalogue is a designed PDF with 32 products that changes a few times a year. Building a
product admin first would delay launch, and an unreviewed admin edit could mislabel a regulated
ingredient.

## Decision

Products, variants and categories are defined in TypeScript (`src/features/catalog/data/`).
`syncCatalog` upserts them into Postgres locally (`npm run db:seed`) and at every production boot.
Removed items are archived, never deleted. Tests check SKU uniqueness, images, ingredient classes
and the 7-OH policy. Prices will follow the same path until the Phase 2 admin.

## Consequences

- Every catalog change is a reviewed PR with tests, and an easy task for Claude (`catalog-update`
  skill).
- Changes need a deploy. When staff need self-service editing, build the admin, turn off
  `RUN_CATALOG_SYNC_ON_BOOT`, and make the database the source of truth (supersede this ADR).
- SKUs derive from product and option codes. Changing a code changes SKUs, so treat codes as
  permanent once orders exist.
