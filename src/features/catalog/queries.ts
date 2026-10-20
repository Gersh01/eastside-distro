import 'server-only';
import { and, asc, count, eq, inArray } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import type { IngredientClass } from '@/domain/ingredients';
import { pageCount } from '@/lib/pagination';
import { getDb } from '@/server/db/client';
import { categories, products } from '@/server/db/schema';
import type { CategorySlug } from './categories';
import type { ProductStatus, VariantStatus } from './types';

export const CATALOG_PAGE_SIZE = 12;
/** Invalidate with updateTag(CATALOG_CACHE_TAG) after any catalog write. */
export const CATALOG_CACHE_TAG = 'catalog';

const LISTED_STATUSES = ['active', 'coming_soon'] as const;
type ListedStatus = (typeof LISTED_STATUSES)[number];

export type ProductSummary = {
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  tagline: string;
  headline: string | null;
  ingredientClasses: IngredientClass[];
  optionLabel: string;
  optionCount: number;
  imagePath: string | null;
  status: ListedStatus;
  quoteOnly: boolean;
};

export type VariantSummary = {
  sku: string;
  name: string;
  flavor: string | null;
  strain: string | null;
  strength: string | null;
  size: string | null;
  form: string | null;
  packLabel: string;
  unitsPerPack: number;
  status: VariantStatus;
};

export type ProductDetail = ProductSummary & {
  details: string[];
  specs: string;
  orderUnit: string;
  optionValues: string[];
  catalogPage: string | null;
  variants: VariantSummary[];
};

export type CatalogPage = {
  items: ProductSummary[];
  total: number;
  page: number;
  pageCount: number;
  categoryCounts: Partial<Record<CategorySlug, number>>;
};

const summaryColumns = {
  slug: products.slug,
  name: products.name,
  brand: products.brand,
  categorySlug: categories.slug,
  categoryName: categories.name,
  tagline: products.tagline,
  details: products.details,
  ingredientClasses: products.ingredientClasses,
  optionLabel: products.optionLabel,
  optionValues: products.optionValues,
  imagePath: products.imagePath,
  status: products.status,
  quoteOnly: products.quoteOnly,
};

type SummaryRow = {
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  tagline: string;
  details: string[];
  ingredientClasses: IngredientClass[];
  optionLabel: string;
  optionValues: string[];
  imagePath: string | null;
  status: ProductStatus;
  quoteOnly: boolean;
};

function toSummary(row: SummaryRow): ProductSummary {
  return {
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    categorySlug: row.categorySlug,
    categoryName: row.categoryName,
    tagline: row.tagline,
    headline: row.details[0] ?? null,
    ingredientClasses: row.ingredientClasses,
    optionLabel: row.optionLabel,
    optionCount: row.optionValues.length,
    imagePath: row.imagePath,
    status: row.status as ListedStatus,
    quoteOnly: row.quoteOnly,
  };
}

/** One page of listed products, optionally filtered to a category, plus per-category counts. */
export async function getCatalogPage(
  category: CategorySlug | null,
  page: number,
): Promise<CatalogPage> {
  'use cache';
  cacheLife('hours');
  cacheTag(CATALOG_CACHE_TAG);

  const db = getDb();
  const listed = inArray(products.status, [...LISTED_STATUSES]);
  const where = category ? and(listed, eq(categories.slug, category)) : listed;

  const [countRows, rows] = await Promise.all([
    db
      .select({ slug: categories.slug, total: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(listed)
      .groupBy(categories.slug),
    db
      .select(summaryColumns)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(asc(categories.sortOrder), asc(products.sortOrder))
      .limit(CATALOG_PAGE_SIZE)
      .offset((page - 1) * CATALOG_PAGE_SIZE),
  ]);

  const categoryCounts = Object.fromEntries(
    countRows.map((row) => [row.slug, row.total]),
  ) as CatalogPage['categoryCounts'];
  const total = category
    ? (categoryCounts[category] ?? 0)
    : countRows.reduce((sum, row) => sum + row.total, 0);

  return {
    items: rows.map(toSummary),
    total,
    page,
    pageCount: pageCount(total, CATALOG_PAGE_SIZE),
    categoryCounts,
  };
}

/** A listed product with its non-archived variants, or null. */
export async function getProduct(slug: string): Promise<ProductDetail | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CATALOG_CACHE_TAG);

  const product = await getDb().query.products.findFirst({
    where: (table, { and, eq, inArray }) =>
      and(eq(table.slug, slug), inArray(table.status, [...LISTED_STATUSES])),
    with: {
      category: true,
      variants: {
        where: (variant, { ne }) => ne(variant.status, 'archived'),
        orderBy: (variant, { asc }) => [asc(variant.sortOrder)],
      },
    },
  });
  if (!product) return null;

  return {
    ...toSummary({
      ...product,
      categorySlug: product.category.slug,
      categoryName: product.category.name,
    }),
    details: product.details,
    specs: product.specs,
    orderUnit: product.orderUnit,
    optionValues: product.optionValues,
    catalogPage: product.catalogPage,
    variants: product.variants.map((variant) => ({
      sku: variant.sku,
      name: variant.name,
      flavor: variant.flavor,
      strain: variant.strain,
      strength: variant.strength,
      size: variant.size,
      form: variant.form,
      packLabel: variant.packLabel,
      unitsPerPack: variant.unitsPerPack,
      status: variant.status,
    })),
  };
}
