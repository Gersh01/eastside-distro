import 'server-only';
import { and, count, eq, gt, sql } from 'drizzle-orm';
import { getDb } from '@/server/db/client';
import { auditEvents, wholesaleApplications } from '@/server/db/schema';
import { sendEmail } from '@/server/email';
import { env } from '@/server/env';
import { RateLimitedError, type RequestFingerprint } from '@/server/request';
import type { WholesaleApplicationInput } from './application-schema';
import { wholesaleApplicationEmail } from './emails';

const MAX_APPLICATIONS_PER_HOUR = 3;

export async function createWholesaleApplication(
  input: WholesaleApplicationInput,
  request: RequestFingerprint,
): Promise<{ id: string }> {
  const db = getDb();

  const [recent] = await db
    .select({ total: count() })
    .from(wholesaleApplications)
    .where(
      and(
        eq(wholesaleApplications.submitterIpHash, request.ipHash),
        gt(wholesaleApplications.createdAt, sql`now() - interval '1 hour'`),
      ),
    );
  if ((recent?.total ?? 0) >= MAX_APPLICATIONS_PER_HOUR) throw new RateLimitedError();

  // The attestation checkbox is validated, not stored: submitting implies it.
  const { attestation, ...answers } = input;
  const application = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(wholesaleApplications)
      .values({ ...answers, submitterIpHash: request.ipHash, userAgent: request.userAgent })
      .returning({ id: wholesaleApplications.id });
    if (!row) throw new Error('Insert returned no row');
    await tx.insert(auditEvents).values({
      actorType: 'visitor',
      action: 'wholesale_application.submitted',
      entityType: 'wholesale_application',
      entityId: row.id,
    });
    return row;
  });

  // The application is already saved; a failed notification must not lose it.
  try {
    await sendEmail(
      wholesaleApplicationEmail({ id: application.id, input, to: env().SALES_INBOX_EMAIL }),
    );
    await db
      .update(wholesaleApplications)
      .set({ notifiedAt: new Date() })
      .where(eq(wholesaleApplications.id, application.id));
  } catch (error) {
    console.error(
      '[wholesale] notification email failed',
      { applicationId: application.id },
      error,
    );
  }

  return application;
}
