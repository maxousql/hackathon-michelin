import { createApiClient } from '@michelin/api-client';

function getApiBaseUrl() {
  return process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1';
}

export async function getStatus() {
  const client = createApiClient({
    baseUrl: getApiBaseUrl(),
  });

  return client.getStatus();
}
