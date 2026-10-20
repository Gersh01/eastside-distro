'use server';

import { z } from 'zod';
import { HONEYPOT_FIELD, formDataToValues, type FormState } from '@/lib/form';
import { RateLimitedError, getRequestFingerprint } from '@/server/request';
import { WHOLESALE_ARRAY_FIELDS, wholesaleApplicationSchema } from './application-schema';
import { createWholesaleApplication } from './service';

const SUBMITTED: FormState = {
  status: 'success',
  message:
    'Thanks! Your application is in. We review applications the same business day and will reach out with pricing.',
};

export async function submitWholesaleApplication(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formDataToValues(formData, WHOLESALE_ARRAY_FIELDS);
  // Bots that fill the honeypot get a normal-looking success and nothing is stored.
  if (values[HONEYPOT_FIELD]) return SUBMITTED;

  const parsed = wholesaleApplicationSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please fix the highlighted fields and submit again.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  try {
    await createWholesaleApplication(parsed.data, await getRequestFingerprint());
  } catch (error) {
    const message =
      error instanceof RateLimitedError
        ? 'We received several applications from your network in the last hour. Please email sales@eastsidedistro.com instead.'
        : 'Something went wrong on our side. Please try again, or email sales@eastsidedistro.com.';
    if (!(error instanceof RateLimitedError)) {
      console.error('[wholesale] could not save application', error);
    }
    return { status: 'error', message, fieldErrors: {}, values };
  }

  return SUBMITTED;
}
