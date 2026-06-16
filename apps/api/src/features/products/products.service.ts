import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  MichelinProduct,
  ProductFacets,
  ProductFilters,
  ProductListItem,
  ProductListResponse,
} from '@michelin/contracts';

import type { Environment } from '../../config/environment';
import {
  FILTER_COLUMNS,
  PRODUCT_LIST_COLUMNS,
  PRODUCTS_PAGE_SIZE,
  PRODUCTS_TABLE,
  SEARCH_COLUMNS,
  sortColumn,
} from './products.columns';

// Plafond de lignes balayées pour calculer les valeurs distinctes des filtres.
const FACET_SCAN_LIMIT = 5000;

// Le query builder PostgREST est fortement générique ; on s'appuie sur ses
// méthodes chaînables sans en réimporter le type interne.
interface FilterableQuery {
  eq(column: string, value: string): FilterableQuery;
  not(column: string, operator: string, value: null): FilterableQuery;
  or(filters: string): FilterableQuery;
}

@Injectable()
export class ProductsService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService<Environment, true>) {
    // Clé service role : bypass de la RLS, lecture côté serveur uniquement.
    this.supabase = createClient(
      config.get('SUPABASE_URL', { infer: true }),
      config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  async list(filters: ProductFilters): Promise<ProductListResponse> {
    const from = (filters.page - 1) * PRODUCTS_PAGE_SIZE;
    const to = from + PRODUCTS_PAGE_SIZE - 1;

    const base = this.supabase
      .from(PRODUCTS_TABLE)
      .select(PRODUCT_LIST_COLUMNS, { count: 'exact' });

    const filtered = this.applyFilters(
      base as unknown as FilterableQuery,
      filters,
    ) as unknown as typeof base;

    const { data, error, count } = await filtered
      .order(sortColumn(filters.sort), { ascending: true, nullsFirst: false })
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Lecture du catalogue impossible : ${error.message}`);
    }

    const items = (data ?? []) as unknown as ProductListItem[];
    return { items, total: count ?? 0 };
  }

  async getById(id: number): Promise<MichelinProduct | null> {
    const { data, error } = await this.supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Lecture du produit impossible : ${error.message}`);
    }
    if (!data) return null;

    return data as unknown as MichelinProduct;
  }

  async facets(): Promise<ProductFacets> {
    const columns = Object.values(FILTER_COLUMNS).join(',');

    const { data, error } = await this.supabase
      .from(PRODUCTS_TABLE)
      .select(columns)
      .limit(FACET_SCAN_LIMIT);

    if (error) {
      throw new Error(`Lecture des filtres impossible : ${error.message}`);
    }

    const rows = (data ?? []) as unknown as Record<string, unknown>[];

    return {
      cycleType: this.distinct(rows, FILTER_COLUMNS.cycleType),
      segment: this.distinct(rows, FILTER_COLUMNS.segment),
      productType: this.distinct(rows, FILTER_COLUMNS.productType),
      sealing: this.distinct(rows, FILTER_COLUMNS.sealing),
      diameter: this.distinct(rows, FILTER_COLUMNS.diameter),
      width: this.distinct(rows, FILTER_COLUMNS.width),
    } satisfies ProductFacets;
  }

  private applyFilters(
    query: FilterableQuery,
    filters: ProductFilters,
  ): FilterableQuery {
    if (filters.cycleType)
      query = query.eq(FILTER_COLUMNS.cycleType, filters.cycleType);
    if (filters.segment)
      query = query.eq(FILTER_COLUMNS.segment, filters.segment);
    if (filters.productType) {
      query = query.eq(FILTER_COLUMNS.productType, filters.productType);
    }
    if (filters.sealing)
      query = query.eq(FILTER_COLUMNS.sealing, filters.sealing);
    if (filters.diameter)
      query = query.eq(FILTER_COLUMNS.diameter, filters.diameter);
    if (filters.width) query = query.eq(FILTER_COLUMNS.width, filters.width);
    if (filters.ebike) query = query.not('e_bike_technologies', 'is', null);

    if (filters.q) {
      const term = filters.q.replace(/[,()%*]/g, ' ').trim();
      if (term) {
        const clause = SEARCH_COLUMNS.map((c) => `${c}.ilike.%${term}%`).join(
          ',',
        );
        query = query.or(clause);
      }
    }

    return query;
  }

  private distinct(rows: Record<string, unknown>[], column: string): string[] {
    const values = new Set<string>();
    for (const row of rows) {
      const value = row[column];
      if (typeof value === 'string' && value.trim() !== '') {
        values.add(value.trim());
      }
    }
    return [...values].sort((a, b) =>
      a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' }),
    );
  }
}
