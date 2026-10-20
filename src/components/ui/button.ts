import { cx } from '@/lib/cx';

type Variant = 'lime' | 'ink' | 'outline' | 'outline-light';
type Size = 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  lime: 'bg-lime text-ink hover:bg-lime-strong',
  ink: 'bg-ink text-white hover:bg-ink-soft',
  outline: 'border border-ink/20 text-ink hover:border-ink',
  'outline-light': 'border border-white/30 text-white hover:border-white',
};

const SIZES: Record<Size, string> = {
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

/** Class names for buttons and button-styled links, so both share one look. */
export function buttonClasses(variant: Variant = 'ink', size: Size = 'md', className?: string) {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}
