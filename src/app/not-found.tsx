import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start px-4 py-24 sm:px-6">
      <p className="label-mono">404</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">We couldn’t find that page.</h1>
      <p className="mt-3 text-muted">
        The product may have moved or been retired. The catalogue has everything we carry.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/catalog" className={buttonClasses('ink', 'lg')}>
          Browse the catalogue
        </Link>
        <Link href="/contact" className={buttonClasses('outline', 'lg')}>
          Contact us
        </Link>
      </div>
    </div>
  );
}
