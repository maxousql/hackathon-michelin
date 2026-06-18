import { z } from 'zod';

export const tirePassportStatusSchema = z.enum([
  'active',
  'replace-soon',
  'retired',
]);

const optionalTextSchema = z.string().trim().min(1).max(100).nullable();

export const tirePassportSchema = z.object({
  id: z.string().uuid(),
  bikeId: z.string().uuid(),
  bikeName: z.string().nullable(),
  productId: z.number().int().positive().nullable(),
  tireBrand: z.string().trim().min(1).max(60),
  tireModel: z.string().trim().min(1).max(100),
  tireName: z.string().min(1).max(120),
  tireDimension: optionalTextSchema,
  mountedAt: z.string().date(),
  mountedDistanceKm: z.number().int().nonnegative(),
  referenceFrontBar: z.number().positive().nullable(),
  referenceRearBar: z.number().positive().nullable(),
  status: tirePassportStatusSchema,
  createdAt: z.string(),
});

export const tirePassportListSchema = z.array(tirePassportSchema);

export const createTirePassportRequestSchema = z.object({
  bikeId: z.string().uuid(),
  productId: z.number().int().positive().nullable().optional(),
  tireBrand: z.string().trim().min(1).max(60),
  tireModel: z.string().trim().min(1).max(100),
  tireName: z.string().min(1).max(120),
  tireDimension: optionalTextSchema.optional(),
  mountedAt: z.string().date(),
  mountedDistanceKm: z.number().int().nonnegative().default(0),
  referenceFrontBar: z.number().positive().nullable().optional(),
  referenceRearBar: z.number().positive().nullable().optional(),
});

export const updateTirePassportRequestSchema = createTirePassportRequestSchema
  .partial()
  .extend({ status: tirePassportStatusSchema.optional() });

export type TirePassportStatus = z.infer<typeof tirePassportStatusSchema>;
export type TirePassport = z.infer<typeof tirePassportSchema>;
export type CreateTirePassportRequest = z.infer<
  typeof createTirePassportRequestSchema
>;
export type UpdateTirePassportRequest = z.infer<
  typeof updateTirePassportRequestSchema
>;
