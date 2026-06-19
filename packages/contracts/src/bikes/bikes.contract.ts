import { z } from 'zod';

export const bikeTypeSchema = z.enum(['road', 'mtb', 'gravel']);
export type BikeType = z.infer<typeof bikeTypeSchema>;

export const tireSealingSchema = z.enum([
  'TUBE TYPE',
  'TUBELESS READY',
  'TUBULAR',
]);
export type TireSealing = z.infer<typeof tireSealingSchema>;

export const ridingSurfaceSchema = z.enum([
  'smooth',
  'mixed',
  'loose',
  'mud',
  'urban',
]);
export type RidingSurface = z.infer<typeof ridingSurfaceSchema>;

export const ridingPrioritySchema = z.enum([
  'performance',
  'endurance',
  'grip',
  'durability',
  'versatility',
]);
export type RidingPriority = z.infer<typeof ridingPrioritySchema>;

const optionalBikeTextSchema = z.string().trim().min(1).max(40).nullable();

export const bikeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: bikeTypeSchema,
  distanceKm: z.number().int().nonnegative(),
  tireDiameter: optionalBikeTextSchema,
  tireWidth: optionalBikeTextSchema,
  tireSealing: tireSealingSchema.nullable(),
  ridingSurface: ridingSurfaceSchema,
  ridingPriority: ridingPrioritySchema,
  isEbike: z.boolean(),
  isPrimary: z.boolean(),
  createdAt: z.string(),
});

export type Bike = z.infer<typeof bikeSchema>;

export const bikeListSchema = z.array(bikeSchema);

export const createBikeRequestSchema = z.object({
  name: z.string().min(1).max(100),
  type: bikeTypeSchema,
  distanceKm: z.number().int().nonnegative().default(0),
  tireDiameter: optionalBikeTextSchema.optional(),
  tireWidth: optionalBikeTextSchema.optional(),
  tireSealing: tireSealingSchema.nullable().optional(),
  ridingSurface: ridingSurfaceSchema.default('mixed'),
  ridingPriority: ridingPrioritySchema.default('versatility'),
  isEbike: z.boolean().default(false),
  isPrimary: z.boolean().default(false),
});

export type CreateBikeRequest = z.input<typeof createBikeRequestSchema>;

export const updateBikeRequestSchema = createBikeRequestSchema.partial();

export type UpdateBikeRequest = z.input<typeof updateBikeRequestSchema>;
