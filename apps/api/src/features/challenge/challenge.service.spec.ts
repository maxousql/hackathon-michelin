import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChallengeService } from './challenge.service';

const { orderMock } = vi.hoisted(() => ({ orderMock: vi.fn() }));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        order: orderMock,
      }),
    }),
  }),
}));

const config = { get: () => 'test' } as never;

describe('ChallengeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns challenges with entries sorted by rank', async () => {
    orderMock.mockResolvedValue({
      data: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          name: 'Challenge',
          strava_segment_id: '229781',
          strava_segment_url: 'https://www.strava.com/segments/229781',
          prize_label: '2 pneus',
          starts_at: '2026-06-17T00:00:00.000Z',
          ends_at: '2026-07-17T00:00:00.000Z',
          entries: [
            { rank: 3, athlete_name: 'C', club: null, time_seconds: 331 },
            { rank: 1, athlete_name: 'A', club: null, time_seconds: 318 },
            { rank: 2, athlete_name: 'B', club: null, time_seconds: 324 },
          ],
        },
      ],
      error: null,
    });

    const service = new ChallengeService(config);
    const result = await service.list();

    expect(result).toHaveLength(1);
    expect(result[0]?.entries.map((entry) => entry.rank)).toEqual([1, 2, 3]);
  });

  it('throws when Supabase returns an error', async () => {
    orderMock.mockResolvedValue({
      data: null,
      error: { message: 'connexion impossible' },
    });

    const service = new ChallengeService(config);

    await expect(service.list()).rejects.toThrow('connexion impossible');
  });
});
