'use client';

import { useEffect, useRef } from 'react';
import type { FormState } from '@/lib/form';

/** Announces the result of a form submission and moves focus to it so it is not missed. */
export function FormStatus({ state }: { state: FormState }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== 'idle') ref.current?.focus();
  }, [state]);

  if (state.status === 'idle') return null;
  const isError = state.status === 'error';
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role={isError ? 'alert' : 'status'}
      className={
        isError
          ? 'rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger focus:outline-none'
          : 'rounded-2xl bg-lime p-6 text-ink focus:outline-none'
      }
    >
      {isError ? null : <p className="text-lg font-semibold">Received.</p>}
      <p className={isError ? undefined : 'mt-1'}>{state.message}</p>
    </div>
  );
}
