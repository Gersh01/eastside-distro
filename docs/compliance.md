# Compliance

> Research snapshot from **October 19, 2026**, mostly from secondary sources. This is engineering
> guidance, not legal advice. Have counsel review the rules before launch and whenever they change.

## How the site enforces rules

- Rules are code: `src/features/compliance/rules.ts`. Each rule has an ingredient class, a
  jurisdiction, an effect (`prohibited` or `minimum_age`), effective dates, a basis, a
  verification status and sources. `evaluate.ts` applies them, and tests pin the behavior on both
  sides of every effective date.
- **Fail closed:** any matching prohibition blocks the sale, and `needs_review` rules are
  enforced until counsel confirms or removes them.
- Every product declares its `ingredientClasses` (`kratom`, `kava`, `hemp_thc`, `caffeine`). A
  kava + kratom shot follows the kratom rules.
- Product pages show availability for today's date (Eastern time) and warn about dated changes
  coming up. Checkout (Phase 3) must call `evaluate()` for the shipping state, or FL for pickup,
  and record the result on the order.

## Company policies

| Policy                                                                                            | Where enforced                                    |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Every buyer must be **21+** with an approved government ID                                        | `COMPANY_MINIMUM_AGE`; ID review (Phase 1)        |
| **No concentrated 7-OH products**                                                                 | Catalog test fails if any product mentions 7-OH   |
| **Hemp THC sold only for Florida delivery or Orlando pickup** until counsel approves other states | Rule `hemp-thc-florida-only`                      |
| No disease or treatment claims in copy; FDA disclaimer on every page                              | Copy review (`compliance-reviewer` agent); footer |

## Kratom

| State         | Status in the rules      | Effective            | Notes                                             |
| ------------- | ------------------------ | -------------------- | ------------------------------------------------- |
| Alabama       | Prohibited               | in force             | Schedule I                                        |
| Arkansas      | Prohibited               | in force             | Schedule I                                        |
| Connecticut   | Prohibited               | in force (2026)      | Scheduled with derivatives incl. 7-OH             |
| Indiana       | Prohibited               | in force             |                                                   |
| Kansas        | Prohibited               | 2026-07-01           | HB 2365                                           |
| Louisiana     | Prohibited               | 2025-08-01           |                                                   |
| Massachusetts | Prohibited               | 2026-08-28           | DPH emergency order, under court challenge        |
| North Dakota  | Prohibited (fail closed) | in force             | Emergency restrictions Aug 2026; sources conflict |
| Tennessee     | Prohibited               | 2026-07-01           | HB1649                                            |
| Vermont       | Prohibited               | in force             |                                                   |
| Wisconsin     | Prohibited               | in force             | Schedule I                                        |
| Rhode Island  | Allowed again            | ban ended 2026-04-01 | First state to reverse a ban                      |
| Florida       | Allowed, **21+**         | in force             | 7-OH is Schedule I by emergency rule (Aug 2025)   |
| Michigan      | Allowed (watch)          | —                    | HB 5537 would ban kratom; not encoded             |

**Not handled yet:** city and county bans (for example, some counties and cities restrict kratom
even where the state allows it). These need address-level checks at checkout; see the roadmap.

**Federal:** reports in October 2026 say the DEA plans to schedule concentrated 7-OH. Leaf kratom
is not federally scheduled. Company policy already excludes 7-OH products.

## Hemp-derived THC

- The federal redefinition of hemp caps total THC at **0.4 mg per container**. It was delayed from
  November 12 to **December 11, 2026** by H.R. 6500 (signed September 2, 2026). Some sources say
  synthetic or converted cannabinoids lose hemp status on November 12. The catalogue's Oracle
  Organix 10 and 50 Hemp Derived seltzers (10 mg and 50 mg Δ9 THC per can) exceed the cap. The
  rules block them everywhere from 2026-12-11, and product pages already warn about the date.
- **Action:** decide with counsel whether to archive these listings before December 11 (set
  `status: 'archived'` in `products.ts`) or keep them as display-only with no ordering.

## Kava and caffeine

No state restrictions are encoded. Every purchase still requires 21+ (company policy).

## Payments and providers

- **Stripe** lists "substances designed to mimic illegal drugs, including kava" as prohibited, and
  restricts CBD/THC. Plan on a high-risk merchant account (for example through Authorize.net or
  NMI) behind the payment adapter. See [decisions/0006](decisions/0006-payments-gateway-adapter.md).
- Confirm the acceptable-use terms of every provider before go-live: payment gateway, SES
  (production access request), and shipping carriers for kratom.

## Sources

- Hemp THC: [Hemp Law Group](https://www.hemplawgroup.com/news/federal-hemp-ban-2026-where-things-stand) ·
  [Cannabis Law Blog](https://www.cannabis-law-blog.com/federal-intoxicating-hemp-ban-changes-pushed-back-until-december-11-2026/) ·
  [Foley Hoag](https://foleyhoag.com/news-and-insights/blogs/cannabis-and-the-law/2026/september/a-temporary-reprieve-for-hemp-thc-products%E2%80%A6-but-what-now/)
- Kratom states: [quick.md tracker](https://www.quick.md/quick-tips/kratom-ban-update/) ·
  [Restoration Recovery](https://restoration-recovery.com/resources/kratom-laws-by-state-2026.html) ·
  [Karma Card Payments](https://karmacardpayments.com/blog/kratom-laws-by-state-payment-compliance/)
- Florida: [Florida Phoenix on the 7-OH emergency rule](https://floridaphoenix.com/2025/08/13/florida-ag-issues-emergency-rule-banning-kratom-compound/) ·
  [Florida kratom law summary](https://floridacourtrules.com/florida-kratom-law/)
- Stripe: [Restricted businesses list](https://stripe.com/legal/restricted-businesses)

## Change log

| Date       | Change                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 2026-10-19 | Initial rule set: 12 state kratom rules, Florida 21+, hemp THC Florida-only + federal cap from 2026-12-11. All `needs_review`. |
