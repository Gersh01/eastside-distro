import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ProductSummary } from '../queries';
import { IngredientBadges } from './ingredient-badges';

/** `eager` for cards in the first row, so the largest above-the-fold image isn't lazy-loaded. */
export function ProductCard({
  product,
  eager = false,
}: {
  product: ProductSummary;
  eager?: boolean;
}) {
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-mist">
        {product.imagePath ? (
          <Image
            src={product.imagePath}
            alt=""
            fill
            loading={eager ? 'eager' : 'lazy'}
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
            className="object-contain p-8 transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : null}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.status === 'coming_soon' ? <Badge tone="ink">Coming soon</Badge> : null}
          {product.quoteOnly ? <Badge tone="lime">Quote only</Badge> : null}
        </div>
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="label-mono">{product.categoryName}</p>
        <h3 className="mt-1 text-lg leading-snug font-semibold">
          <Link
            href={`/products/${product.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted italic">{product.tagline}</p>
        {product.headline ? <p className="mt-3 text-sm">{product.headline}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <IngredientBadges ingredients={product.ingredientClasses} />
          <span className="ml-1 text-xs text-muted">
            {product.optionCount} {product.optionLabel.toLowerCase()}
          </span>
        </div>
      </div>
    </article>
  );
}
