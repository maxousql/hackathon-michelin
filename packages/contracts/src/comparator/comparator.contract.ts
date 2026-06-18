import { z } from 'zod';

import { surfaceTypeSchema } from '../race-intelligence/race-intelligence.contract';

export const routeSourceSchema = z.enum(['gpx', 'strava', 'manual']);

export const routeGradientStatsSchema = z.object({
  flat: z.number().min(0).max(100),
  rolling: z.number().min(0).max(100),
  hilly: z.number().min(0).max(100),
  steep: z.number().min(0).max(100),
});

export const comparatorRouteStatsSchema = z.object({
  source: routeSourceSchema,
  surface: surfaceTypeSchema,
  distanceKm: z.number().positive().max(500),
  elevationGainM: z.number().min(0).max(8000),
  gradientStats: routeGradientStatsSchema.optional(),
  pointCount: z.number().int().positive().optional(),
});

export const tireComparisonRequestSchema = z.object({
  route: comparatorRouteStatsSchema,
  selectedProductIds: z
    .array(z.number().int().positive())
    .min(2)
    .max(3)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Selected tires must be distinct.',
    }),
  riderWeightKg: z.number().min(30).max(150).optional(),
});

export const tireComparisonScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  routeFit: z.number().min(0).max(100),
  rollingEfficiency: z.number().min(0).max(100),
  grip: z.number().min(0).max(100),
  punctureProtection: z.number().min(0).max(100),
  durability: z.number().min(0).max(100),
});

export const tireComparisonProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  productType: z.string().nullable(),
  range: z.string().nullable(),
  cycleType: z.string().nullable(),
  segment: z.string().nullable(),
  size: z.string().nullable(),
  widthEtrto: z.string().nullable(),
  diameterEtrto: z.string().nullable(),
  type: z.string().nullable(),
  valve: z.string().nullable(),
  valveLength: z.string().nullable(),
  rimType: z.string().nullable(),
  fitting: z.string().nullable(),
  sealing: z.string().nullable(),
  weight: z.string().nullable(),
  pressureRange: z.string().nullable(),
  terrainTypes: z.string().nullable(),
  use: z.string().nullable(),
  technologies: z.array(z.string()),
});

export const tireBenchmarkResultSchema = z.object({
  product: tireComparisonProductSchema,
  scores: tireComparisonScoreSchema,
  advantages: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  technicalDetails: z.array(z.string()),
  equivalenceNote: z.string().nullable(),
  verdict: z.string(),
});

export const tireComparisonResponseSchema = z.object({
  recommendedProductId: z.number().int().positive(),
  routeSummary: z.array(z.string()),
  results: z.array(tireBenchmarkResultSchema).min(2).max(3),
});

export type RouteSource = z.infer<typeof routeSourceSchema>;
export type RouteGradientStats = z.infer<typeof routeGradientStatsSchema>;
export type ComparatorRouteStats = z.infer<typeof comparatorRouteStatsSchema>;
export type TireComparisonRequest = z.infer<typeof tireComparisonRequestSchema>;
export type TireComparisonScore = z.infer<typeof tireComparisonScoreSchema>;
export type TireComparisonProduct = z.infer<typeof tireComparisonProductSchema>;
export type TireBenchmarkResult = z.infer<typeof tireBenchmarkResultSchema>;
export type TireComparisonResponse = z.infer<
  typeof tireComparisonResponseSchema
>;
