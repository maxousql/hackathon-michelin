import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock du query builder PostgREST : chaque méthode de filtre renvoie le builder,
// et le builder est « thenable » pour résoudre la requête finale (await).
const mocks = vi.hoisted(() => {
  const state: {
    result: { data: unknown; error: unknown; count: number | null };
  } = {
    result: { data: [], error: null, count: 0 },
  };
  const builder: Record<string, unknown> = {};
  for (const method of [
    'select',
    'eq',
    'in',
    'not',
    'or',
    'order',
    'range',
    'limit',
  ]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.maybeSingle = vi.fn(() => Promise.resolve(state.result));
  builder.then = (resolve: (value: unknown) => unknown) =>
    resolve(state.result);

  const from = vi.fn(() => builder);
  return { from, builder, state };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: mocks.from }),
}));

import { ProductsService } from './products.service';

const config = new ConfigService({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
});

const baseFilters = { sort: 'range', page: 1 } as const;

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.result = { data: [], error: null, count: 0 };
    service = new ProductsService(config as never);
  });

  describe('list()', () => {
    it('returns the items and the total count', async () => {
      mocks.state.result = {
        data: [{ id: 1 }, { id: 2 }],
        error: null,
        count: 441,
      };

      const result = await service.list({ ...baseFilters });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(441);
    });

    it('applies the active filters to the query', async () => {
      await service.list({
        ...baseFilters,
        cycleType: 'MTB',
        productType: 'TYRE',
        sealing: 'TUBELESS READY',
        ebike: true,
        q: 'power',
      });

      expect(mocks.builder.eq).toHaveBeenCalledWith('cycle_type', 'MTB');
      expect(mocks.builder.eq).toHaveBeenCalledWith('product_type', 'TYRE');
      expect(mocks.builder.eq).toHaveBeenCalledWith(
        'sealing',
        'TUBELESS READY',
      );
      expect(mocks.builder.not).toHaveBeenCalledWith(
        'e_bike_technologies',
        'is',
        null,
      );
      expect(mocks.builder.or).toHaveBeenCalledTimes(1);
    });

    it('computes the pagination range from the page number', async () => {
      await service.list({ ...baseFilters, page: 3 });

      // Page 3, 24 par page : lignes 48 → 71.
      expect(mocks.builder.range).toHaveBeenCalledWith(48, 71);
    });

    it('throws when Supabase returns an error', async () => {
      mocks.state.result = {
        data: null,
        error: { message: 'boom' },
        count: null,
      };

      await expect(service.list({ ...baseFilters })).rejects.toThrow(
        'Lecture du catalogue impossible',
      );
    });
  });

  describe('getById()', () => {
    it('returns the product when it exists', async () => {
      mocks.state.result = {
        data: { id: 5, brand: 'MICHELIN' },
        error: null,
        count: null,
      };

      const result = await service.getById(5);

      expect(result).toMatchObject({ id: 5, brand: 'MICHELIN' });
      expect(mocks.builder.eq).toHaveBeenCalledWith('id', 5);
    });

    it('returns null when the product is missing', async () => {
      mocks.state.result = { data: null, error: null, count: null };

      expect(await service.getById(5)).toBeNull();
    });

    it('throws when Supabase returns an error', async () => {
      mocks.state.result = {
        data: null,
        error: { message: 'boom' },
        count: null,
      };

      await expect(service.getById(5)).rejects.toThrow(
        'Lecture du produit impossible',
      );
    });
  });

  describe('getByIds()', () => {
    it('returns products in the requested order', async () => {
      mocks.state.result = {
        data: [
          { id: 8, brand: 'MICHELIN' },
          { id: 3, brand: 'MICHELIN' },
        ],
        error: null,
        count: null,
      };

      const result = await service.getByIds([3, 8]);

      expect(result.map((product) => product.id)).toEqual([3, 8]);
      expect(mocks.builder.in).toHaveBeenCalledWith('id', [3, 8]);
    });

    it('deduplicates ids before querying Supabase', async () => {
      mocks.state.result = {
        data: [{ id: 3, brand: 'MICHELIN' }],
        error: null,
        count: null,
      };

      await service.getByIds([3, 3]);

      expect(mocks.builder.in).toHaveBeenCalledWith('id', [3]);
    });

    it('throws when Supabase returns an error', async () => {
      mocks.state.result = {
        data: null,
        error: { message: 'boom' },
        count: null,
      };

      await expect(service.getByIds([3, 8])).rejects.toThrow(
        'Lecture des produits impossible',
      );
    });
  });

  describe('facets()', () => {
    it('returns distinct, sorted values and ignores empties', async () => {
      mocks.state.result = {
        data: [
          {
            cycle_type: 'ROAD',
            segment: 'ACCESS LINE',
            product_type: 'TYRE',
            sealing: 'TUBE TYPE',
            web_diameter: '700',
            web_width: '25',
          },
          {
            cycle_type: 'MTB',
            segment: 'ACCESS LINE',
            product_type: 'TYRE',
            sealing: '',
            web_diameter: null,
            web_width: '25',
          },
          {
            cycle_type: 'ROAD',
            segment: 'PREMIUM RACING LINE',
            product_type: 'TUBE',
            sealing: 'TUBELESS READY',
            web_diameter: '650',
            web_width: '28',
          },
        ],
        error: null,
        count: 3,
      };

      const facets = await service.facets();

      expect(facets.cycleType).toEqual(['MTB', 'ROAD']);
      expect(facets.segment).toEqual(['ACCESS LINE', 'PREMIUM RACING LINE']);
      expect(facets.productType).toEqual(['TUBE', 'TYRE']);
      expect(facets.diameter).toEqual(['650', '700']);
      expect(facets.width).toEqual(['25', '28']);
      expect(facets.sealing).toHaveLength(2);
    });

    it('throws when Supabase returns an error', async () => {
      mocks.state.result = {
        data: null,
        error: { message: 'boom' },
        count: null,
      };

      await expect(service.facets()).rejects.toThrow(
        'Lecture des filtres impossible',
      );
    });
  });
});
