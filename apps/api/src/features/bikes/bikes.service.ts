import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Bike } from '@michelin/contracts';

import type { Environment } from '../../config/environment';
import type { CreateBikeDto } from './dto/create-bike.dto';

interface BikeRow {
  id: string;
  name: string;
  type: string;
  distance_km: number;
  is_primary: boolean;
  created_at: string;
}

function toDto(row: BikeRow): Bike {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Bike['type'],
    distanceKm: row.distance_km,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  };
}

@Injectable()
export class BikesService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService<Environment, true>) {
    this.supabase = createClient(
      config.get('SUPABASE_URL', { infer: true }),
      config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  async list(userId: string): Promise<Bike[]> {
    const { data, error } = await this.supabase
      .from('bikes')
      .select('id, name, type, distance_km, is_primary, created_at')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as BikeRow[]).map(toDto);
  }

  async create(userId: string, dto: CreateBikeDto): Promise<Bike> {
    if (dto.isPrimary) {
      await this.supabase
        .from('bikes')
        .update({ is_primary: false })
        .eq('user_id', userId);
    }

    const { data, error } = await this.supabase
      .from('bikes')
      .insert({
        user_id: userId,
        name: dto.name,
        type: dto.type,
        distance_km: dto.distanceKm,
        is_primary: dto.isPrimary,
      })
      .select('id, name, type, distance_km, is_primary, created_at')
      .single();

    if (error) throw new Error(error.message);
    return toDto(data as BikeRow);
  }

  async remove(userId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from('bikes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }
}
