import 'server-only';
import { z } from 'zod';

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().min(1).optional(),
    PGHOST: z.string().min(1).optional(),
    APP_URL: z.url().default('http://localhost:3000'),
    EMAIL_DRIVER: z.enum(['log', 'ses']).default('log'),
    EMAIL_FROM: z.string().min(3).default('East Side Distro <no-reply@eastsidedistro.com>'),
    SALES_INBOX_EMAIL: z.email().default('sales@eastsidedistro.com'),
    AWS_REGION: z.string().min(1).optional(),
    IP_HASH_SECRET: z.string().min(16, 'IP_HASH_SECRET must be at least 16 characters'),
  })
  .refine((value) => value.DATABASE_URL || value.PGHOST, {
    message: 'Set DATABASE_URL (local) or the PG* variables (AWS)',
    path: ['DATABASE_URL'],
  })
  .refine((value) => value.EMAIL_DRIVER !== 'ses' || value.AWS_REGION, {
    message: 'AWS_REGION is required when EMAIL_DRIVER=ses',
    path: ['AWS_REGION'],
  });

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/**
 * Validated server environment. Parsed lazily on first use so `next build` never needs
 * runtime secrets; a misconfigured server fails on the first request that needs them.
 */
export function env(): Env {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
    }
    cached = parsed.data;
  }
  return cached;
}
