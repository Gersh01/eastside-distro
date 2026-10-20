/**
 * Catalogue sections, in the order of the printed catalogue's contents page.
 * Code is the source of truth; `syncCatalog` upserts these into the `categories` table.
 */
export const CATEGORIES = [
  {
    slug: 'rtd-seltzer',
    name: 'RTD Seltzer',
    description: 'Ready-to-drink botanical, kava and hemp-derived seltzers. Zero alcohol.',
    heroImage: 'oracle-organix-45',
  },
  {
    slug: 'rtd-energy',
    name: 'RTD Energy',
    description: 'Functional energy seltzers with lion’s mane and cordyceps. No kratom.',
    heroImage: 'odyssey-222',
  },
  {
    slug: 'rtd-yerba-mate',
    name: 'RTD Yerba Mate',
    description: 'Organic and adaptogen yerba mate for clean, jitter-free caffeine.',
    heroImage: 'sir-inkwells-yerba-mate',
  },
  {
    slug: 'shots',
    name: 'Shots',
    description: 'Botanical and kava extract shots built for the register.',
    heroImage: 'donuts-gold-shot',
  },
  {
    slug: 'raw-goods',
    name: 'Raw Goods',
    description: 'Bulk botanical powder and leaf, kava root and instant kava by the kilo.',
    heroImage: 'kava-powder',
  },
  {
    slug: 'retail',
    name: 'Retail',
    description: 'Shelf-ready pouches and white-label packaging under your brand.',
    heroImage: 'civil-botanicals-pouch',
  },
  {
    slug: 'extracts',
    name: 'Extracts',
    description: 'Liquid and powder extracts for building a signature menu.',
    heroImage: 'botanical-powder-extract',
  },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategorySlug = Category['slug'];

export function findCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}
