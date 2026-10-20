import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BUSINESS } from '@/domain/business';
import { getProduct } from '@/features/catalog/queries';
import { ContactForm } from '@/features/contact/components/contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Questions about products, pricing or an order? Send East Side Distro a message.',
};

export default function ContactPage({ searchParams }: PageProps<'/contact'>) {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
      <header>
        <p className="label-mono">Contact</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight">Talk to a rep.</h1>
        <p className="mt-4 text-lg text-muted">
          Product questions, pricing, samples or an existing order: send a message and our team
          replies within one business day.
        </p>
        <dl className="mt-10 grid gap-6">
          <div>
            <dt className="label-mono">Sales</dt>
            <dd className="mt-1">
              <a href={`mailto:${BUSINESS.salesEmail}`} className="font-semibold underline">
                {BUSINESS.salesEmail}
              </a>
            </dd>
          </div>
          <div>
            <dt className="label-mono">Warehouse &amp; pickup</dt>
            <dd className="mt-1">
              {BUSINESS.address.street}
              <br />
              {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.postalCode}
            </dd>
          </div>
        </dl>
      </header>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-mist" />}>
        <ContactFormForRequest searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** Pre-fills the form when linked from a product page (`/contact?product=<slug>`). */
async function ContactFormForRequest({
  searchParams,
}: Pick<PageProps<'/contact'>, 'searchParams'>) {
  const { product: slug } = await searchParams;
  const product = typeof slug === 'string' ? await getProduct(slug) : null;
  return <ContactForm product={product ? { slug: product.slug, name: product.name } : null} />;
}
