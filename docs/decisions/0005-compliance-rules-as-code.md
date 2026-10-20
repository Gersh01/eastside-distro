# 0005. Compliance rules as code, failing closed

- Status: Accepted
- Date: 2026-10-19

## Context

Kratom bans differ by state and change with effective dates (for example Tennessee and Kansas on
2026-07-01, Rhode Island repealing on 2026-04-01). Hemp THC loses federal status on 2026-12-11.
Selling into a banned state is a legal risk for the business.

## Decision

Rules are data in `src/features/compliance/rules.ts`, keyed by ingredient class, jurisdiction and
effective dates, with a basis, a verification status and sources. `evaluate()` blocks a sale if any
prohibition matches (fail closed); `needs_review` rules are enforced. Dates are business dates in
Eastern time. Tests cover each rule on both sides of its dates.

## Consequences

- Auditable: the rule, its sources, and git history show why a sale was allowed or blocked.
  Orders will snapshot the evaluated rules.
- Changes ship by deploy (minutes) and need a reviewed PR (`compliance-rule` skill).
- State-level only for now; city/county bans need address-level checks (roadmap).

## Alternatives considered

- **Hard-coded state list in checkout:** no dates, no sources, easy to miss in other code paths.
- **Admin-editable rules in the database:** more flexible, but loses review and tests. Revisit if
  rules change weekly.
