import { describe, expect, it } from 'vitest';

import {
  createTirePassportRequestSchema,
  tirePassportSchema,
  updateTirePassportRequestSchema,
} from './tire-passports.contract';

describe('tirePassportSchema', () => {
  it('accepts an active tire passport', () => {
    expect(
      tirePassportSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        bikeId: '550e8400-e29b-41d4-a716-446655440001',
        bikeName: 'Canyon Grail',
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
      }).success,
    ).toBe(true);
  });
});

describe('createTirePassportRequestSchema', () => {
  it('defaults mounted distance', () => {
    const parsed = createTirePassportRequestSchema.parse({
      bikeId: '550e8400-e29b-41d4-a716-446655440001',
      tireBrand: 'Michelin',
      tireModel: 'Power Cup',
      tireName: 'Michelin Power Cup',
      mountedAt: '2026-06-18',
    });

    expect(parsed.mountedDistanceKm).toBe(0);
  });
});

describe('updateTirePassportRequestSchema', () => {
  it('accepts partial tracking updates', () => {
    expect(
      updateTirePassportRequestSchema.parse({
        bikeId: '550e8400-e29b-41d4-a716-446655440002',
        mountedDistanceKm: 1800,
        referenceFrontBar: 2.2,
        referenceRearBar: 2.4,
        status: 'replace-soon',
      }),
    ).toEqual({
      bikeId: '550e8400-e29b-41d4-a716-446655440002',
      mountedDistanceKm: 1800,
      referenceFrontBar: 2.2,
      referenceRearBar: 2.4,
      status: 'replace-soon',
    });
  });
});
