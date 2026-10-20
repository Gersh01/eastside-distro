import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { CATEGORIES } from './categories';
import { CATALOG } from './data/products';
import { optionCode } from './sku';

describe('catalog data', () => {
  it('has unique product slugs, SKU prefixes and SKUs', () => {
    const unique = (values: string[]) => new Set(values).size === values.length;
    expect(unique(CATALOG.map((product) => product.slug))).toBe(true);
    expect(unique(CATALOG.map((product) => product.code))).toBe(true);
    expect(unique(CATALOG.flatMap((product) => product.variants.map((v) => v.sku)))).toBe(true);
  });

  it('puts every product in a known category with at least one variant', () => {
    const slugs = new Set<string>(CATEGORIES.map((category) => category.slug));
    for (const product of CATALOG) {
      expect(slugs.has(product.category), product.slug).toBe(true);
      expect(product.variants.length, product.slug).toBeGreaterThan(0);
      expect(product.ingredientClasses.length, product.slug).toBeGreaterThan(0);
      for (const variant of product.variants) {
        expect(variant.sku.startsWith(`${product.code}-`), variant.sku).toBe(true);
        expect(variant.unitsPerPack, variant.sku).toBeGreaterThan(0);
      }
    }
  });

  it('has an image file for every product image path', () => {
    for (const product of CATALOG) {
      if (!product.imagePath) continue;
      const file = path.join(process.cwd(), 'public', product.imagePath);
      expect(existsSync(file), `${product.slug}: ${product.imagePath}`).toBe(true);
    }
  });

  it('declares kratom on every product whose copy mentions botanical extract or MIT', () => {
    for (const product of CATALOG) {
      const copy = [product.specs, ...product.details].join(' ').toLowerCase();
      if (/botanical (extract|powder|leaf|liquid)|kratom|\bmit\b/.test(copy)) {
        expect(product.ingredientClasses, product.slug).toContain('kratom');
      }
    }
  });

  it('never lists concentrated 7-OH products (company policy, see docs/compliance.md)', () => {
    for (const product of CATALOG) {
      const copy = [product.name, product.tagline, product.specs, ...product.details].join(' ');
      expect(copy, product.slug).not.toMatch(/7-?OH|7-hydroxymitragynine/i);
    }
  });
});

describe('optionCode', () => {
  it('abbreviates option labels', () => {
    expect(optionCode('Mango Passion Fruit')).toBe('MANPASFRU');
    expect(optionCode('Watermelon')).toBe('WATERM');
    expect(optionCode('Piña Colada')).toBe('PINCOL');
    expect(optionCode('Meyer Lemon & Mint')).toBe('MEYLEMMIN');
  });

  it('rejects labels without letters or digits', () => {
    expect(() => optionCode(' & ')).toThrow();
  });
});
