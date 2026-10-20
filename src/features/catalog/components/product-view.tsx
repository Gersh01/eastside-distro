import Image from 'next/image';
import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import type { ProductDetail } from '../queries';
import { IngredientBadges } from './ingredient-badges';
import { ProductAvailability, ProductAvailabilitySkeleton } from './product-availability';

export function ProductView({ product }: { product: ProductDetail }) {
  const activeVariants = product.variants.filter((variant) => variant.status !== 'archived');

  return (
    <article className="flex flex-col gap-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/catalog" className="hover:text-ink">
          Catalogue
        </Link>
        <span aria-hidden> / </span>
        <Link href={`/catalog/${product.categorySlug}`} className="hover:text-ink">
          {product.categoryName}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <header>
            <p className="label-mono">
              {product.brand} · {product.categoryName}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-lg text-muted italic">{product.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.status === 'coming_soon' ? <Badge tone="ink">Coming soon</Badge> : null}
              {product.quoteOnly ? <Badge tone="lime">Quote only</Badge> : null}
              <IngredientBadges ingredients={product.ingredientClasses} />
            </div>
          </header>

          <dl className="grid gap-5">
            <Fact label="Details">
              {product.details.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </Fact>
            <Fact label="Product specs">{product.specs}</Fact>
            <Fact label="Order unit">{product.orderUnit}</Fact>
          </dl>

          <div className="border-t border-line pt-6">
            <p className="label-mono">{product.optionLabel}</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm font-semibold">
              {product.optionValues.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </div>

          <Suspense fallback={<ProductAvailabilitySkeleton />}>
            <ProductAvailability ingredients={product.ingredientClasses} />
          </Suspense>

          <div className="flex flex-wrap gap-3">
            <Link href="/wholesale" className={buttonClasses('lime', 'lg')}>
              {product.quoteOnly ? 'Request a quote' : 'Get wholesale pricing'}
            </Link>
            <Link
              href={`/contact?product=${product.slug}`}
              className={buttonClasses('outline', 'lg')}
            >
              Ask about this product
            </Link>
          </div>
        </div>

        <div className="relative order-first aspect-square overflow-hidden rounded-[2rem] bg-mist lg:order-none lg:aspect-auto lg:min-h-[36rem]">
          {product.imagePath ? (
            <Image
              src={product.imagePath}
              alt={product.name}
              fill
              preload
              sizes="(min-width: 1024px) 40rem, 100vw"
              className="object-contain p-10"
            />
          ) : null}
        </div>
      </div>

      <section aria-labelledby="order-options" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="order-options" className="text-2xl font-semibold tracking-tight">
            Order options
          </h2>
          <p className="text-sm text-muted">
            Pricing is shared with approved wholesale accounts. Online checkout is coming soon.
          </p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-sand">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Option
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Pack
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  SKU
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {activeVariants.map((variant) => (
                <tr key={variant.sku} className="border-t border-line">
                  <td className="px-4 py-3">
                    {[variant.strength, variant.flavor, variant.strain, variant.form, variant.size]
                      .filter(Boolean)
                      .join(' · ')}
                    {variant.status === 'coming_soon' ? (
                      <span className="ml-2 text-xs text-muted">(coming soon)</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{variant.packLabel}</td>
                  <td className="px-4 py-3 font-mono text-xs">{variant.sku}</td>
                  <td className="px-4 py-3 text-muted">On request</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted">
          Lab tested every batch: identity, heavy metals and microbials. Ask your rep for the
          certificate of analysis on any lot.
        </p>
      </section>
    </article>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="label-mono">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-4">
        <div className="h-4 w-40 animate-pulse rounded bg-mist" />
        <div className="h-12 w-3/4 animate-pulse rounded bg-mist" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-mist" />
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-mist" />
      </div>
      <div className="aspect-square animate-pulse rounded-[2rem] bg-mist" />
    </div>
  );
}
