/** Parse a `?page=` search param into a page number >= 1 (anything invalid is page 1). */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return 1;
  const page = Number(raw);
  return page >= 1 ? Math.min(page, 10_000) : 1;
}

export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Page numbers to render, with gaps: pageWindow(6, 12) -> [1, 'gap', 5, 6, 7, 'gap', 12].
 */
export function pageWindow(current: number, total: number, radius = 1): (number | 'gap')[] {
  const pages = new Set([1, total]);
  for (let page = current - radius; page <= current + radius; page += 1) {
    if (page >= 1 && page <= total) pages.add(page);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((page, index) => {
    const previous = sorted[index - 1];
    return previous !== undefined && page - previous > 1 ? (['gap', page] as const) : [page];
  });
}
