import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
} from 'drizzle-orm/pg-core';
// Relative import: drizzle-kit loads this file without the `@/` path alias.
import { INGREDIENT_CLASSES } from '../../../domain/ingredients';
import { timestamps } from './columns';

export const productStatus = pgEnum('product_status', [
  'active',
  'coming_soon',
  'draft',
  'archived',
]);
export const variantStatus = pgEnum('variant_status', ['active', 'coming_soon', 'archived']);
export const ingredientClass = pgEnum('ingredient_class', INGREDIENT_CLASSES);

export const categories = pgTable('categories', {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  description: text().notNull(),
  sortOrder: integer().notNull().default(0),
  ...timestamps,
});

export const products = pgTable(
  'products',
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    brand: text().notNull(),
    categoryId: uuid()
      .notNull()
      .references(() => categories.id),
    tagline: text().notNull(),
    // Lines from the catalogue's DETAILS block, e.g. "12 fl oz can · 45mg · 1 serving per can".
    details: text()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    specs: text().notNull(),
    orderUnit: text().notNull(),
    // How the option list is labelled on the product page ("Flavors", "Strains", ...).
    optionLabel: text().notNull(),
    optionValues: text()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    ingredientClasses: ingredientClass().array().notNull(),
    status: productStatus().notNull().default('active'),
    // Sold by quote only (e.g. white-label service): no add-to-cart, "contact sales" instead.
    quoteOnly: boolean().notNull().default(false),
    imagePath: text(),
    // Page in the printed catalogue this product came from (for cross-checking).
    catalogPage: text(),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [index().on(table.categoryId, table.sortOrder), index().on(table.status)],
);

/** One sellable SKU: a flavor/strain/size/strength/form combination in a specific pack. */
export const productVariants = pgTable(
  'product_variants',
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => products.id),
    sku: text().notNull().unique(),
    name: text().notNull(),
    flavor: text(),
    strain: text(),
    strength: text(),
    size: text(),
    form: text(),
    packLabel: text().notNull(),
    unitsPerPack: integer().notNull().default(1),
    status: variantStatus().notNull().default('active'),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [index().on(table.productId, table.sortOrder)],
);

/** Named price lists: `retail`, `wholesale`, and later per-account tiers. */
export const priceLists = pgTable('price_lists', {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique(),
  name: text().notNull(),
  currency: text().notNull().default('USD'),
  ...timestamps,
});

/** Price of a variant on a price list, with optional quantity breaks. Money is always integer cents. */
export const variantPrices = pgTable(
  'variant_prices',
  {
    variantId: uuid()
      .notNull()
      .references(() => productVariants.id),
    priceListId: uuid()
      .notNull()
      .references(() => priceLists.id),
    minQuantity: integer().notNull().default(1),
    amountCents: integer().notNull(),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.variantId, table.priceListId, table.minQuantity] })],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  prices: many(variantPrices),
}));

export const priceListsRelations = relations(priceLists, ({ many }) => ({
  prices: many(variantPrices),
}));

export const variantPricesRelations = relations(variantPrices, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantPrices.variantId],
    references: [productVariants.id],
  }),
  priceList: one(priceLists, { fields: [variantPrices.priceListId], references: [priceLists.id] }),
}));
