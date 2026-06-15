import { afterEach, describe, expect, it, vi } from 'vitest';

import { getStatus } from './get-status';

describe('getStatus', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('uses the server-only API URL', async () => {
    vi.stubEnv('API_INTERNAL_URL', 'http://api:3001/api/v1');
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          service: 'michelin-api',
          status: 'ok',
          timestamp: '2026-06-15T12:00:00.000Z',
          version: '0.1.0',
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetcher);

    await expect(getStatus()).resolves.toMatchObject({ status: 'ok' });
    expect(fetcher).toHaveBeenCalledWith(
      'http://api:3001/api/v1/status',
      expect.any(Object),
    );
  });
});
