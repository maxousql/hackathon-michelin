'use server';

import { ApiClientError, createApiClient } from '@michelin/api-client';
import {
  tireComparisonRequestSchema,
  type ProductListItem,
  type SurfaceType,
  type TireComparisonRequest,
  type TireComparisonResponse,
} from '@michelin/contracts';

import { fetchProducts } from '@/features/products/services/products.api';

export interface CompareTiresState {
  data: TireComparisonResponse | null;
  error: string | null;
}

export interface ComparatorProductSearchState {
  items: ProductListItem[];
  page: number;
  total: number;
  error: string | null;
}

export interface ComparatorTireSizeFilter {
  diameter?: string;
  width?: string;
}

function getClient() {
  return createApiClient({
    baseUrl: process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1',
  });
}

function surfaceToCycleType(surface: SurfaceType | null): string | undefined {
  if (surface === 'road') return 'ROAD';
  if (surface === 'mtb') return 'MTB';
  return undefined;
}

function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  return "Impossible de contacter l'API. Vérifiez que le serveur est démarré.";
}

export async function searchComparatorProductsAction(
  query: string,
  surface: SurfaceType | null,
  page: number,
  tireSize: ComparatorTireSizeFilter = {},
): Promise<ComparatorProductSearchState> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const diameter = tireSize.diameter?.trim();
  const width = tireSize.width?.trim();

  try {
    const list = await fetchProducts({
      q: query.trim() || undefined,
      cycleType: surfaceToCycleType(surface),
      diameter: diameter || undefined,
      page: safePage,
      productType: 'TYRE',
      sort: 'range',
      width: width || undefined,
    });
    return {
      items: list.items,
      page: safePage,
      total: list.total,
      error: null,
    };
  } catch (error) {
    return {
      items: [],
      page: safePage,
      total: 0,
      error: apiErrorMessage(error),
    };
  }
}

export async function compareTiresAction(
  request: TireComparisonRequest,
): Promise<CompareTiresState> {
  const parsed = tireComparisonRequestSchema.safeParse(request);

  if (!parsed.success) {
    return {
      data: null,
      error: 'Sélection invalide. Choisissez 2 à 3 pneus et un itinéraire.',
    };
  }

  try {
    const data = await getClient().compareTires(parsed.data);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: apiErrorMessage(error) };
  }
}
