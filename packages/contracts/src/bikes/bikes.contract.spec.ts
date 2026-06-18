import { describe, expect, it } from 'vitest';

import {
  bikeSchema,
  createBikeRequestSchema,
  updateBikeRequestSchema,
} from './bikes.contract';

const VALID_BIKE = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Trek Domane SL6',
  type: 'road',
  distanceKm: 3200,
  tireDiameter: '700',
  tireWidth: '28',
  tireSealing: 'TUBELESS READY',
  ridingSurface: 'smooth',
  ridingPriority: 'performance',
  isEbike: false,
  isPrimary: true,
  createdAt: '2026-06-18T12:00:00.000Z',
};

describe('bikeSchema', () => {
  it('accepts a bike with tire fitment details', () => {
    expect(bikeSchema.safeParse(VALID_BIKE).success).toBe(true);
  });

  it('accepts nullable tire dimensions for existing bikes', () => {
    expect(
      bikeSchema.safeParse({
        ...VALID_BIKE,
        tireDiameter: null,
        tireWidth: null,
        tireSealing: null,
      }).success,
    ).toBe(true);
  });
});

describe('createBikeRequestSchema', () => {
  it('defaults optional recommendation fields', () => {
    const parsed = createBikeRequestSchema.parse({
      name: 'Commuter',
      type: 'gravel',
    });

    expect(parsed).toMatchObject({
      distanceKm: 0,
      isEbike: false,
      isPrimary: false,
      ridingPriority: 'versatility',
      ridingSurface: 'mixed',
    });
  });

  it('rejects unsupported tire sealing values', () => {
    expect(
      createBikeRequestSchema.safeParse({
        name: 'Bad fit',
        type: 'road',
        tireSealing: 'CLINCHER',
      }).success,
    ).toBe(false);
  });
});

describe('updateBikeRequestSchema', () => {
  it('accepts partial bike updates', () => {
    expect(
      updateBikeRequestSchema.parse({
        isPrimary: true,
      }),
    ).toMatchObject({
      isPrimary: true,
    });
  });
});
