import type { IngredientClass } from '@/domain/ingredients';
import type { StateCode } from '@/domain/us-states';

export type ComplianceRule = {
  id: string;
  ingredient: IngredientClass;
  /** Omit `state` for a nationwide rule; `exceptStates` carves states out of a nationwide rule. */
  jurisdiction: { state?: StateCode; exceptStates?: StateCode[] };
  effect: { type: 'prohibited' } | { type: 'minimum_age'; age: number };
  /** Inclusive start (YYYY-MM-DD, Eastern time). Omit when already in force for years. */
  effectiveFrom?: string;
  /** Exclusive end (YYYY-MM-DD), e.g. when a ban is repealed. */
  effectiveUntil?: string;
  basis: 'federal_law' | 'state_law' | 'emergency_rule' | 'company_policy';
  /** `needs_review` rules are still enforced (fail closed) until counsel confirms or removes them. */
  verification: 'verified' | 'needs_review';
  summary: string;
  sources: string[];
};

const KRATOM_STATE_SOURCES = [
  'https://www.quick.md/quick-tips/kratom-ban-update/',
  'https://restoration-recovery.com/resources/kratom-laws-by-state-2026.html',
  'https://karmacardpayments.com/blog/kratom-laws-by-state-payment-compliance/',
];

const kratomBan = (
  state: StateCode,
  summary: string,
  extra: Partial<ComplianceRule> = {},
): ComplianceRule => ({
  id: `kratom-prohibited-${state.toLowerCase()}`,
  ingredient: 'kratom',
  jurisdiction: { state },
  effect: { type: 'prohibited' },
  basis: 'state_law',
  verification: 'needs_review',
  summary,
  sources: KRATOM_STATE_SOURCES,
  ...extra,
});

/**
 * Shipping and sale restrictions, researched October 2026 from secondary sources.
 * Every rule is `needs_review` until counsel signs off (see docs/compliance.md).
 * Update with the `compliance-rule` skill (.claude/skills/compliance-rule): always add tests.
 */
export const COMPLIANCE_RULES: ComplianceRule[] = [
  // ── Kratom: state prohibitions ───────────────────────────────────────────────
  kratomBan('AL', 'Alabama lists kratom alkaloids as Schedule I.'),
  kratomBan('AR', 'Arkansas lists kratom alkaloids as Schedule I.'),
  kratomBan('CT', 'Connecticut scheduled kratom and its derivatives, including 7-OH, in 2026.'),
  kratomBan('IN', 'Indiana lists kratom alkaloids as synthetic drugs.'),
  kratomBan('KS', 'Kansas HB 2365 adds kratom-related substances to Schedule I.', {
    effectiveFrom: '2026-07-01',
  }),
  kratomBan('LA', 'Louisiana prohibits kratom.', { effectiveFrom: '2025-08-01' }),
  kratomBan(
    'MA',
    'Massachusetts DPH emergency order placed kratom in Schedule I (under court challenge).',
    { effectiveFrom: '2026-08-28', basis: 'emergency_rule' },
  ),
  kratomBan(
    'ND',
    'North Dakota emergency restrictions (August 2026); sources conflict on scope, so treated as a ban.',
    { basis: 'emergency_rule' },
  ),
  kratomBan('TN', 'Tennessee HB1649 prohibits all kratom products.', {
    effectiveFrom: '2026-07-01',
  }),
  kratomBan('VT', 'Vermont regulates kratom alkaloids as regulated drugs.'),
  kratomBan('WI', 'Wisconsin lists kratom alkaloids as Schedule I.'),
  kratomBan('RI', 'Rhode Island Department of Health ban, reversed effective April 1, 2026.', {
    effectiveUntil: '2026-04-01',
  }),

  // ── Kratom: age ───────────────────────────────────────────────────────────────
  {
    id: 'kratom-minimum-age-fl',
    ingredient: 'kratom',
    jurisdiction: { state: 'FL' },
    effect: { type: 'minimum_age', age: 21 },
    basis: 'state_law',
    verification: 'needs_review',
    summary: 'Florida prohibits selling kratom products to anyone under 21.',
    sources: ['https://floridacourtrules.com/florida-kratom-law/'],
  },

  // ── Hemp-derived THC ─────────────────────────────────────────────────────────
  {
    id: 'hemp-thc-federal-redefinition',
    ingredient: 'hemp_thc',
    jurisdiction: {},
    effect: { type: 'prohibited' },
    effectiveFrom: '2026-12-11',
    basis: 'federal_law',
    verification: 'needs_review',
    summary:
      'The federal hemp redefinition caps total THC at 0.4mg per container. It was delayed from Nov 12 to Dec 11, 2026 by H.R. 6500 (signed Sept 2, 2026). Every hemp THC product in the catalogue exceeds the cap.',
    sources: [
      'https://www.hemplawgroup.com/news/federal-hemp-ban-2026-where-things-stand',
      'https://www.cannabis-law-blog.com/federal-intoxicating-hemp-ban-changes-pushed-back-until-december-11-2026/',
      'https://foleyhoag.com/news-and-insights/blogs/cannabis-and-the-law/2026/september/a-temporary-reprieve-for-hemp-thc-products%E2%80%A6-but-what-now/',
    ],
  },
  {
    id: 'hemp-thc-florida-only',
    ingredient: 'hemp_thc',
    jurisdiction: { exceptStates: ['FL'] },
    effect: { type: 'prohibited' },
    basis: 'company_policy',
    verification: 'needs_review',
    summary:
      'State hemp-THC laws vary widely and change often. Until counsel approves specific states, hemp THC is sold only for Florida delivery or Orlando pickup.',
    sources: ['https://www.hemplawgroup.com/news/federal-hemp-ban-2026-where-things-stand'],
  },
];
