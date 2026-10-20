import { describe, expect, it } from 'vitest';
import { STATE_CODES } from '@/domain/us-states';
import {
  COMPANY_MINIMUM_AGE,
  businessDate,
  evaluate,
  isSellableAnywhere,
  restrictedStates,
  upcomingRestrictions,
} from './evaluate';
import { COMPLIANCE_RULES } from './rules';

const TODAY = '2026-10-19';

describe('evaluate', () => {
  it('allows kratom to Florida with a 21+ minimum age', () => {
    const verdict = evaluate(['kratom'], 'FL', TODAY);
    expect(verdict.allowed).toBe(true);
    expect(verdict.minimumAge).toBe(21);
  });

  it('blocks kratom where a state prohibits it', () => {
    for (const state of ['AL', 'AR', 'IN', 'VT', 'WI'] as const) {
      expect(evaluate(['kratom'], state, TODAY).allowed).toBe(false);
    }
  });

  it('applies bans only from their effective date', () => {
    expect(evaluate(['kratom'], 'TN', '2026-06-30').allowed).toBe(true);
    expect(evaluate(['kratom'], 'TN', '2026-07-01').allowed).toBe(false);
    expect(evaluate(['kratom'], 'MA', '2026-08-27').allowed).toBe(true);
    expect(evaluate(['kratom'], 'MA', '2026-08-28').allowed).toBe(false);
  });

  it('lifts a ban on its repeal date', () => {
    expect(evaluate(['kratom'], 'RI', '2026-03-31').allowed).toBe(false);
    expect(evaluate(['kratom'], 'RI', '2026-04-01').allowed).toBe(true);
  });

  it('blocks a kava + kratom blend wherever kratom is blocked', () => {
    expect(evaluate(['kava', 'kratom'], 'AL', TODAY).allowed).toBe(false);
    expect(evaluate(['kava'], 'AL', TODAY).allowed).toBe(true);
  });

  it('keeps caffeine-only products sellable everywhere at the company minimum age', () => {
    expect(restrictedStates(['caffeine'], TODAY)).toEqual([]);
    expect(evaluate(['caffeine'], 'NY', TODAY).minimumAge).toBe(COMPANY_MINIMUM_AGE);
  });

  it('limits hemp THC to Florida until the federal cap takes effect', () => {
    expect(evaluate(['hemp_thc'], 'FL', '2026-12-10').allowed).toBe(true);
    expect(evaluate(['hemp_thc'], 'GA', '2026-12-10').allowed).toBe(false);
    expect(isSellableAnywhere(['hemp_thc'], '2026-12-10')).toBe(true);
  });

  it('blocks hemp THC everywhere from December 11, 2026', () => {
    expect(evaluate(['hemp_thc'], 'FL', '2026-12-11').allowed).toBe(false);
    expect(isSellableAnywhere(['hemp_thc'], '2026-12-11')).toBe(false);
    expect(restrictedStates(['hemp_thc'], '2026-12-11')).toHaveLength(STATE_CODES.length);
  });
});

describe('upcomingRestrictions', () => {
  it('announces the federal hemp THC cap before it takes effect, and not after', () => {
    expect(upcomingRestrictions(['hemp_thc'], TODAY).map((rule) => rule.id)).toEqual([
      'hemp-thc-federal-redefinition',
    ]);
    expect(upcomingRestrictions(['hemp_thc'], '2026-12-11')).toEqual([]);
    expect(upcomingRestrictions(['kava'], TODAY)).toEqual([]);
  });
});

describe('businessDate', () => {
  it('uses Eastern time, not UTC', () => {
    // 03:00 UTC on Dec 11 is still Dec 10 in Orlando.
    expect(businessDate(new Date('2026-12-11T03:00:00Z'))).toBe('2026-12-10');
    expect(businessDate(new Date('2026-12-11T05:30:00Z'))).toBe('2026-12-11');
  });
});

describe('COMPLIANCE_RULES', () => {
  it('has unique ids, sources and well-formed dates', () => {
    const ids = COMPLIANCE_RULES.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const rule of COMPLIANCE_RULES) {
      expect(rule.sources.length, rule.id).toBeGreaterThan(0);
      for (const date of [rule.effectiveFrom, rule.effectiveUntil]) {
        if (date) expect(date, rule.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      if (rule.effectiveFrom && rule.effectiveUntil) {
        expect(rule.effectiveFrom < rule.effectiveUntil, rule.id).toBe(true);
      }
    }
  });

  it('never lowers the company minimum age', () => {
    for (const rule of COMPLIANCE_RULES) {
      if (rule.effect.type === 'minimum_age') {
        expect(rule.effect.age, rule.id).toBeGreaterThanOrEqual(COMPANY_MINIMUM_AGE);
      }
    }
  });
});
