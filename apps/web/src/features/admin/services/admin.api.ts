import { cookies } from 'next/headers';

import { createApiClient } from '@michelin/api-client';
import type { AdminUser } from '@michelin/contracts';

function getApiClient() {
  return createApiClient({
    baseUrl: process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1',
  });
}

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value ?? '';
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const token = await getToken();
  return getApiClient().getAdminUsers(token);
}

export async function patchAdminUser(
  id: string,
  isAdmin: boolean,
): Promise<void> {
  const token = await getToken();
  return getApiClient().updateAdminUser(token, id, isAdmin);
}

export async function removeAdminUser(id: string): Promise<void> {
  const token = await getToken();
  return getApiClient().deleteAdminUser(token, id);
}
