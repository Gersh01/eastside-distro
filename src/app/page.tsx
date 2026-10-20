import Image from 'next/image';
import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';
import { buttonClasses } from '@/components/ui/button';
import { BUSINESS } from '@/domain/business';
import { CATEGORIES } from '@/features/catalog/categories';

const STEPS = [
  {
    title: 'Apply online',
    body: 'Tell us about your business in about five minutes. No account needed to apply.',
  },
  {
    title: 'We confirm same day',
    body: 'We review applications and send pricing within the business day.',
  },
  { title: 'Pay your way', body: 'Card, ACH or check. Net 15 / Net 30 for repeat accounts.' },
  {
    title: 'Ships in 1–3 days',
    body: 'UPS or FedEx with tracking. Same-day delivery in Florida, or pick up in Orlando.',
  },
];

const LAB_POINTS = [
  {
    title: 'Third-party verified',
    body: 'Identity, heavy metals and microbials, on every lot, before it reaches your shelf.',
  },
  {
    title: 'Certificates on request',
    body: 'Ask your rep for the COA on any batch you carry. Same day.',
  },
  { title: 'Sourced direct', body: 'Kratom and kava bought at origin, not through brokers.' },
  { title: 'Consistent lot to lot', body: 'The reason a regular gets the same drink twice.' },
];

const FAQ = [
  {
    q: 'What are botanicals?',
    a: 'A leaf from a Southeast Asian tree, brewed as tea or extracted into drinks. Vein colour tells you when it was picked: green balanced, white brighter, red heavier. It gives a bar a caffeine-free option and gives a shop a category with repeat traffic.',
  },
  {
    q: 'What is MIT?',
    a: 'Mitragynine, the active compound. When a can says 45mg MIT, that’s the dose. Higher number, stronger product, and a reason to stock more than one strength for the same customer.',
  },
  {
    q: 'What is kava?',
    a: 'A Pacific Island root, traditionally drunk socially. Calming rather than stimulating. It’s the reason kava bars exist, and the easiest thing to put in the hand of a guest who isn’t drinking.',
  },
  {
    q: 'What is yerba mate?',
    a: 'A caffeinated South American leaf, like tea. Clean lift, no kratom or kava in it. It covers the customer who wants energy without a botanical, so you don’t lose the sale.',
  },
  {
    q: 'What are adaptogens?',
    a: 'Ashwagandha, reishi, ginseng: added alongside caffeine for balance. This is what the label-reading wellness shopper is looking for.',
  },
  {
    q: 'What is lion’s mane?',
    a: 'A functional mushroom. Not psychoactive, not kratom. It’s why the Odyssey line sells to people who’d never buy a kratom drink.',
  },
  {
    q: 'What is hemp derived?',
    a: 'A hemp-derived cannabinoid, regulated separately from kratom and kava. Federal hemp rules change on December 11, 2026, so talk to your rep about compliance before you stock it.',
  },
  {
    q: 'What does lab tested mean?',
    a: 'Every batch is checked by a third-party lab for identity, heavy metals and microbials. It’s what lets you answer a customer’s question with a document instead of a shrug.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1.3fr_1fr] md:items-center md:py-28">
          <div>
            <LogoMark className="size-16" />
            <h1 className="mt-8 text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
              Wholesale Kava &amp; Botanicals.
            </h1>
            <p className="mt-5 text-lg text-white/70">
              Orlando, Florida. Lab tested. Shipped in 1–3 days.
            </p>
            <p className="mt-2 font-semibold text-lime italic">
              Kava · Kratom · Botanicals · Beverages
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/catalog" className={buttonClasses('lime', 'lg')}>
                Browse the catalogue
              </Link>
              <Link href="/wholesale" className={buttonClasses('outline-light', 'lg')}>
                Apply for wholesale
              </Link>
            </div>
          </div>
          <div className="relative hidden aspect-square overflow-hidden rounded-[2rem] bg-ink-soft md:block">
            <Image
              src="/images/products/white-rabbit.webp"
              alt="White Rabbit seltzer cans"
              fill
              preload
              sizes="(min-width: 768px) 28rem, 0px"
              className="object-contain p-10"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="label-mono">Contents</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight">Every product, by category.</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/catalog/${category.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl bg-mist transition-colors hover:bg-line"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={`/images/products/${category.heroImage}.webp`}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 16rem, (min-width: 640px) 45vw, 90vw"
                    className="object-contain p-6 transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 pt-0">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="mt-1 text-sm text-muted">{category.description}</p>
                </div>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/catalog"
              className="flex h-full min-h-48 flex-col justify-end rounded-3xl bg-lime p-5 font-semibold"
            >
              See all products →
            </Link>
          </li>
        </ul>
      </section>

      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-4xl font-semibold tracking-tight">How to order.</h2>
          <p className="mt-2 text-muted italic">Four steps. That’s it.</p>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2">
            {STEPS.map((step, index) => (
              <li key={step.title} className="border-t-2 border-ink pt-4">
                <p className="label-mono">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
                <p className="mt-1 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight">Lab tested. Every batch.</h2>
          <p className="mt-2 text-muted italic">
            Pure ingredients. Premium formulas. Proof on request.
          </p>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            {LAB_POINTS.map((point) => (
              <div key={point.title}>
                <dt className="font-semibold">{point.title}</dt>
                <dd className="mt-1 text-sm text-muted">{point.body}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="text-4xl font-semibold tracking-tight">Plain answers.</h2>
          <p className="mt-2 text-muted italic">
            What the ingredients are, and why anyone should care.
          </p>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden
                    className="text-muted transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-ink p-10 text-white md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <LogoMark className="size-12 shrink-0" />
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Ready to stock?</h2>
              <p className="mt-1 text-white/70">
                Sales: {BUSINESS.salesEmail} · {BUSINESS.address.street}, {BUSINESS.address.city},{' '}
                {BUSINESS.address.state} {BUSINESS.address.postalCode}
              </p>
            </div>
          </div>
          <Link href="/wholesale" className={buttonClasses('lime', 'lg')}>
            Apply for wholesale
          </Link>
        </div>
      </section>
    </>
  );
}
