import { Badge } from '@/components/ui/badge';
import { INGREDIENT_LABELS, type IngredientClass } from '@/domain/ingredients';

export function IngredientBadges({ ingredients }: { ingredients: readonly IngredientClass[] }) {
  return (
    <>
      {ingredients.map((ingredient) => (
        <Badge key={ingredient}>{INGREDIENT_LABELS[ingredient]}</Badge>
      ))}
    </>
  );
}
