import {
  authResponseSchema,
  authUserSchema,
  type AuthResponse,
  type AuthUser,
  type LoginRequest,
  type RegisterRequest,
  statusResponseSchema,
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
  };
}
