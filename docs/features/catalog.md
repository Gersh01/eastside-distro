# Catalogue

Status: **implemented (Phase 0)**. Prices and ordering come in Phases 2–3.

## What it does

- `/catalog`: every listed product, 12 per page (`?page=N`), with category tabs and counts.
- `/catalog/[category]`: the same view filtered to one of the 7 catalogue sections (RTD Seltzer,
  RTD Energy, RTD Yerba Mate, Shots, Raw Goods, Retail, Extracts). Unknown slugs return 404.
- `/products/[slug]`: catalogue details (DETAILS, PRODUCT SPECS, ORDER UNIT, flavors or strains),
  ingredient badges, today's state availability, and an order-options table (SKU, pack; price
  "on request" until prices exist). Buttons lead to the wholesale application or a prefilled
  contact form (`/contact?product=<slug>`).

## Data

- Source of truth: `src/features/catalog/data/products.ts` (from the 2026 PDF). `syncCatalog`
  upserts categories, products and variants (`npm run db:seed`; at boot on AWS) and archives
  anything removed from code.
- Listed statuses: `active` and `coming_soon`. `draft` and `archived` are hidden.
- Images: `public/images/products/<slug>.webp`, extracted from the catalogue (placeholders until
  brand assets arrive).

## Rendering and caching

- Page shells are prerendered. Product data streams in behind `<Suspense>` after the route
  awaits `params`/`searchParams`.
- `getCatalogPage(category, page)` and `getProduct(slug)` are `'use cache'` functions
  (`cacheLife('hours')`, tag `catalog`). Call `updateTag(CATALOG_CACHE_TAG)` after any catalog
  write (Phase 2 admin).
- Availability (`ProductAvailability`) is computed per request with `connection()`, because rules
  change on dated boundaries.

## Pagination rules

- Page size 12 (`CATALOG_PAGE_SIZE`). Invalid page values become page 1. Pages past the end show
  an empty state that links back to page 1. Page 1 links use the bare path (no `?page=1`).

## Next

- Show prices (retail publicly, wholesale to approved buyers) and add-to-cart (Phase 3).
- Filters by ingredient (kava / kratom / caffeine / hemp) and brand; search.
- SEO: sitemap (generated at request time, since there is no DB at build), product JSON-LD.
