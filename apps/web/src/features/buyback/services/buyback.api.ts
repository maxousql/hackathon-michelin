import { createApiClient } from '@michelin/api-client';
import type { BuybackRequest } from '@michelin/contracts';
import { cookies } from 'next/headers';

export function getBuybackClient() {
  return createApiClient({
    baseUrl: process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1',
  });
}

/** Jeton d'auth stocké dans le cookie httpOnly (côté serveur uniquement). */
export async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get('auth_token')?.value ?? null;
}

/**
 * Demandes de reprise de l'utilisateur connecté (vide si non connecté ou si
 * l'API est indisponible — la page reste affichable).
 */
export async function fetchMyBuybackRequests(): Promise<BuybackRequest[]> {
  const token = await getAuthToken();
  if (!token) return [];
  try {
    return await getBuybackClient().getMyBuybackRequests(token);
  } catch {
    return [];
  }
}
