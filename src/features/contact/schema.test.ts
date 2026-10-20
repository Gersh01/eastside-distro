import { describe, expect, it } from 'vitest';
import { contactMessageSchema } from './schema';

const valid = {
  name: 'Sam Lee',
  email: 'sam@example.com',
  phone: '',
  topic: 'product',
  message: 'Do you carry Kava Joy in 375 mL?',
  productSlug: 'kava-joy-750ml',
};

describe('contactMessageSchema', () => {
  it('accepts a valid message', () => {
    const result = contactMessageSchema.parse(valid);
    expect(result.phone).toBeUndefined();
    expect(result.productSlug).toBe('kava-joy-750ml');
  });

  it('rejects short messages, unknown topics and bad emails', () => {
    const result = contactMessageSchema.safeParse({
      ...valid,
      email: 'not-an-email',
      topic: 'complaint',
      message: 'hi',
    });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((issue) => issue.path.join('.'));
    expect(paths).toEqual(expect.arrayContaining(['email', 'topic', 'message']));
  });
});
