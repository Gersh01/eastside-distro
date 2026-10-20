import type { Metadata } from 'next';
import { BUSINESS } from '@/domain/business';
import { WholesaleApplicationForm } from '@/features/wholesale/components/wholesale-application-form';

export const metadata: Metadata = {
  title: 'Apply for wholesale',
  description:
    'Open a wholesale account with East Side Distro: kava, botanicals and functional beverages for bars, shops and distributors.',
};

export default function WholesalePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="max-w-3xl">
        <p className="label-mono">Wholesale customer onboarding</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight">Supply. Grow. Partner.</h1>
        <p className="mt-4 text-lg text-muted">
          Tell us about your business and what you’d like to stock. We review every application the
          same business day and send pricing, samples or a call, whichever you prefer. Prefer email?
          Write to{' '}
          <a href={`mailto:${BUSINESS.salesEmail}`} className="font-semibold text-ink underline">
            {BUSINESS.salesEmail}
          </a>
          .
        </p>
      </header>
      <div className="mt-12">
        <WholesaleApplicationForm />
      </div>
    </div>
  );
}
