import { connection } from 'next/server';
import type { IngredientClass } from '@/domain/ingredients';
import { STATE_CODES, stateName } from '@/domain/us-states';
import {
  businessDate,
  evaluate,
  restrictedStates,
  upcomingRestrictions,
} from '@/features/compliance/evaluate';

/**
 * Where the product can be sold, per the compliance rules in force today. Rendered per request
 * (`connection()`), because the answer changes on rule effective dates.
 */
export async function ProductAvailability({
  ingredients,
}: {
  ingredients: readonly IngredientClass[];
}) {
  await connection();
  const today = businessDate();
  const restricted = restrictedStates(ingredients, today);
  const allowed = STATE_CODES.filter((state) => !restricted.includes(state));
  const { minimumAge } = evaluate(ingredients, 'FL', today);
  const upcoming = upcomingRestrictions(ingredients, today);

  let reach: string;
  if (allowed.length === 0) {
    reach = 'Not available for sale.';
  } else if (restricted.length === 0) {
    reach = 'Ships to all 50 states and DC, or pick up in Orlando.';
  } else if (allowed.length <= 5) {
    reach = `Available only in ${allowed.map(stateName).join(', ')} (delivery or Orlando pickup).`;
  } else {
    reach = `Can’t ship to ${restricted.map(stateName).join(', ')}.`;
  }

  return (
    <section aria-labelledby="availability-heading" className="rounded-2xl bg-sand p-5">
      <h2 id="availability-heading" className="label-mono">
        Availability
      </h2>
      <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm">
        <li>{minimumAge}+ only. A verified ID is required before your first order.</li>
        <li>{reach}</li>
        {upcoming.map((rule) => (
          <li key={rule.id}>
            From {formatDate(rule.effectiveFrom)}:{' '}
            {rule.jurisdiction.state
              ? `no longer sold in ${stateName(rule.jurisdiction.state)}.`
              : rule.basis === 'federal_law'
                ? 'no longer sold anywhere under federal law.'
                : 'no longer sold online.'}
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(isoDate: string | undefined) {
  if (!isoDate) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function ProductAvailabilitySkeleton() {
  return <div className="h-28 animate-pulse rounded-2xl bg-sand" aria-hidden />;
}
