import { z } from 'zod';

// Shared zod building blocks for form schemas. Inputs arrive as strings from FormData.

export const requiredText = (label: string, max: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

/** Optional free text: blank becomes undefined. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .optional()
    .transform((value) => value || undefined);

export const email = () =>
  z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email address').max(254));

export const phone = () =>
  z
    .string({ error: 'Phone is required' })
    .trim()
    .regex(/^[+()\d.\-\s]{7,25}$/, 'Enter a valid phone number')
    .refine((value) => value.replace(/\D/g, '').length >= 10, 'Enter a 10-digit phone number');

/** Optional whole number from a text/number input: blank becomes undefined. */
export const optionalWholeNumber = (label: string, min: number, max: number) =>
  z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? undefined : Number(value)),
    z
      .number({ error: `${label} must be a number` })
      .int(`${label} must be a whole number`)
      .min(min, `${label} must be at least ${min}`)
      .max(max, `${label} must be at most ${max}`)
      .optional(),
  );

/** Optional single choice (radio/select): blank becomes undefined. */
export const optionalChoice = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), z.enum(values).optional());
