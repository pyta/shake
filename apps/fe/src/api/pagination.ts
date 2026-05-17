import type { PaginatedResult } from './types';

export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<PaginatedResult<T>>,
  maxPages = 50,
): Promise<T[]> {
  const out: T[] = [];
  let page = 1;

  for (;;) {
    const { data, meta } = await fetchPage(page);
    out.push(...data);
    if (page >= meta.totalPages || data.length === 0) break;
    if (++page > maxPages) {
      throw new Error('fetchAllPages: exceeded maxPages');
    }
  }

  return out;
}
