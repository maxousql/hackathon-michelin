import { z } from 'zod';

import {
  bikeTypeSchema,
  ridingPrioritySchema,
  ridingSurfaceSchema,
  tireSealingSchema,
} from '../bikes/bikes.contract';

export const surfaceTypeSchema = z.enum(['road', 'gravel', 'mtb']);
export const disciplineSchema = z.enum([
  'competition',
  'sportive',
  'training',
  'enduro',
  'all-mountain',
  'gravity',
]);
export const weatherConditionSchema = z.enum(['sun', 'cloudy', 'rain']);

const optionalBikeTextSchema = z.string().trim().min(1).max(40).nullable();

export const raceBikeFitmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  type: bikeTypeSchema,
  tireDiameter: optionalBikeTextSchema.optional(),
  tireWidth: optionalBikeTextSchema.optional(),
  tireSealing: tireSealingSchema.nullable().optional(),
  ridingSurface: ridingSurfaceSchema.optional(),
  ridingPriority: ridingPrioritySchema.optional(),
  isEbike: z.boolean().optional(),
});

export const raceAnalyzeRequestSchema = z.object({
  surface: surfaceTypeSchema,
  discipline: disciplineSchema,
  distanceKm: z.number().positive().max(500),
  elevationGainM: z.number().min(0).max(8000),
  riderWeightKg: z.number().min(30).max(150),
  raceDate: z.string().date(),
  locationName: z.string().min(1).max(100),
  hasGpx: z.boolean().optional(),
  gradientStats: z
    .object({
      flat: z.number(),
      rolling: z.number(),
      hilly: z.number(),
      steep: z.number(),
    })
    .optional(),
  bike: raceBikeFitmentSchema.optional(),
});

export const tireRecommendationSchema = z.object({
  id: z.string(),
  name: z.string(),
  line: z.string(),
  description: z.string(),
  imageSlug: z.string(),
  disciplines: z.array(z.string()),
  highlights: z.array(z.string()),
  priceEur: z.number(),
  productUrl: z.string().url(),
});

export const pressureRecommendationSchema = z.object({
  frontBar: z.number(),
  rearBar: z.number(),
  note: z.string(),
});

export const bikeCompatibilitySchema = z.object({
  bikeId: z.string().optional(),
  bikeName: z.string(),
  summary: z.string(),
  details: z.array(z.string()),
  warning: z.string().optional(),
});

export const raceAnalyzeResponseSchema = z.object({
  tire: tireRecommendationSchema,
  pressure: pressureRecommendationSchema,
  weatherSummary: z.string(),
  justification: z.string(),
  confidenceScore: z.number().min(0).max(100),
  bikeCompatibility: bikeCompatibilitySchema.optional(),
});

export type SurfaceType = z.infer<typeof surfaceTypeSchema>;
export type Discipline = z.infer<typeof disciplineSchema>;
export type WeatherCondition = z.infer<typeof weatherConditionSchema>;
export type RaceBikeFitment = z.infer<typeof raceBikeFitmentSchema>;
export type RaceAnalyzeRequest = z.infer<typeof raceAnalyzeRequestSchema>;
export type TireRecommendation = z.infer<typeof tireRecommendationSchema>;
export type PressureRecommendation = z.infer<
  typeof pressureRecommendationSchema
>;
export type BikeCompatibility = z.infer<typeof bikeCompatibilitySchema>;
export type RaceAnalyzeResponse = z.infer<typeof raceAnalyzeResponseSchema>;
