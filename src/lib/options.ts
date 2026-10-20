export type Option<T extends string = string> = { value: T; label: string };

/** Option values as a non-empty tuple, the shape `z.enum` expects. */
export function optionValues<const T extends readonly Option[]>(
  options: T,
): [T[number]['value'], ...T[number]['value'][]] {
  return options.map((option) => option.value) as [T[number]['value'], ...T[number]['value'][]];
}

export function optionLabel(options: readonly Option[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
