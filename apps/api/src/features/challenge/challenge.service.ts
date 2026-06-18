import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Challenge } from '@michelin/contracts';

import type { Environment } from '../../config/environment';

const CHALLENGE_COLUMNS =
  'id, name, description, strava_segment_id, strava_segment_url, ' +
  'location, distance_km, elevation_m, prize_label, prize_description, ' +
  'starts_at, ends_at, ' +
  'entries:challenge_entries(rank, athlete_name, club, time_seconds)';

@Injectable()
export class ChallengeService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService<Environment, true>) {
    this.supabase = createClient(
      config.get('SUPABASE_URL', { infer: true }),
      config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  /** Challenges et leur classement, du plus récent au plus ancien. */
  async list(): Promise<Challenge[]> {
    const { data, error } = await this.supabase
      .from('challenges')
      .select(CHALLENGE_COLUMNS)
      .order('starts_at', { ascending: false });

    if (error) {
      throw new Error(`Lecture des challenges impossible : ${error.message}`);
    }

    const challenges = (data ?? []) as unknown as Challenge[];

    // Classement trié par rang croissant (le rang 1 remporte le lot).
    for (const challenge of challenges) {
      challenge.entries.sort((a, b) => a.rank - b.rank);
    }

    return challenges;
  }
}
