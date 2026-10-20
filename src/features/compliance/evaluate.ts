import type { IngredientClass } from '@/domain/ingredients';
import { STATE_CODES, type StateCode } from '@/domain/us-states';
import { COMPLIANCE_RULES, type ComplianceRule } from './rules';

/** Company policy: every purchase requires a verified ID showing 21+. Rules may raise, never lower, this. */
export const COMPANY_MINIMUM_AGE = 21;

export type Verdict = {
  allowed: boolean;
  minimumAge: number;
  /** Prohibitions that block the sale (empty when allowed). */
  blockedBy: ComplianceRule[];
};

/** Today's date (YYYY-MM-DD) in Eastern time, where the business operates and rules are dated. */
export function businessDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function isInEffect(rule: ComplianceRule, on: string): boolean {
  if (rule.effectiveFrom && on < rule.effectiveFrom) return false;
  if (rule.effectiveUntil && on >= rule.effectiveUntil) return false;
  return true;
}

export function appliesToState(rule: ComplianceRule, state: StateCode): boolean {
  const { state: ruleState, exceptStates = [] } = rule.jurisdiction;
  if (ruleState) return ruleState === state;
  return !exceptStates.includes(state);
}

/**
 * Can a product containing `ingredients` be sold for delivery to (or pickup in) `state` on `on`?
 * Fails closed: any matching prohibition blocks the sale.
 */
export function evaluate(
  ingredients: readonly IngredientClass[],
  state: StateCode,
  on: string,
  rules: readonly ComplianceRule[] = COMPLIANCE_RULES,
): Verdict {
  const matching = rules.filter(
    (rule) =>
      ingredients.includes(rule.ingredient) && isInEffect(rule, on) && appliesToState(rule, state),
  );
  const blockedBy = matching.filter((rule) => rule.effect.type === 'prohibited');
  const minimumAge = matching.reduce(
    (age, rule) => (rule.effect.type === 'minimum_age' ? Math.max(age, rule.effect.age) : age),
    COMPANY_MINIMUM_AGE,
  );
  return { allowed: blockedBy.length === 0, minimumAge, blockedBy };
}

/** States a product cannot be sold to on `on`, alphabetical by code. */
export function restrictedStates(
  ingredients: readonly IngredientClass[],
  on: string,
  rules: readonly ComplianceRule[] = COMPLIANCE_RULES,
): StateCode[] {
  return STATE_CODES.filter((state) => !evaluate(ingredients, state, on, rules).allowed);
}

/** Prohibitions on these ingredients that start after `on`, soonest first (for advance notice). */
export function upcomingRestrictions(
  ingredients: readonly IngredientClass[],
  on: string,
  rules: readonly ComplianceRule[] = COMPLIANCE_RULES,
): ComplianceRule[] {
  return rules
    .filter(
      (rule) =>
        ingredients.includes(rule.ingredient) &&
        rule.effect.type === 'prohibited' &&
        rule.effectiveFrom !== undefined &&
        rule.effectiveFrom > on,
    )
    .sort((a, b) => (a.effectiveFrom ?? '').localeCompare(b.effectiveFrom ?? ''));
}

/** Whether the product can be sold anywhere at all on `on` (otherwise hide the buy button). */
export function isSellableAnywhere(
  ingredients: readonly IngredientClass[],
  on: string,
  rules: readonly ComplianceRule[] = COMPLIANCE_RULES,
): boolean {
  return restrictedStates(ingredients, on, rules).length < STATE_CODES.length;
}
