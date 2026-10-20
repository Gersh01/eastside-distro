import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './columns';

export const contactMessageStatus = pgEnum('contact_message_status', ['new', 'replied', 'closed']);

export const contactMessages = pgTable(
  'contact_messages',
  {
    id: uuid().primaryKey().defaultRandom(),
    status: contactMessageStatus().notNull().default('new'),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    topic: text().notNull(),
    message: text().notNull(),
    // Optional product the visitor asked about (product slug).
    productSlug: text(),
    submitterIpHash: text(),
    userAgent: text(),
    notifiedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index().on(table.status, table.createdAt),
    index().on(table.submitterIpHash, table.createdAt),
  ],
);
