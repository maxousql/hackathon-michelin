import { cookies } from 'next/headers';

import { createApiClient } from '@michelin/api-client';

const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: 'no-store' });

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    return await createApiClient({
      baseUrl: process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1',
      fetcher: noStoreFetch,
    }).getMe(token);
  } catch {
    return null;
  }
}
