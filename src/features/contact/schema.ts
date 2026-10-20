import { z } from 'zod';
import { optionValues, type Option } from '@/lib/options';
import { email, optionalText, requiredText } from '@/lib/validation';

export const CONTACT_TOPICS = [
  { value: 'general', label: 'General question' },
  { value: 'wholesale', label: 'Wholesale & pricing' },
  { value: 'product', label: 'Product question' },
  { value: 'order', label: 'An existing order' },
  { value: 'other', label: 'Something else' },
] as const satisfies readonly Option[];

export const contactMessageSchema = z.object({
  name: requiredText('Name', 120),
  email: email(),
  phone: optionalText(30),
  topic: z.enum(optionValues(CONTACT_TOPICS), { error: 'Choose a topic' }),
  message: requiredText('Message', 5000).min(10, 'Tell us a little more (10 characters minimum)'),
  productSlug: optionalText(120),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
