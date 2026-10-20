/**
 * Short, stable code for an option value: the first three letters of up to three words,
 * or the first six letters of a single word. "Mango Passion Fruit" -> "MANPASFRU",
 * "Watermelon" -> "WATERM", "Piña Colada" -> "PINCOL".
 */
export function optionCode(label: string): string {
  const words = label
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toUpperCase()
    .split(' ')
    .filter(Boolean);
  const [first] = words;
  if (!first) throw new Error(`Cannot derive an option code from "${label}"`);
  if (words.length === 1) return first.slice(0, 6);
  return words
    .slice(0, 3)
    .map((word) => word.slice(0, 3))
    .join('');
}

export function buildSku(productCode: string, ...parts: string[]): string {
  return [productCode, ...parts].join('-');
}
