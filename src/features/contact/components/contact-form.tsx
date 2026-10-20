'use client';

import { useActionState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Honeypot, SelectField, TextArea, TextField } from '@/components/ui/form-fields';
import { FormStatus } from '@/components/ui/form-status';
import { HONEYPOT_FIELD, IDLE_FORM_STATE } from '@/lib/form';
import { sendContactMessage } from '../actions';
import { CONTACT_TOPICS } from '../schema';

export function ContactForm({ product }: { product: { slug: string; name: string } | null }) {
  const [state, formAction, pending] = useActionState(sendContactMessage, IDLE_FORM_STATE);

  if (state.status === 'success') return <FormStatus state={state} />;

  const errors = state.status === 'error' ? state.fieldErrors : {};
  const values = state.status === 'error' ? state.values : {};
  const text = (name: string) => {
    const value = values[name];
    return typeof value === 'string' ? value : undefined;
  };

  return (
    <form action={formAction} className="relative flex flex-col gap-5">
      <FormStatus state={state} />
      <Honeypot name={HONEYPOT_FIELD} />
      {product ? (
        <>
          <input type="hidden" name="productSlug" value={product.slug} />
          <p className="rounded-xl bg-sand px-4 py-3 text-sm">
            Asking about <span className="font-semibold">{product.name}</span>
          </p>
        </>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="name"
          label="Name"
          required
          autoComplete="name"
          defaultValue={text('name')}
          error={errors.name}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          defaultValue={text('email')}
          error={errors.email}
        />
        <TextField
          name="phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          defaultValue={text('phone')}
          error={errors.phone}
        />
        <SelectField
          name="topic"
          label="Topic"
          required
          options={CONTACT_TOPICS}
          defaultValue={text('topic') ?? (product ? 'product' : undefined)}
          error={errors.topic}
        />
      </div>
      <TextArea
        name="message"
        label="Message"
        required
        rows={6}
        maxLength={5000}
        defaultValue={text('message')}
        error={errors.message}
      />
      <div>
        <button type="submit" disabled={pending} className={buttonClasses('ink', 'lg')}>
          {pending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
