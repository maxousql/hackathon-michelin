import { z } from 'zod';

/** Revendeur partenaire (« où acheter »). */
export const retailerSchema = z.object({
  id: z.string().uuid(),
  region: z.string(),
  country: z.string(),
  name: z.string(),
  website: z.string(),
});

export type Retailer = z.infer<typeof retailerSchema>;

export const retailerListSchema = z.array(retailerSchema);
