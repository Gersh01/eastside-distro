import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

type Tone = 'outline' | 'ink' | 'lime';

const TONES: Record<Tone, string> = {
  outline: 'border border-line bg-white text-ink',
  ink: 'bg-ink text-white',
  lime: 'bg-lime text-ink',
};

export function Badge({ children, tone = 'outline' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
