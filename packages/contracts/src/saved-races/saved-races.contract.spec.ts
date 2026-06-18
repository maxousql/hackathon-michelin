import { describe, expect, it } from 'vitest';

import {
  createSavedRaceRequestSchema,
  savedRaceSchema,
  updateSavedRaceRequestSchema,
} from './saved-races.contract';

const RESULT = {
  tire: {
    id: 'power-gravel',
    name: 'Michelin Power Gravel',
    line: 'Power',
    description: 'Pneu gravel polyvalent.',
    imageSlug: 'power-gravel',
    disciplines: ['gravel'],
    highlights: ['Grip', 'Rendement'],
    priceEur: 49.9,
    productUrl: 'https://example.com/power-gravel',
  },
  pressure: {
    frontBar: 2.1,
    rearBar: 2.3,
    note: 'Pression indicative.',
  },
  weatherSummary: 'Temps sec.',
  justification: 'Surface mixte et distance moyenne.',
  confidenceScore: 82,
};

describe('savedRaceSchema', () => {
  it('accepts a race associated to a bike', () => {
    expect(
      savedRaceSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        bikeId: '550e8400-e29b-41d4-a716-446655440001',
        raceName: 'Gravel Trophy',
        raceDate: '2026-07-12',
        locationName: 'Lyon',
        surface: 'gravel',
        discipline: 'sportive',
        distanceKm: 88,
        elevationGainM: 1200,
        riderWeightKg: 72,
        result: RESULT,
        createdAt: '2026-06-18T12:00:00.000Z',
      }).success,
    ).toBe(true);
  });
});

describe('createSavedRaceRequestSchema', () => {
  it('accepts an optional bike association', () => {
    const parsed = createSavedRaceRequestSchema.parse({
      bikeId: '550e8400-e29b-41d4-a716-446655440001',
      raceName: 'Gravel Trophy',
      raceDate: '2026-07-12',
      locationName: 'Lyon',
      surface: 'gravel',
      discipline: 'sportive',
      distanceKm: 88,
      elevationGainM: 1200,
      riderWeightKg: 72,
      result: RESULT,
    });

    expect(parsed.bikeId).toBe('550e8400-e29b-41d4-a716-446655440001');
  });
});

describe('updateSavedRaceRequestSchema', () => {
  it('accepts clearing the bike association', () => {
    expect(updateSavedRaceRequestSchema.parse({ bikeId: null })).toEqual({
      bikeId: null,
    });
  });
});
