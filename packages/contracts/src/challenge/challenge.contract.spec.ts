import { describe, expect, it } from 'vitest';

import { challengeSchema } from './challenge.contract';

const validChallenge = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Challenge MICHELIN Power',
  description: 'Battez le segment.',
  strava_segment_id: '229781',
  strava_segment_url: 'https://www.strava.com/segments/229781',
  location: 'Côte du Challenge',
  distance_km: 2.68,
  elevation_m: 150,
  prize_label: '2 pneus MICHELIN Power Cup TLR',
  prize_description: 'La paire offerte au vainqueur.',
  starts_at: '2026-06-17T00:00:00.000Z',
  ends_at: '2026-07-17T00:00:00.000Z',
  entries: [
    {
      rank: 1,
      athlete_name: 'Camille Renaud',
      club: 'VC Clermont',
      time_seconds: 318,
    },
    { rank: 2, athlete_name: 'Hugo Lefèvre', club: null, time_seconds: 345 },
  ],
} as const;

describe('challengeSchema', () => {
  it('accepts a challenge with its leaderboard', () => {
    const result = challengeSchema.safeParse(validChallenge);

    expect(result.success).toBe(true);
  });

  it('coerces numeric strings from the database', () => {
    const result = challengeSchema.safeParse({
      ...validChallenge,
      distance_km: '2.68',
      elevation_m: '150',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a non-url segment link', () => {
    const result = challengeSchema.safeParse({
      ...validChallenge,
      strava_segment_url: 'not-a-url',
    });

    expect(result.success).toBe(false);
  });
});
