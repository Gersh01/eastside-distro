import { stateName } from '@/domain/us-states';
import { optionLabel, type Option } from '@/lib/options';
import type { EmailMessage } from '@/server/email';
import type { WholesaleApplicationInput } from './application-schema';
import {
  BUSINESS_TYPES,
  FULFILLMENT_METHODS,
  GOALS,
  NEXT_STEPS,
  ORDER_FREQUENCIES,
  PRODUCTS_OF_INTEREST,
} from './options';

const labels = (options: readonly Option[], values: readonly string[], other?: string) =>
  values
    .map((value) => (value === 'other' && other ? `Other: ${other}` : optionLabel(options, value)))
    .join(', ');

const line = (label: string, value: string | number | undefined) =>
  value === undefined || value === '' ? null : `${label}: ${value}`;

/** Staff notification for a new application, laid out like the paper onboarding sheet. */
export function wholesaleApplicationEmail(params: {
  id: string;
  input: WholesaleApplicationInput;
  to: string;
}): EmailMessage {
  const { id, input, to } = params;
  const sections: [string, (string | null)[]][] = [
    [
      '1. Contact information',
      [
        line('Name', input.fullName),
        line('Phone', input.phone),
        line('Email', input.email),
        line('Title / role', input.titleRole),
      ],
    ],
    [
      '2. Business information',
      [
        line('Business', input.businessName),
        line(
          'Address',
          [
            input.addressLine1,
            input.addressLine2,
            `${input.city}, ${stateName(input.state)} ${input.postalCode}`,
          ]
            .filter(Boolean)
            .join(', '),
        ),
        line('Resale / sales tax license #', input.resaleCertificateNumber),
      ],
    ],
    ['3. Business type', [labels(BUSINESS_TYPES, input.businessTypes, input.businessTypeOther)]],
    [
      '4. Business details',
      [
        line('Locations', input.numberOfLocations),
        line('Years in business', input.yearsInBusiness),
        line('Current suppliers', input.currentSuppliers),
      ],
    ],
    [
      '5. Products of interest',
      [labels(PRODUCTS_OF_INTEREST, input.productsOfInterest, input.productsOfInterestOther)],
    ],
    ['6. Additional product notes', [input.productNotes ?? null]],
    [
      '7. Purchase plans',
      [
        line(
          'Order frequency',
          input.orderFrequency
            ? labels(ORDER_FREQUENCIES, [input.orderFrequency], input.orderFrequencyOther)
            : undefined,
        ),
        line('Estimated order volume', input.estimatedOrderVolume),
        line('Preferred method', labels(FULFILLMENT_METHODS, input.fulfillmentPreferences)),
      ],
    ],
    ['8. Goals & priorities', [labels(GOALS, input.goals, input.goalsOther)]],
    ['9. Next steps', [labels(NEXT_STEPS, input.nextSteps, input.nextStepsOther)]],
  ];

  const body = sections
    .map(([title, lines]) => {
      const content = lines.filter((value): value is string => Boolean(value));
      return [title.toUpperCase(), ...(content.length ? content : ['—'])].join('\n');
    })
    .join('\n\n');

  return {
    to,
    replyTo: input.email,
    subject: `Wholesale application: ${input.businessName} (${input.city}, ${input.state})`,
    text: `New wholesale application ${id}\n\n${body}\n`,
  };
}
