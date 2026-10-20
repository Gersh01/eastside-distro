import 'server-only';
import { and, count, eq, gt, sql } from 'drizzle-orm';
import { optionLabel } from '@/lib/options';
import { getDb } from '@/server/db/client';
import { auditEvents, contactMessages } from '@/server/db/schema';
import { sendEmail } from '@/server/email';
import { env } from '@/server/env';
import { RateLimitedError, type RequestFingerprint } from '@/server/request';
import { CONTACT_TOPICS, type ContactMessageInput } from './schema';

const MAX_MESSAGES_PER_HOUR = 5;

export async function createContactMessage(
  input: ContactMessageInput,
  request: RequestFingerprint,
): Promise<{ id: string }> {
  const db = getDb();

  const [recent] = await db
    .select({ total: count() })
    .from(contactMessages)
    .where(
      and(
        eq(contactMessages.submitterIpHash, request.ipHash),
        gt(contactMessages.createdAt, sql`now() - interval '1 hour'`),
      ),
    );
  if ((recent?.total ?? 0) >= MAX_MESSAGES_PER_HOUR) throw new RateLimitedError();

  const message = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(contactMessages)
      .values({ ...input, submitterIpHash: request.ipHash, userAgent: request.userAgent })
      .returning({ id: contactMessages.id });
    if (!row) throw new Error('Insert returned no row');
    await tx.insert(auditEvents).values({
      actorType: 'visitor',
      action: 'contact_message.submitted',
      entityType: 'contact_message',
      entityId: row.id,
    });
    return row;
  });

  // Saved first; the email to sales is a notification, so failures are logged, not surfaced.
  try {
    const topic = optionLabel(CONTACT_TOPICS, input.topic);
    await sendEmail({
      to: env().SALES_INBOX_EMAIL,
      replyTo: input.email,
      subject: `Website message: ${topic} from ${input.name}`,
      text: [
        `From: ${input.name} <${input.email}>`,
        input.phone ? `Phone: ${input.phone}` : null,
        `Topic: ${topic}`,
        input.productSlug ? `Product: ${env().APP_URL}/products/${input.productSlug}` : null,
        '',
        input.message,
        '',
        `Message ${message.id}. Reply to this email to answer the sender directly.`,
      ]
        .filter((line) => line !== null)
        .join('\n'),
    });
    await db
      .update(contactMessages)
      .set({ notifiedAt: new Date() })
      .where(eq(contactMessages.id, message.id));
  } catch (error) {
    console.error('[contact] notification email failed', { messageId: message.id }, error);
  }

  return message;
}
