import { describe, expect, it, vi } from 'vitest';

import { ApiClientError, createApiClient } from './client';

describe('createApiClient', () => {
  it('returns a validated status payload', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          service: 'michelin-api',
          status: 'ok',
          timestamp: '2026-06-15T12:00:00.000Z',
          version: '0.1.0',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      ),
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3001/api/v1/',
      fetcher,
    });

    await expect(client.getStatus()).resolves.toMatchObject({
      service: 'michelin-api',
      status: 'ok',
    });
    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/status',
      expect.any(Object),
    );
  });

  it('raises a typed error on an invalid payload', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ status: 'ok' })));

    const client = createApiClient({
      baseUrl: 'http://localhost:3001/api/v1',
      fetcher,
    });

    await expect(client.getStatus()).rejects.toBeInstanceOf(ApiClientError);
  });
});
