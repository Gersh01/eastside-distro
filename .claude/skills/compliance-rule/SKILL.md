---
name: compliance-rule
description: Add, change or retire a legal or company-policy rule about where or to whom kratom, kava, hemp THC or caffeine products can be sold (state bans, age limits, federal changes such as the Dec 11, 2026 hemp THC cap). Use when laws change or counsel reviews the rule list.
argument-hint: <jurisdiction and change, e.g. "Michigan bans kratom from 2027-01-01">
---

# Update a compliance rule

Rules live in `src/features/compliance/rules.ts` and are evaluated by `evaluate.ts` on every
availability check. The engine **fails closed**: any matching prohibition blocks the sale, and
`needs_review` rules are enforced until counsel confirms or removes them.

## Steps

1. Research the change and collect **primary sources** where possible (statute, agency order,
   Federal Register). Secondary sources are acceptable only with `verification: 'needs_review'`.
2. Edit `rules.ts`: one rule per jurisdiction and effect, with `effectiveFrom` (inclusive) and
   `effectiveUntil` (exclusive) as `YYYY-MM-DD` in Eastern time, `basis`, `summary`, `sources`.
   Repeals are an `effectiveUntil`, never a deleted rule (history matters for audits).
3. Add tests in `evaluate.test.ts` for the day before and the day the rule takes effect.
4. Update `docs/compliance.md` (the state table and the change log at the bottom).
5. Run `npm test`, then check an affected product page: the availability box must match.
6. Tell the user what changed and that it is not legal advice; flag anything for counsel.

Never relax a rule (remove a ban, lower an age) without the user confirming counsel approved it.
