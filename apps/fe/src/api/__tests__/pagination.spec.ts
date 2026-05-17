import { describe, expect, it, vi } from 'vitest';
import { fetchAllPages } from '../pagination';
import type { PaginatedResult } from '../types';

function pageResult<T>(page: number, items: T[], totalPages: number): PaginatedResult<T> {
  return {
    data: items,
    meta: { page, pageSize: 20, total: items.length * totalPages, totalPages },
  };
}

describe('fetchAllPages', () => {
  it('concatenates all pages', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a'], 2))
      .mockResolvedValueOnce(pageResult(2, ['b'], 2));

    const items = await fetchAllPages(fetchPage);
    expect(items).toEqual(['a', 'b']);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('throws when maxPages exceeded', async () => {
    const fetchPage = vi.fn().mockResolvedValue(pageResult(1, ['x'], 100));

    await expect(fetchAllPages(fetchPage, 2)).rejects.toThrow(/maxPages/);
  });
});
