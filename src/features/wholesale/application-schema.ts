import { z } from 'zod';
import { STATE_CODES } from '@/domain/us-states';
import {
  email,
  optionalChoice,
  optionalText,
  optionalWholeNumber,
  phone,
  requiredText,
} from '@/lib/validation';
import {
  BUSINESS_TYPE_VALUES,
  FULFILLMENT_METHOD_VALUES,
  GOAL_VALUES,
  NEXT_STEP_VALUES,
  ORDER_FREQUENCY_VALUES,
  PRODUCT_OF_INTEREST_VALUES,
} from './options';

/** Checkbox-group fields (FormData sends them as repeated keys). */
export const WHOLESALE_ARRAY_FIELDS = [
  'businessTypes',
  'productsOfInterest',
  'fulfillmentPreferences',
  'goals',
  'nextSteps',
] as const;

/**
 * Sections 1–9 of the Wholesale Customer Onboarding Sheet. Section 10 ("Eastside follow-up")
 * is staff-only and lives on the application record, not in this public form.
 */
export const wholesaleApplicationSchema = z
  .object({
    // 1. Contact information
    fullName: requiredText('Full name', 120),
    phone: phone(),
    email: email(),
    titleRole: optionalText(80),

    // 2. Business information
    businessName: requiredText('Business name', 160),
    addressLine1: requiredText('Street address', 160),
    addressLine2: optionalText(160),
    city: requiredText('City', 80),
    state: z.enum(STATE_CODES, { error: 'Choose a state' }),
    postalCode: z
      .string({ error: 'ZIP code is required' })
      .trim()
      .regex(/^\d{5}(-\d{4})?$/, 'Enter a 5-digit ZIP code'),
    resaleCertificateNumber: optionalText(60),

    // 3. Business type
    businessTypes: z
      .array(z.enum(BUSINESS_TYPE_VALUES))
      .min(1, 'Choose at least one business type'),
    businessTypeOther: optionalText(80),

    // 4. Business details
    numberOfLocations: optionalWholeNumber('Number of locations', 1, 1000),
    yearsInBusiness: optionalWholeNumber('Years in business', 0, 200),
    currentSuppliers: optionalText(300),

    // 5. Products of interest + 6. Additional product notes
    productsOfInterest: z
      .array(z.enum(PRODUCT_OF_INTEREST_VALUES))
      .min(1, 'Choose at least one product type'),
    productsOfInterestOther: optionalText(120),
    productNotes: optionalText(2000),

    // 7. Purchase plans
    orderFrequency: optionalChoice(ORDER_FREQUENCY_VALUES),
    orderFrequencyOther: optionalText(80),
    estimatedOrderVolume: optionalText(120),
    fulfillmentPreferences: z.array(z.enum(FULFILLMENT_METHOD_VALUES)).default([]),

    // 8. Goals & priorities
    goals: z.array(z.enum(GOAL_VALUES)).default([]),
    goalsOther: optionalText(120),

    // 9. Next steps
    nextSteps: z.array(z.enum(NEXT_STEP_VALUES)).default([]),
    nextStepsOther: optionalText(120),

    attestation: z.literal('on', {
      error: 'Please confirm you are 21 or older and authorized to apply for this business',
    }),
  })
  .superRefine((data, ctx) => {
    const requireOther = (selected: boolean, value: string | undefined, path: string) => {
      if (selected && !value) {
        ctx.addIssue({ code: 'custom', path: [path], message: 'Tell us more about "Other"' });
      }
    };
    requireOther(data.businessTypes.includes('other'), data.businessTypeOther, 'businessTypeOther');
    requireOther(
      data.productsOfInterest.includes('other'),
      data.productsOfInterestOther,
      'productsOfInterestOther',
    );
    requireOther(data.orderFrequency === 'other', data.orderFrequencyOther, 'orderFrequencyOther');
    requireOther(data.goals.includes('other'), data.goalsOther, 'goalsOther');
    requireOther(data.nextSteps.includes('other'), data.nextStepsOther, 'nextStepsOther');
  });

export type WholesaleApplicationInput = z.infer<typeof wholesaleApplicationSchema>;
