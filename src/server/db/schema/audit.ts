import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Append-only record of business-significant actions (submissions, approvals, ID decisions).
 * Never store raw PII in `metadata`; reference entities by id instead.
 */
export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid().primaryKey().defaultRandom(),
    actorType: text().notNull(), // 'system' | 'visitor' | 'customer' | 'staff'
    actorId: text(),
    action: text().notNull(), // e.g. 'wholesale_application.submitted'
    entityType: text().notNull(),
    entityId: text().notNull(),
    metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.entityType, table.entityId), index().on(table.createdAt)],
);
