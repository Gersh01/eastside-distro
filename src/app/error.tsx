'use client'; // Error boundaries must be Client Components.

import { useEffect } from 'react';
import { buttonClasses } from '@/components/ui/button';

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && 'digest' in error ? String(error.digest) : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start px-4 py-24 sm:px-6">
      <p className="label-mono">Error</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Something went wrong.</h1>
      <p className="mt-3 text-muted">
        Please try again. If it keeps happening, email sales@eastsidedistro.com
        {digest ? ` and mention reference ${digest}` : ''}.
      </p>
      <button type="button" onClick={() => retry()} className={buttonClasses('ink', 'lg', 'mt-8')}>
        Try again
      </button>
    </div>
  );
}
