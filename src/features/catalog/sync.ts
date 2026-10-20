import { and, eq, notInArray, sql, type SQL } from 'drizzle-orm';
import type { Database } from '@/server/db/client';
import { categories, priceLists, productVariants, products } from '@/server/db/schema';
import { CATEGORIES } from './categories';
import { CATALOG } from './data/products';
import type { ProductSeed } from './types';

export const PRICE_LISTS = [
  { code: 'retail', name: 'Retail' },
  { code: 'wholesale', name: 'Wholesale' },
];

export type CatalogSyncResult = {
  categories: number;
  products: number;
  variants: number;
  archivedProducts: number;
};

/**
 * Upsert the code-defined catalog into Postgres. Idempotent: `npm run db:seed` runs it locally
 * and ECS runs it at boot (RUN_CATALOG_SYNC_ON_BOOT). Products and variants removed from code
 * are archived, never deleted, because orders will reference them.
 */
export async function syncCatalog(
  db: Database,
  catalog: ProductSeed[] = CATALOG,
): Promise<CatalogSyncResult> {
  return db.transaction(async (tx) => {
    const categoryRows = await tx
      .insert(categories)
      .values(
        CATEGORIES.map((category, index) => ({
          slug: category.slug,
          name: category.name,
          description: category.description,
          sortOrder: index + 1,
        })),
      )
      .onConflictDoUpdate({
        target: categories.slug,
        set: excluded(['name', 'description', 'sortOrder']),
      })
      .returning({ id: categories.id, slug: categories.slug });
    const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));

    await tx
      .insert(priceLists)
      .values(PRICE_LISTS)
      .onConflictDoNothing({ target: priceLists.code });

    let variantCount = 0;
    for (const [index, product] of catalog.entries()) {
      const categoryId = categoryIds.get(product.category);
      if (!categoryId) throw new Error(`Unknown category "${product.category}" on ${product.slug}`);

      const { slug, ...fields } = {
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        categoryId,
        tagline: product.tagline,
        details: product.details,
        specs: product.specs,
        orderUnit: product.orderUnit,
        optionLabel: product.optionLabel,
        optionValues: product.optionValues,
        ingredientClasses: product.ingredientClasses,
        status: product.status ?? 'active',
        quoteOnly: product.quoteOnly ?? false,
        imagePath: product.imagePath,
        catalogPage: product.catalogPage,
        sortOrder: index + 1,
      };
      const [row] = await tx
        .insert(products)
        .values({ slug, ...fields })
        .onConflictDoUpdate({ target: products.slug, set: { ...fields, updatedAt: new Date() } })
        .returning({ id: products.id });
      if (!row) throw new Error(`Upsert returned no row for ${slug}`);

      const skus = product.variants.map((variant) => variant.sku);
      await tx
        .insert(productVariants)
        .values(
          product.variants.map((variant, variantIndex) => ({
            productId: row.id,
            sku: variant.sku,
            name: variant.name,
            flavor: variant.flavor ?? null,
            strain: variant.strain ?? null,
            strength: variant.strength ?? null,
            size: variant.size ?? null,
            form: variant.form ?? null,
            packLabel: variant.packLabel,
            unitsPerPack: variant.unitsPerPack,
            status: variant.status,
            sortOrder: variantIndex + 1,
          })),
        )
        .onConflictDoUpdate({
          target: productVariants.sku,
          set: excluded([
            'productId',
            'name',
            'flavor',
            'strain',
            'strength',
            'size',
            'form',
            'packLabel',
            'unitsPerPack',
            'status',
            'sortOrder',
          ]),
        });
      await tx
        .update(productVariants)
        .set({ status: 'archived' })
        .where(and(eq(productVariants.productId, row.id), notInArray(productVariants.sku, skus)));
      variantCount += skus.length;
    }

    const archived = await tx
      .update(products)
      .set({ status: 'archived' })
      .where(
        notInArray(
          products.slug,
          catalog.map((product) => product.slug),
        ),
      )
      .returning({ id: products.id });

    return {
      categories: categoryRows.length,
      products: catalog.length,
      variants: variantCount,
      archivedProducts: archived.length,
    };
  });
}

/**
 * `SET column = excluded.column` for multi-row upserts. Column names follow the snake_case
 * casing configured in src/server/db/client.ts. Also bumps updated_at.
 */
function excluded(columns: string[]): Record<string, SQL> {
  const set: Record<string, SQL> = { updatedAt: sql`now()` };
  for (const column of columns) {
    set[column] = sql.raw(`excluded.${column.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)}`);
  }
  return set;
}
