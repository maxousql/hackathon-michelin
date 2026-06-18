import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Bike } from '@michelin/contracts';

import type { Environment } from '../../config/environment';
import type { CreateBikeDto } from './dto/create-bike.dto';
import type { UpdateBikeDto } from './dto/update-bike.dto';

interface BikeRow {
  id: string;
  name: string;
  type: string;
  distance_km: number;
  tire_diameter: string | null;
  tire_width: string | null;
  tire_sealing: string | null;
  riding_surface: string | null;
  riding_priority: string | null;
  is_ebike: boolean | null;
  is_primary: boolean;
  created_at: string;
}

const BIKE_COLUMNS = [
  'id',
  'name',
  'type',
  'distance_km',
  'tire_diameter',
  'tire_width',
  'tire_sealing',
  'riding_surface',
  'riding_priority',
  'is_ebike',
  'is_primary',
  'created_at',
].join(', ');

function cleanOptional(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toDto(row: BikeRow): Bike {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Bike['type'],
    distanceKm: row.distance_km,
    tireDiameter: row.tire_diameter,
    tireWidth: row.tire_width,
    tireSealing: row.tire_sealing as Bike['tireSealing'],
    ridingSurface: (row.riding_surface ?? 'mixed') as Bike['ridingSurface'],
    ridingPriority: (row.riding_priority ??
      'versatility') as Bike['ridingPriority'],
    isEbike: row.is_ebike ?? false,
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
      .select(BIKE_COLUMNS)
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as unknown as BikeRow[]).map(toDto);
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
        tire_diameter: cleanOptional(dto.tireDiameter),
        tire_width: cleanOptional(dto.tireWidth),
        tire_sealing: dto.tireSealing ?? null,
        riding_surface: dto.ridingSurface ?? 'mixed',
        riding_priority: dto.ridingPriority ?? 'versatility',
        is_ebike: dto.isEbike ?? false,
        is_primary: dto.isPrimary,
      })
      .select(BIKE_COLUMNS)
      .single();

    if (error) throw new Error(error.message);
    return toDto(data as unknown as BikeRow);
  }

  async update(userId: string, id: string, dto: UpdateBikeDto): Promise<Bike> {
    if (dto.isPrimary === true) {
      await this.supabase
        .from('bikes')
        .update({ is_primary: false })
        .eq('user_id', userId);
    }

    const values: Record<string, unknown> = {};

    if (dto.name !== undefined) values.name = dto.name;
    if (dto.type !== undefined) values.type = dto.type;
    if (dto.distanceKm !== undefined) values.distance_km = dto.distanceKm;
    if (dto.tireDiameter !== undefined)
      values.tire_diameter = cleanOptional(dto.tireDiameter);
    if (dto.tireWidth !== undefined)
      values.tire_width = cleanOptional(dto.tireWidth);
    if (dto.tireSealing !== undefined)
      values.tire_sealing = dto.tireSealing ?? null;
    if (dto.ridingSurface !== undefined)
      values.riding_surface = dto.ridingSurface;
    if (dto.ridingPriority !== undefined)
      values.riding_priority = dto.ridingPriority;
    if (dto.isEbike !== undefined) values.is_ebike = dto.isEbike;
    if (dto.isPrimary !== undefined) values.is_primary = dto.isPrimary;
    const { data, error } = await this.supabase
      .from('bikes')
      .update(values)
      .eq('id', id)
      .eq('user_id', userId)
      .select(BIKE_COLUMNS)
      .single();

    if (error) throw new Error(error.message);
    return toDto(data as unknown as BikeRow);
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
