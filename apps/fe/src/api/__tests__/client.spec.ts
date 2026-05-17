import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, buildUrl } from '../client';

describe('buildUrl', () => {
  it('omits undefined query keys', () => {
    const url = buildUrl('/catalog-nodes', { page: 1, q: undefined });
    expect(url).toContain('page=1');
    expect(url).not.toContain('q=');
  });

  it('encodes booleans as strings', () => {
    const url = buildUrl('/catalog-nodes/1/versions', {
      isActive: true,
      includeDeprecated: false,
    });
    expect(url).toContain('isActive=true');
    expect(url).toContain('includeDeprecated=false');
  });
});

describe('api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses paginated JSON on GET', async () => {
    const payload = {
      data: [{ id: '1', slug: 'tile' }],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const result = await api.get<typeof payload>('/catalog-nodes');
    expect(result).toEqual(payload);
  });

  it('resolves delete without parsing body on 204', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );

    await expect(api.delete('/boards/1')).resolves.toBeUndefined();
  });

  it('throws ApiError with validation messages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: ['slug must be unique'] }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(api.get('/catalog-nodes/1')).rejects.toMatchObject({
      status: 400,
      message: 'slug must be unique',
    } satisfies Partial<ApiError>);
  });
});
