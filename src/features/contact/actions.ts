'use server';

import { z } from 'zod';
import { HONEYPOT_FIELD, formDataToValues, type FormState } from '@/lib/form';
import { RateLimitedError, getRequestFingerprint } from '@/server/request';
import { contactMessageSchema } from './schema';
import { createContactMessage } from './service';

const SENT: FormState = {
  status: 'success',
  message: 'Message sent. Our team replies within one business day.',
};

export async function sendContactMessage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formDataToValues(formData);
  if (values[HONEYPOT_FIELD]) return SENT;

  const parsed = contactMessageSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please fix the highlighted fields and send again.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  try {
    await createContactMessage(parsed.data, await getRequestFingerprint());
  } catch (error) {
    const message =
      error instanceof RateLimitedError
        ? 'You have sent several messages in the last hour. Please email sales@eastsidedistro.com directly.'
        : 'Something went wrong on our side. Please try again, or email sales@eastsidedistro.com.';
    if (!(error instanceof RateLimitedError))
      console.error('[contact] could not save message', error);
    return { status: 'error', message, fieldErrors: {}, values };
  }

  return SENT;
}
