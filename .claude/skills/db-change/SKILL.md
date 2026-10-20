---
name: db-change
description: Change the Postgres schema safely (add/alter tables, columns, indexes, enums) with a Drizzle migration that is safe for rolling deploys. Use whenever src/server/db/schema changes.
---

# Change the database schema

Production applies migrations at container boot while old tasks are still serving traffic
(rolling deploy). Every migration must work with **both** the old and the new code.

## Steps

1. Edit the table definitions in `src/server/db/schema/*.ts` (one file per domain; export new
   files from `schema/index.ts`). Columns are camelCase in TS and become snake_case in SQL.
2. Generate the migration: `npm run db:generate -- --name <short_description>`.
3. **Read the generated SQL** in `drizzle/` and check it against the rules below. If drizzle-kit
   asks about renames, answer carefully: a rename it misreads becomes drop + add (data loss).
4. Apply locally: `npm run db:migrate`, then `npm run db:seed` if catalog tables changed.
5. Run `npm run check` and the affected e2e specs.
6. Update `docs/data-model.md` (tables and the ER diagram).

## Rules (expand → migrate → contract)

- **Add** columns as nullable or with a default. Backfill in a later migration if needed.
- **Never rename or drop** a column or table that deployed code still reads. Instead: add the
  new column, ship code that writes both and reads the new one, then drop the old column in a
  later release.
- New enum values: add them (`ALTER TYPE … ADD VALUE`); never remove values in the same release
  that stops using them.
- Large tables: create indexes `CONCURRENTLY` in a hand-written migration
  (`npx drizzle-kit generate --custom --name <name>`).
- **Never edit a committed migration** (`drizzle/*.sql`) or anything in `drizzle/meta/`; a hook
  blocks it. If a committed migration is wrong, write a new one that fixes it.
- Money is integer cents. Timestamps use `timestamp({ withTimezone: true })`.
- Personal data (ID images, DOB, addresses) needs a retention plan; note it in the feature spec.
