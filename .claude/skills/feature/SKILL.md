---
name: feature
description: Build or extend a feature of the East Side Distro site end to end (spec → schema → server → UI → tests → docs). Use for roadmap items such as sign-up with ID verification, cart/checkout, admin queues, or any new page or form.
argument-hint: <roadmap item or feature name>
---

# Build a feature

Follow these steps in order. Each one ends with something you can check.

1. **Find or write the spec.** Look in `docs/features/` and `docs/roadmap.md` for the item.
   If there is no spec, write `docs/features/<name>.md` first (goal, user flows, data, rules,
   acceptance criteria, open questions) and confirm open questions with the user before coding
   anything they would answer differently.

2. **Read the current docs for this Next.js version** before writing framework code:
   `node_modules/next/dist/docs/` (Cache Components is on; see CLAUDE.md "Rendering rules").

3. **Data model.** If tables or columns change, follow the `db-change` skill. Keep money in
   integer cents, timestamps with time zone, option codes as text arrays.

4. **Server logic** in `src/features/<feature>/`:
   - `schema.ts`: zod schema shared by the form and the action.
   - `service.ts` (`import 'server-only'`): database writes in a transaction, an `audit_events`
     row for business-significant actions, emails after the write (failures logged, not thrown).
   - `actions.ts` (`'use server'`): parse FormData → validate → **authorize** → call the service →
     return a `FormState`. Re-check the session and role inside every action.
   - Compliance: anything a customer can buy or receive must pass
     `src/features/compliance/evaluate.ts` on the server (destination state, date, age).

5. **UI**: Server Components by default; client components only for interactivity
   (`useActionState` forms). DB reads go inside `<Suspense>` or a `'use cache'` function that
   receives request values as arguments. Reuse `src/components/ui/*`.

6. **Tests**: unit tests next to the code (`*.test.ts`, Vitest) for schemas, rules and pure
   logic; a Playwright spec in `e2e/` for each user-visible flow.

7. **Verify**: `npm run check`, `npm run build`, and `npm run e2e` (needs the local database:
   `npm run db:setup`). For infra changes also `npm --prefix infra test` and
   `npm --prefix infra run synth`.

8. **Docs**: tick the item in `docs/roadmap.md`, update the spec's status, `docs/data-model.md`
   if tables changed, and add an ADR in `docs/decisions/` if you made a lasting technical choice.
   For features touching identity documents, PII, payments or compliance, run the
   `security-reviewer` and `compliance-reviewer` agents on the diff before finishing.
