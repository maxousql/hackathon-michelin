import { z } from 'zod';

/** Une ligne du classement d'un challenge (un effort sur le segment). */
export const challengeEntrySchema = z.object({
  rank: z.number().int().positive(),
  athlete_name: z.string(),
  club: z.string().nullable(),
  time_seconds: z.number().int().nonnegative(),
});

export type ChallengeEntry = z.infer<typeof challengeEntrySchema>;

/** Un challenge : un segment Strava à battre, un lot à gagner, un classement. */
export const challengeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  strava_segment_id: z.string(),
  strava_segment_url: z.string().url(),
  location: z.string().nullable(),
  distance_km: z.coerce.number().nullable(),
  elevation_m: z.coerce.number().int().nullable(),
  prize_label: z.string(),
  prize_description: z.string().nullable(),
  starts_at: z.string(),
  ends_at: z.string(),
  entries: z.array(challengeEntrySchema),
});

export type Challenge = z.infer<typeof challengeSchema>;

export const challengeListSchema = z.array(challengeSchema);
