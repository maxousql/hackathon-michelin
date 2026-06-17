import { describe, expect, it } from 'vitest';

import { tireComparisonRequestSchema } from './comparator.contract';

const validRequest = {
  route: {
    source: 'gpx',
    surface: 'road',
    distanceKm: 118,
    elevationGainM: 1750,
    gradientStats: {
      flat: 45,
      rolling: 30,
      hilly: 20,
      steep: 5,
    },
    pointCount: 1200,
  },
  selectedProductIds: [1, 2],
  riderWeightKg: 72,
} as const;

describe('tireComparisonRequestSchema', () => {
  it('accepts a route and 2 selected tires', () => {
    const result = tireComparisonRequestSchema.safeParse(validRequest);

    expect(result.success).toBe(true);
  });

  it('rejects fewer than 2 tires', () => {
    const result = tireComparisonRequestSchema.safeParse({
      ...validRequest,
      selectedProductIds: [1],
    });

    expect(result.success).toBe(false);
  });

  it('rejects more than 3 tires', () => {
    const result = tireComparisonRequestSchema.safeParse({
      ...validRequest,
      selectedProductIds: [1, 2, 3, 4],
    });

    expect(result.success).toBe(false);
  });

  it('rejects duplicate tires', () => {
    const result = tireComparisonRequestSchema.safeParse({
      ...validRequest,
      selectedProductIds: [1, 1],
    });

    expect(result.success).toBe(false);
  });
});
