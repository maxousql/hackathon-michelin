import { statusResponseSchema, type StatusResponse } from '@michelin/contracts';

export interface ApiClientOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
}

export interface ApiClient {
  getStatus(signal?: AbortSignal): Promise<StatusResponse>;
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

  return {
    async getStatus(signal) {
      let response: Response;

      try {
        response = await fetcher(`${normalizedBaseUrl}/status`, {
          headers: {
            Accept: 'application/json',
          },
          signal,
        });
      } catch (error) {
        throw new ApiClientError('Unable to reach the API.', undefined, {
          cause: error,
        });
      }

      if (!response.ok) {
        throw new ApiClientError(
          `The API returned HTTP ${response.status}.`,
          response.status,
        );
      }

      const payload: unknown = await response.json();
      const result = statusResponseSchema.safeParse(payload);

      if (!result.success) {
        throw new ApiClientError('The API returned an invalid payload.', 502, {
          cause: result.error,
        });
      }

      return result.data;
    },
  };
}
