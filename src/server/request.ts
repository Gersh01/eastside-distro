import 'server-only';
import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';
import { env } from './env';

export type RequestFingerprint = {
  /** Keyed hash of the client IP: lets us rate-limit without storing addresses. */
  ipHash: string;
  userAgent: string | null;
};

export async function getRequestFingerprint(): Promise<RequestFingerprint> {
  const requestHeaders = await headers();
  // The AWS load balancer appends the address it saw as the LAST X-Forwarded-For entry;
  // earlier entries are client-supplied and can be spoofed.
  const forwarded = requestHeaders
    .get('x-forwarded-for')
    ?.split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const ip = forwarded?.at(-1) ?? requestHeaders.get('x-real-ip') ?? 'unknown';
  return {
    ipHash: hashIp(ip),
    userAgent: requestHeaders.get('user-agent')?.slice(0, 300) ?? null,
  };
}

export function hashIp(ip: string): string {
  return createHmac('sha256', env().IP_HASH_SECRET).update(ip).digest('hex').slice(0, 32);
}

export class RateLimitedError extends Error {
  constructor() {
    super('Too many submissions from this address');
    this.name = 'RateLimitedError';
  }
}
