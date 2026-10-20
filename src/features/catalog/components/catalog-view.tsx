import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';
import { cx } from '@/lib/cx';
import { CATEGORIES, findCategory, type CategorySlug } from '../categories';
import { getCatalogPage } from '../queries';
import { ProductCard } from './product-card';

/** Category tabs, product grid and pagination for /catalog and /catalog/[category]. */
export async function CatalogView({
  category,
  page,
}: {
  category: CategorySlug | null;
  page: number;
}) {
  const data = await getCatalogPage(category, page);
  const current = category ? findCategory(category) : undefined;
  const basePath = category ? `/catalog/${category}` : '/catalog';
  const allCount = Object.values(data.categoryCounts).reduce((sum, value) => sum + (value ?? 0), 0);

  return (
    <div className="flex flex-col gap-10">
      <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-2 pb-1">
          <CategoryTab href="/catalog" active={category === null} label="All" count={allCount} />
          {CATEGORIES.map((item) => (
            <CategoryTab
              key={item.slug}
              href={`/catalog/${item.slug}`}
              active={item.slug === category}
              label={item.name}
              count={data.categoryCounts[item.slug] ?? 0}
            />
          ))}
        </ul>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {current?.name ?? 'All products'}
          </h2>
          <p className="mt-1 text-muted">{current?.description ?? 'Every product, by category.'}</p>
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {data.total} {data.total === 1 ? 'product' : 'products'} · page {data.page} of{' '}
          {data.pageCount}
        </p>
      </div>

      {data.items.length > 0 ? (
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((product, index) => (
            <li key={product.slug} className="flex">
              <ProductCard product={product} eager={index < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-3xl bg-sand p-10 text-center">
          <p className="font-semibold">No products on this page.</p>
          <Link href={basePath} className="mt-2 inline-block text-sm underline">
            Back to the first page
          </Link>
        </div>
      )}

      <Pagination page={data.page} pageCount={data.pageCount} basePath={basePath} />
    </div>
  );
}

function CategoryTab({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <li className="shrink-0">
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cx(
          'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
          active ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink/40',
        )}
      >
        {label}
        <span className={cx('text-xs', active ? 'text-white/60' : 'text-muted')}>{count}</span>
      </Link>
    </li>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-label="Loading products">
      <div className="flex gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-10 w-28 animate-pulse rounded-full bg-mist" />
        ))}
      </div>
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <div className="aspect-[4/5] animate-pulse rounded-3xl bg-mist" />
            <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-mist" />
            <div className="mt-2 h-5 w-2/3 animate-pulse rounded bg-mist" />
          </div>
        ))}
      </div>
    </div>
  );
}
