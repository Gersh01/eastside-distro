/**
 * Regulated ingredient classes. Compliance rules (src/features/compliance) key off these,
 * so every product must declare every class it contains.
 */
export const INGREDIENT_CLASSES = ['kratom', 'kava', 'hemp_thc', 'caffeine'] as const;

export type IngredientClass = (typeof INGREDIENT_CLASSES)[number];

export const INGREDIENT_LABELS: Record<IngredientClass, string> = {
  kratom: 'Kratom',
  kava: 'Kava',
  hemp_thc: 'Hemp THC',
  caffeine: 'Caffeine',
};
