import {
  authResponseSchema,
  authUserSchema,
  michelinProductSchema,
  productFacetsSchema,
  productListResponseSchema,
  statusResponseSchema,
  type AuthResponse,
  type AuthUser,
  type LoginRequest,
  type MichelinProduct,
  type ProductFacets,
  type ProductFilters,
  type ProductListResponse,
  type RegisterRequest,
  type StatusResponse,
} from '@michelin/contracts';

export interface ApiClientOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
}

export interface ApiClient {
  getStatus(signal?: AbortSignal): Promise<StatusResponse>;
  register(data: RegisterRequest, signal?: AbortSignal): Promise<AuthResponse>;
  login(data: LoginRequest, signal?: AbortSignal): Promise<AuthResponse>;
  getMe(token: string, signal?: AbortSignal): Promise<AuthUser>;
  getProducts(
    filters: ProductFilters,
    signal?: AbortSignal,
  ): Promise<ProductListResponse>;
  getProductFacets(signal?: AbortSignal): Promise<ProductFacets>;
  getProduct(id: number, signal?: AbortSignal): Promise<MichelinProduct>;
}

/** Sérialise les filtres catalogue en query string (omet les valeurs vides). */
function serializeProductFilters(filters: ProductFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.cycleType) params.set('cycleType', filters.cycleType);
  if (filters.segment) params.set('segment', filters.segment);
  if (filters.productType) params.set('productType', filters.productType);
  if (filters.sealing) params.set('sealing', filters.sealing);
  if (filters.diameter) params.set('diameter', filters.diameter);
  if (filters.width) params.set('width', filters.width);
  if (filters.ebike) params.set('ebike', '1');
  if (filters.sort !== 'range') params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : '';
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ApiClientError';
  }
}

export function createApiClient({
  baseUrl,
  fetcher = fetch,
}: ApiClientOptions): ApiClient {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  async function request<T>(
    path: string,
    options: RequestInit & {
      schema: {
        safeParse: (
          v: unknown,
        ) => { success: true; data: T } | { success: false; error: unknown };
      };
    },
    signal?: AbortSignal,
  ): Promise<T> {
    let response: Response;
    const { schema, ...init } = options;

    try {
      response = await fetcher(`${normalizedBaseUrl}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...init.headers,
        },
        signal,
      });
    } catch (error) {
      throw new ApiClientError('Unable to reach the API.', undefined, {
        cause: error,
      });
    }

    if (!response.ok) {
      let message = `The API returned HTTP ${response.status}.`;
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) message = String(body.message);
      } catch {
        // ignore parse error
      }
      throw new ApiClientError(message, response.status);
    }

    const payload: unknown = await response.json();
    const result = schema.safeParse(payload);

    if (!result.success) {
      throw new ApiClientError('The API returned an invalid payload.', 502, {
        cause: result.error,
      });
    }

    return result.data;
  }

  return {
    getStatus(signal) {
      return request('/status', { schema: statusResponseSchema }, signal);
    },

    register(data, signal) {
      return request(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(data),
          schema: authResponseSchema,
        },
        signal,
      );
    },

    login(data, signal) {
      return request(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(data),
          schema: authResponseSchema,
        },
        signal,
      );
    },

    getMe(token, signal) {
      return request(
        '/auth/me',
        {
          headers: { Authorization: `Bearer ${token}` },
          schema: authUserSchema,
        },
        signal,
      );
    },

    getProducts(filters, signal) {
      return request(
        `/products${serializeProductFilters(filters)}`,
        { schema: productListResponseSchema },
        signal,
      );
    },

    getProductFacets(signal) {
      return request(
        '/products/facets',
        { schema: productFacetsSchema },
        signal,
      );
    },

    getProduct(id, signal) {
      return request(
        `/products/${id}`,
        { schema: michelinProductSchema },
        signal,
      );
    },
  };
}
