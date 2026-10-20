import Link from 'next/link';
import { cx } from '@/lib/cx';
import { pageWindow } from '@/lib/pagination';

type Props = {
  page: number;
  pageCount: number;
  /** Base path; page N links to `${basePath}?page=N` (page 1 links to the bare path). */
  basePath: string;
};

export function Pagination({ page, pageCount, basePath }: Props) {
  if (pageCount <= 1) return null;
  const href = (target: number) => (target === 1 ? basePath : `${basePath}?page=${target}`);
  const linkClass =
    'inline-flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-colors';

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cx(linkClass, 'w-auto px-4 hover:bg-mist')}>
          ← Previous
        </Link>
      ) : null}
      <ol className="flex items-center gap-1">
        {pageWindow(page, pageCount).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={href(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={cx(linkClass, item === page ? 'bg-ink text-white' : 'hover:bg-mist')}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ol>
      {page < pageCount ? (
        <Link href={href(page + 1)} className={cx(linkClass, 'w-auto px-4 hover:bg-mist')}>
          Next →
        </Link>
      ) : null}
    </nav>
  );
}
