import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { TirePassport } from '@michelin/contracts';

import type { Environment } from '../../config/environment';
import type { CreateTirePassportDto } from './dto/create-tire-passport.dto';
import type { UpdateTirePassportDto } from './dto/update-tire-passport.dto';

interface TirePassportRow {
  id: string;
  bike_id: string;
  product_id: number | null;
  tire_brand: string | null;
  tire_model: string | null;
  tire_name: string;
  tire_dimension: string | null;
  mounted_at: string;
  mounted_distance_km: number;
  reference_front_bar: number | null;
  reference_rear_bar: number | null;
  status: string;
  created_at: string;
  bikes?: { name: string | null } | null;
}

const TIRE_PASSPORT_COLUMNS = [
  'id',
  'bike_id',
  'product_id',
  'tire_brand',
  'tire_model',
  'tire_name',
  'tire_dimension',
  'mounted_at',
  'mounted_distance_km',
  'reference_front_bar',
  'reference_rear_bar',
  'status',
  'created_at',
  'bikes(name)',
].join(', ');

function cleanOptional(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function fallbackBrand(tireName: string): string {
  return tireName.toLowerCase().startsWith('michelin') ? 'Michelin' : 'Autre';
}

function fallbackModel(tireName: string): string {
  return tireName.replace(/^michelin\s+/i, '').trim() || tireName;
}

function toDto(row: TirePassportRow): TirePassport {
  return {
    id: row.id,
    bikeId: row.bike_id,
    bikeName: row.bikes?.name ?? null,
    productId: row.product_id,
    tireBrand: row.tire_brand ?? fallbackBrand(row.tire_name),
    tireModel: row.tire_model ?? fallbackModel(row.tire_name),
    tireName: row.tire_name,
    tireDimension: row.tire_dimension,
    mountedAt: row.mounted_at,
    mountedDistanceKm: row.mounted_distance_km,
    referenceFrontBar: row.reference_front_bar,
    referenceRearBar: row.reference_rear_bar,
    status: row.status as TirePassport['status'],
    createdAt: row.created_at,
  };
}

@Injectable()
export class TirePassportsService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService<Environment, true>) {
    this.supabase = createClient(
      config.get('SUPABASE_URL', { infer: true }),
      config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  async list(userId: string): Promise<TirePassport[]> {
    const { data, error } = await this.supabase
      .from('tire_passports')
      .select(TIRE_PASSPORT_COLUMNS)
      .eq('user_id', userId)
      .order('mounted_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as unknown as TirePassportRow[]).map(toDto);
  }

  async create(
    userId: string,
    dto: CreateTirePassportDto,
  ): Promise<TirePassport> {
    const bikeId = await this.ensureOwnBike(userId, dto.bikeId);

    const { error: retireError } = await this.supabase
      .from('tire_passports')
      .update({ status: 'retired' })
      .eq('user_id', userId)
      .eq('bike_id', bikeId)
      .eq('status', 'active');

    if (retireError) throw new Error(retireError.message);

    const { data, error } = await this.supabase
      .from('tire_passports')
      .insert({
        user_id: userId,
        bike_id: bikeId,
        product_id: dto.productId ?? null,
        tire_brand: dto.tireBrand,
        tire_model: dto.tireModel,
        tire_name: dto.tireName,
        tire_dimension: cleanOptional(dto.tireDimension),
        mounted_at: dto.mountedAt,
        mounted_distance_km: dto.mountedDistanceKm ?? 0,
        reference_front_bar: dto.referenceFrontBar ?? null,
        reference_rear_bar: dto.referenceRearBar ?? null,
      })
      .select(TIRE_PASSPORT_COLUMNS)
      .single();

    if (error) throw new Error(error.message);
    return toDto(data as unknown as TirePassportRow);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTirePassportDto,
  ): Promise<TirePassport> {
    const values: Record<string, unknown> = {};
    let current: TirePassport | null = null;

    if (dto.bikeId !== undefined || dto.status === 'active') {
      current = await this.getOwnedPassport(userId, id);
    }

    if (dto.bikeId !== undefined) {
      values.bike_id = await this.ensureOwnBike(userId, dto.bikeId);
    }

    if (dto.productId !== undefined) values.product_id = dto.productId ?? null;
    if (dto.tireBrand !== undefined) values.tire_brand = dto.tireBrand;
    if (dto.tireModel !== undefined) values.tire_model = dto.tireModel;
    if (dto.tireName !== undefined) values.tire_name = dto.tireName;
    if (dto.tireDimension !== undefined)
      values.tire_dimension = cleanOptional(dto.tireDimension);
    if (dto.mountedAt !== undefined) values.mounted_at = dto.mountedAt;
    if (dto.mountedDistanceKm !== undefined)
      values.mounted_distance_km = dto.mountedDistanceKm;
    if (dto.referenceFrontBar !== undefined)
      values.reference_front_bar = dto.referenceFrontBar ?? null;
    if (dto.referenceRearBar !== undefined)
      values.reference_rear_bar = dto.referenceRearBar ?? null;
    if (dto.status !== undefined) values.status = dto.status;

    if (Object.keys(values).length === 0) {
      return this.getOwnedPassport(userId, id);
    }

    const targetBikeId =
      (values.bike_id as string | undefined) ?? current?.bikeId;
    const targetStatus = dto.status ?? current?.status;

    if (targetBikeId && targetStatus === 'active') {
      const { error: retireError } = await this.supabase
        .from('tire_passports')
        .update({ status: 'retired' })
        .eq('user_id', userId)
        .eq('bike_id', targetBikeId)
        .eq('status', 'active')
        .neq('id', id);

      if (retireError) throw new Error(retireError.message);
    }

    const { data, error } = await this.supabase
      .from('tire_passports')
      .update(values)
      .eq('id', id)
      .eq('user_id', userId)
      .select(TIRE_PASSPORT_COLUMNS)
      .single();

    if (error) throw new Error(error.message);
    return toDto(data as unknown as TirePassportRow);
  }

  async remove(userId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from('tire_passports')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  private async getOwnedPassport(
    userId: string,
    id: string,
  ): Promise<TirePassport> {
    const { data, error } = await this.supabase
      .from('tire_passports')
      .select(TIRE_PASSPORT_COLUMNS)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new NotFoundException('Tire passport not found');
    return toDto(data as unknown as TirePassportRow);
  }

  private async ensureOwnBike(userId: string, bikeId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('bikes')
      .select('id')
      .eq('id', bikeId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new BadRequestException('Bike does not belong to user');
    return bikeId;
  }
}
