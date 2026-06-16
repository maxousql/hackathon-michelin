import { ApiClientError, createApiClient } from '@michelin/api-client';
import type {
  MichelinProduct,
  ProductFacets,
  ProductFilters,
  ProductListResponse,
} from '@michelin/contracts';

function getClient() {
  return createApiClient({
    baseUrl: process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1',
  });
}

/** Liste paginée et filtrée du catalogue (via l'API NestJS). */
export function fetchProducts(
  filters: ProductFilters,
): Promise<ProductListResponse> {
  return getClient().getProducts(filters);
}

/** Valeurs distinctes proposées dans le panneau de filtres. */
export function fetchProductFacets(): Promise<ProductFacets> {
  return getClient().getProductFacets();
}

/** Détail d'un produit, ou `null` si l'API répond 404. */
export async function fetchProduct(
  id: number,
): Promise<MichelinProduct | null> {
  try {
    return await getClient().getProduct(id);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
