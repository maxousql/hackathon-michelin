import { z } from 'zod';

export const serviceStatusSchema = z.enum(['ok', 'degraded']);

export const statusResponseSchema = z.object({
  service: z.string().min(1),
  status: serviceStatusSchema,
  timestamp: z.iso.datetime(),
  version: z.string().min(1),
});

export type ServiceStatus = z.infer<typeof serviceStatusSchema>;
export type StatusResponse = z.infer<typeof statusResponseSchema>;
