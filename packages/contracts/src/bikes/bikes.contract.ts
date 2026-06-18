import { z } from 'zod';

export const bikeTypeSchema = z.enum(['road', 'mtb', 'gravel']);
export type BikeType = z.infer<typeof bikeTypeSchema>;

export const bikeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: bikeTypeSchema,
  distanceKm: z.number().int().nonnegative(),
  isPrimary: z.boolean(),
  createdAt: z.string(),
});

export type Bike = z.infer<typeof bikeSchema>;

export const bikeListSchema = z.array(bikeSchema);

export const createBikeRequestSchema = z.object({
  name: z.string().min(1).max(100),
  type: bikeTypeSchema,
  distanceKm: z.number().int().nonnegative().default(0),
  isPrimary: z.boolean().default(false),
});

export type CreateBikeRequest = z.infer<typeof createBikeRequestSchema>;
