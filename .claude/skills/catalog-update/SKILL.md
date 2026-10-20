---
name: catalog-update
description: Add, change or retire products, flavors, strains, sizes, packs, images or prices in the East Side Distro catalog (code-defined in src/features/catalog/data). Use when the business sends a new catalogue PDF, price sheet, or product change.
argument-hint: <what changed, or path to the new catalogue/price sheet>
---

# Update the catalog

The catalog is **code**: `src/features/catalog/data/products.ts` is the source of truth, and
`syncCatalog` upserts it into Postgres (`npm run db:seed` locally; automatically at boot on AWS).
Products or variants removed from code are archived in the database, never deleted.

## Steps

1. Read the source the user provided (PDF, sheet, message). Never guess missing facts such as
   prices, case sizes or strengths: list them as questions instead.
2. Edit `products.ts`:
   - Keep copy close to the catalogue wording; fix obvious typos and log each fix.
   - Build variants with `variantMatrix(code, axes, packs)` from `data/builders.ts`.
     **Never change an existing product `code` or option label that already has SKUs in
     production**: SKUs derive from them, and orders will reference those SKUs.
   - Set `ingredientClasses` for every regulated ingredient (`kratom`, `kava`, `hemp_thc`,
     `caffeine`). "Botanical" in catalogue copy means kratom. Compliance depends on this.
   - Never add concentrated 7-OH products (company policy; a test enforces it).
3. Images: save to `public/images/products/<slug>.webp` (transparent background where possible,
   longest side ≤ 900px, ideally under 200 KB) and set `imagePath`.
4. Record discrepancies and open questions in `docs/catalog-data-review.md`.
5. Verify: `npm test` (catalog integrity tests), `npm run db:seed` twice (must be idempotent),
   then check `/catalog` and the product page in the browser.
6. Summarize for the user: products added/changed/archived, and open questions.
