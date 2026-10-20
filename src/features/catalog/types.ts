import type { IngredientClass } from '@/domain/ingredients';
import type { CategorySlug } from './categories';

export type ProductStatus = 'active' | 'coming_soon' | 'draft' | 'archived';
export type VariantStatus = 'active' | 'coming_soon' | 'archived';

/** A sellable SKU as defined in code (src/features/catalog/data). */
export type VariantSeed = {
  sku: string;
  name: string;
  flavor?: string;
  strain?: string;
  strength?: string;
  size?: string;
  form?: string;
  packLabel: string;
  unitsPerPack: number;
  status: VariantStatus;
};

/** A product as defined in code. Copy is taken from the 2026 wholesale catalogue. */
export type ProductSeed = {
  slug: string;
  /** SKU prefix, unique per product. */
  code: string;
  name: string;
  brand: string;
  category: CategorySlug;
  tagline: string;
  details: string[];
  specs: string;
  orderUnit: string;
  ingredientClasses: IngredientClass[];
  optionLabel: string;
  optionValues: string[];
  variants: VariantSeed[];
  imagePath: string | null;
  /** Page in the printed catalogue, e.g. "02" or "09A". */
  catalogPage: string;
  status?: ProductStatus;
  quoteOnly?: boolean;
};
