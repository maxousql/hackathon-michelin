import { z } from 'zod';

/** État du pneu déclaré pour la reprise. */
export const buybackConditionSchema = z.enum([
  'new',
  'very_good',
  'good',
  'fair',
]);

/** Statut d'une demande de reprise. */
export const buybackStatusSchema = z.enum([
  'pending',
  'accepted',
  'received',
  'paid',
  'rejected',
]);

/** Demande de reprise telle que stockée et renvoyée par l'API. */
export const buybackRequestSchema = z.object({
  id: z.string().uuid(),
  product_id: z.coerce.number().nullable(),
  product_label: z.string(),
  segment: z.string().nullable(),
  condition: buybackConditionSchema,
  quantity: z.number().int().positive(),
  estimated_amount_eur: z.coerce.number(),
  status: buybackStatusSchema,
  created_at: z.string(),
});

export type BuybackCondition = z.infer<typeof buybackConditionSchema>;
export type BuybackStatus = z.infer<typeof buybackStatusSchema>;
export type BuybackRequest = z.infer<typeof buybackRequestSchema>;

export const buybackRequestListSchema = z.array(buybackRequestSchema);

/** Corps d'une demande d'estimation ou de création. */
export const buybackInputSchema = z.object({
  productId: z.coerce.number().int().positive(),
  condition: buybackConditionSchema,
  quantity: z.coerce.number().int().positive().default(1),
});

export type BuybackInput = z.infer<typeof buybackInputSchema>;

/** Estimation de reprise renvoyée par l'API. */
export const buybackEstimateSchema = z.object({
  amountEur: z.number(),
  productLabel: z.string(),
  segment: z.string().nullable(),
});

export type BuybackEstimate = z.infer<typeof buybackEstimateSchema>;
