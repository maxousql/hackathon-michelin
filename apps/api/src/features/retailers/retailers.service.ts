import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Retailer } from '@michelin/contracts';

import type { Environment } from '../../config/environment';

interface RetailerFilters {
  country?: string;
  region?: string;
}

@Injectable()
export class RetailersService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService<Environment, true>) {
    this.supabase = createClient(
      config.get('SUPABASE_URL', { infer: true }),
      config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  /** Revendeurs partenaires, filtrables par pays / région, triés par nom. */
  async list(filters: RetailerFilters): Promise<Retailer[]> {
    let query = this.supabase
      .from('retailers')
      .select('id, region, country, name, website');

    if (filters.country) query = query.eq('country', filters.country);
    if (filters.region) query = query.eq('region', filters.region);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) {
      throw new Error(`Lecture des revendeurs impossible : ${error.message}`);
    }

    return (data ?? []) as unknown as Retailer[];
  }
}
