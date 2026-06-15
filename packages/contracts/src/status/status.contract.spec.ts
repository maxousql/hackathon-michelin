import { describe, expect, it } from 'vitest';

import { statusResponseSchema } from './status.contract';

describe('statusResponseSchema', () => {
  it('accepts the API status payload', () => {
    const result = statusResponseSchema.safeParse({
      service: 'michelin-api',
      status: 'ok',
      timestamp: '2026-06-15T12:00:00.000Z',
      version: '0.1.0',
    });

    expect(result.success).toBe(true);
  });

  it('rejects unsupported service statuses', () => {
    const result = statusResponseSchema.safeParse({
      service: 'michelin-api',
      status: 'offline',
      timestamp: '2026-06-15T12:00:00.000Z',
      version: '0.1.0',
    });

    expect(result.success).toBe(false);
  });
});
