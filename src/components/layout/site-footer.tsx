import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';
import { BUSINESS } from '@/domain/business';

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="size-9" />
            <span className="text-lg font-semibold">East Side Distro</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/70">
            Wholesale kava, kratom, botanicals and functional beverages. Orlando, Florida ·
            nationwide distribution.
          </p>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/catalog" className="text-white/80 hover:text-white">
                Catalogue
              </Link>
            </li>
            <li>
              <Link href="/wholesale" className="text-white/80 hover:text-white">
                Apply for wholesale
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-white/80 hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase">
            Visit &amp; contact
          </p>
          <address className="mt-4 space-y-2 text-sm text-white/80 not-italic">
            <p>
              <a href={`mailto:${BUSINESS.salesEmail}`} className="hover:text-white">
                {BUSINESS.salesEmail}
              </a>
            </p>
            <p>
              {BUSINESS.address.street}
              <br />
              {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.postalCode}
            </p>
          </address>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-xs text-white/50 sm:px-6">
          <p>
            You must be 21 or older to purchase. Products are not available in all states, and
            availability is checked against your shipping address.
          </p>
          <p>
            These statements have not been evaluated by the Food and Drug Administration. These
            products are not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </div>
    </footer>
  );
}
