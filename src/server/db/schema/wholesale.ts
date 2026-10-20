import { date, index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './columns';

export const wholesaleApplicationStatus = pgEnum('wholesale_application_status', [
  'submitted',
  'in_review',
  'approved',
  'rejected',
]);

/**
 * The paper "Wholesale Customer Onboarding Sheet", one column group per section.
 * Multi-choice answers are stored as option codes (see src/features/wholesale/options.ts)
 * in text arrays so new options never need a migration.
 */
export const wholesaleApplications = pgTable(
  'wholesale_applications',
  {
    id: uuid().primaryKey().defaultRandom(),
    status: wholesaleApplicationStatus().notNull().default('submitted'),

    // 1. Contact information
    fullName: text().notNull(),
    phone: text().notNull(),
    email: text().notNull(),
    titleRole: text(),

    // 2. Business information
    businessName: text().notNull(),
    addressLine1: text().notNull(),
    addressLine2: text(),
    city: text().notNull(),
    state: text().notNull(),
    postalCode: text().notNull(),
    resaleCertificateNumber: text(),

    // 3. Business type
    businessTypes: text().array().notNull(),
    businessTypeOther: text(),

    // 4. Business details
    numberOfLocations: integer(),
    yearsInBusiness: integer(),
    currentSuppliers: text(),

    // 5. Products of interest + 6. Additional product notes
    productsOfInterest: text().array().notNull(),
    productsOfInterestOther: text(),
    productNotes: text(),

    // 7. Purchase plans
    orderFrequency: text(),
    orderFrequencyOther: text(),
    estimatedOrderVolume: text(),
    fulfillmentPreferences: text().array().notNull(),

    // 8. Goals & priorities
    goals: text().array().notNull(),
    goalsOther: text(),

    // 9. Next steps
    nextSteps: text().array().notNull(),
    nextStepsOther: text(),

    // 10. Eastside follow-up (internal use, staff only)
    followUpDate: date({ mode: 'string' }),
    assignedTo: text(),
    internalNotes: text(),

    // Submission metadata. IPs are stored only as keyed hashes (rate limiting).
    source: text().notNull().default('web'),
    submitterIpHash: text(),
    userAgent: text(),
    notifiedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index().on(table.status, table.createdAt),
    index().on(table.email),
    index().on(table.submitterIpHash, table.createdAt),
  ],
);
