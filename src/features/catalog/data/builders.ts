import { buildSku, optionCode } from '../sku';
import type { VariantSeed } from '../types';

export type Pack = { label: string; units: number; code: string };

export const CASE_24_HALF_12: Pack[] = [
  { label: 'Case of 24', units: 24, code: 'C24' },
  { label: 'Half case of 12', units: 12, code: 'H12' },
];
export const CASE_12_HALF_6: Pack[] = [
  { label: 'Case of 12', units: 12, code: 'C12' },
  { label: 'Half case of 6', units: 6, code: 'H06' },
];
export const CASE_12: Pack[] = [{ label: 'Case of 12', units: 12, code: 'C12' }];
export const EACH: Pack[] = [{ label: 'Each', units: 1, code: 'EA' }];

type Attribute = 'flavor' | 'strain' | 'strength' | 'size' | 'form';
type AxisValue = { label: string; code: string };
export type Axis = { attribute: Attribute; values: AxisValue[] };

/** Option axis whose codes are derived from the labels ("Yuzu Lime" -> "YUZLIM"). */
export function axis(attribute: Attribute, ...labels: string[]): Axis {
  return { attribute, values: labels.map((label) => ({ label, code: optionCode(label) })) };
}

/** Option axis with explicit codes, e.g. sizes: coded(['1 kg', '1KG'], ['10 kg', '10KG']). */
export function coded(attribute: Attribute, ...pairs: [label: string, code: string][]): Axis {
  return { attribute, values: pairs.map(([label, code]) => ({ label, code })) };
}

type MatrixOptions = { comingSoon?: string[] };

/**
 * Every combination of the axes, in every pack. The SKU is the product code, each axis code,
 * then the pack code: ORC45-YUZLIM-C24. The name omits the pack when it is "Each".
 */
export function variantMatrix(
  productCode: string,
  axes: Axis[],
  packs: Pack[],
  { comingSoon = [] }: MatrixOptions = {},
): VariantSeed[] {
  const combinations = axes.reduce<{ label: string; code: string; attribute: Attribute }[][]>(
    (acc, { attribute, values }) =>
      acc.flatMap((combo) => values.map((value) => [...combo, { ...value, attribute }])),
    [[]],
  );

  return combinations.flatMap((combo) =>
    packs.map((pack): VariantSeed => {
      const labels = combo.map((part) => part.label);
      const attributes = Object.fromEntries(combo.map((part) => [part.attribute, part.label]));
      return {
        sku: buildSku(productCode, ...combo.map((part) => part.code), pack.code),
        name: [...labels, ...(pack.code === 'EA' ? [] : [pack.label])].join(' · '),
        ...attributes,
        packLabel: pack.label,
        unitsPerPack: pack.units,
        status: labels.some((label) => comingSoon.includes(label)) ? 'coming_soon' : 'active',
      };
    }),
  );
}
