import { z } from 'zod';

import { raceAnalyzeResponseSchema } from '../race-intelligence/race-intelligence.contract';

export const savedRaceSchema = z.object({
  id: z.string().uuid(),
  raceName: z.string(),
  raceDate: z.string(),
  locationName: z.string(),
  surface: z.string(),
  discipline: z.string(),
  distanceKm: z.number(),
  elevationGainM: z.number(),
  riderWeightKg: z.number(),
  result: raceAnalyzeResponseSchema,
  createdAt: z.string(),
});

export const savedRaceListSchema = z.array(savedRaceSchema);

export const createSavedRaceRequestSchema = z.object({
  raceName: z.string().min(1).max(100),
  raceDate: z.string().date(),
  locationName: z.string().min(1).max(100),
  surface: z.string().min(1),
  discipline: z.string().min(1),
  distanceKm: z.number().positive(),
  elevationGainM: z.number().min(0),
  riderWeightKg: z.number().positive(),
  result: raceAnalyzeResponseSchema,
});

export type SavedRace = z.infer<typeof savedRaceSchema>;
export type CreateSavedRaceRequest = z.infer<
  typeof createSavedRaceRequestSchema
>;
