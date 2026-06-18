import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SavedRace } from '@michelin/contracts';

import type { Environment } from '../../config/environment';
import type { CreateSavedRaceDto } from './dto/create-saved-race.dto';

interface SavedRaceRow {
  id: string;
  race_name: string;
  race_date: string;
  location_name: string;
  surface: string;
  discipline: string;
  distance_km: number;
  elevation_gain_m: number;
  rider_weight_kg: number;
  result_json: Record<string, unknown>;
  created_at: string;
}

function toDto(row: SavedRaceRow): SavedRace {
  return {
    id: row.id,
    raceName: row.race_name,
    raceDate: row.race_date,
    locationName: row.location_name,
    surface: row.surface,
    discipline: row.discipline,
    distanceKm: row.distance_km,
    elevationGainM: row.elevation_gain_m,
    riderWeightKg: row.rider_weight_kg,
    result: row.result_json as SavedRace['result'],
    createdAt: row.created_at,
  };
}

@Injectable()
export class SavedRacesService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService<Environment, true>) {
    this.supabase = createClient(
      config.get('SUPABASE_URL', { infer: true }),
      config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  async list(userId: string): Promise<SavedRace[]> {
    const { data, error } = await this.supabase
      .from('saved_races')
      .select(
        'id, race_name, race_date, location_name, surface, discipline, distance_km, elevation_gain_m, rider_weight_kg, result_json, created_at',
      )
      .eq('user_id', userId)
      .order('race_date', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as SavedRaceRow[]).map(toDto);
  }

  async create(userId: string, dto: CreateSavedRaceDto): Promise<SavedRace> {
    const { data, error } = await this.supabase
      .from('saved_races')
      .insert({
        user_id: userId,
        race_name: dto.raceName,
        race_date: dto.raceDate,
        location_name: dto.locationName,
        surface: dto.surface,
        discipline: dto.discipline,
        distance_km: dto.distanceKm,
        elevation_gain_m: dto.elevationGainM,
        rider_weight_kg: dto.riderWeightKg,
        result_json: dto.result,
      })
      .select(
        'id, race_name, race_date, location_name, surface, discipline, distance_km, elevation_gain_m, rider_weight_kg, result_json, created_at',
      )
      .single();

    if (error) throw new Error(error.message);
    return toDto(data as SavedRaceRow);
  }

  async remove(userId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from('saved_races')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }
}
