import { describe, expect, it } from 'vitest';
import type { Bike, SavedRace, TirePassport } from '@michelin/contracts';

import {
  buildRacePreparation,
  calculateProfileCompleteness,
  calculateProfileStats,
  splitRacesByDate,
} from './profile-insights';

const BIKE: Bike = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Canyon Grail',
  type: 'gravel',
  distanceKm: 1200,
  tireDiameter: '700',
  tireWidth: '40',
  tireSealing: 'TUBELESS READY',
  ridingSurface: 'mixed',
  ridingPriority: 'versatility',
  isEbike: false,
  isPrimary: true,
  createdAt: '2026-06-18T12:00:00.000Z',
};

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

const RACE: SavedRace = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  bikeId: BIKE.id,
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
};

const PASSPORT: TirePassport = {
  id: '550e8400-e29b-41d4-a716-446655440020',
  bikeId: BIKE.id,
  bikeName: BIKE.name,
  productId: 42,
  tireBrand: 'Michelin',
  tireModel: 'Power Gravel',
  tireName: 'Michelin Power Gravel',
  tireDimension: '700 x 40',
  mountedAt: '2026-06-18',
  mountedDistanceKm: 1200,
  referenceFrontBar: 2.1,
  referenceRearBar: 2.3,
  status: 'active',
  createdAt: '2026-06-18T12:00:00.000Z',
};

describe('splitRacesByDate', () => {
  it('separates upcoming and past races', () => {
    const buckets = splitRacesByDate(
      [
        RACE,
        {
          ...RACE,
          id: '550e8400-e29b-41d4-a716-446655440011',
          raceDate: '2026-05-01',
        },
      ],
      new Date(2026, 5, 18),
    );

    expect(buckets.upcoming).toHaveLength(1);
    expect(buckets.past).toHaveLength(1);
  });
});

describe('calculateProfileCompleteness', () => {
  it('returns a full score when the profile has all key data', () => {
    const result = calculateProfileCompleteness({
      bikes: [BIKE],
      savedRaces: [RACE],
      stravaConnected: true,
      tirePassports: [PASSPORT],
    });

    expect(result.score).toBe(100);
    expect(result.actions).toEqual([]);
  });
});

describe('calculateProfileStats', () => {
  it('combines activities, bikes, races, and tire passports for the dominant terrain', () => {
    const stats = calculateProfileStats({
      activities: [
        {
          sportType: 'Ride',
          distanceMeters: 20_000,
          elevationGainM: 200,
          startedAt: '2026-06-10T08:00:00.000Z',
        },
      ],
      bikes: [BIKE],
      savedRaces: [RACE],
      tirePassports: [PASSPORT],
      today: new Date(2026, 5, 18),
    });

    expect(stats.terrain).toBe('Gravel mixte');
    expect(stats.terrainDetail).toBe(
      'Basé sur 1 sortie Strava, 1 vélo, 1 course et 1 passeport',
    );
    expect(stats.distanceMoy).toBe(20);
    expect(stats.elevMoy).toBe(200);
  });

  it('uses saved races as a fallback when Strava activities are missing', () => {
    const stats = calculateProfileStats({
      activities: [],
      bikes: [],
      savedRaces: [RACE],
      tirePassports: [],
      today: new Date(2026, 5, 18),
    });

    expect(stats.terrain).toBe('Gravel mixte');
    expect(stats.terrainDetail).toBe('Basé sur 1 course');
    expect(stats.distanceMoy).toBe(88);
    expect(stats.elevMoy).toBe(1200);
  });
});

describe('buildRacePreparation', () => {
  it('marks bike and passport checklist items as done', () => {
    const preparation = buildRacePreparation(RACE, [BIKE], [PASSPORT]);

    expect(preparation.bike?.id).toBe(BIKE.id);
    expect(preparation.passport?.id).toBe(PASSPORT.id);
    expect(preparation.tireMountStatus.status).toBe('aligned');
    expect(preparation.checklist.every((item) => item.done)).toBe(true);
  });

  it('warns when the active tire does not match the race recommendation', () => {
    const preparation = buildRacePreparation(
      RACE,
      [BIKE],
      [
        {
          ...PASSPORT,
          tireModel: 'Power Cup',
          tireName: 'Michelin Power Cup',
        },
      ],
    );

    expect(preparation.tireMountStatus.status).toBe('mismatch');
    expect(
      preparation.checklist.find(
        (item) => item.label === 'Pneu recommandé monté',
      )?.done,
    ).toBe(false);
  });
});
