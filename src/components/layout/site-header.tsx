import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';
import { buttonClasses } from '@/components/ui/button';

const NAV = [
  { href: '/catalog', label: 'Catalogue' },
  { href: '/wholesale', label: 'Wholesale' },
  { href: '/contact', label: 'Contact' },
] as const;

export function SiteHeader() {
  return (
    <header className="bg-ink text-white">
      <div className="border-b border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-2 text-center text-xs text-white/70 sm:px-6">
          21+ only · Lab tested every batch · Ships in 1–3 days from Orlando, FL
        </p>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="East Side Distro home">
          <LogoMark className="size-9" />
          <span className="text-lg font-semibold tracking-tight">East Side Distro</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 text-sm md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-white/80 hover:text-white">
              {item.label}
            </Link>
          ))}
          <Link href="/wholesale" className={buttonClasses('lime')}>
            Apply for wholesale
          </Link>
        </nav>

        {/* No-JS mobile menu. */}
        <details className="group relative md:hidden">
          <summary className="cursor-pointer list-none rounded-full border border-white/30 px-4 py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute right-0 z-20 mt-3 flex w-56 flex-col gap-1 rounded-2xl bg-white p-2 text-ink shadow-xl"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-mist"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
