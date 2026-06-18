import { z } from 'zod';

const environmentSchema = z.object({
  APP_VERSION: z.string().min(1).default('0.1.0'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  OPENWEATHER_API_KEY: z.string().optional(),
  STRAVA_CLIENT_ID: z.string().optional(),
  STRAVA_CLIENT_SECRET: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3001),
  SUPABASE_JWT_SECRET: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_URL: z.string().url(),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(config: Record<string, unknown>) {
  return environmentSchema.parse(config);
}
