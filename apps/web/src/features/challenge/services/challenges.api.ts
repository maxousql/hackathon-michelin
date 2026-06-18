import { createApiClient } from '@michelin/api-client';
import type { Challenge } from '@michelin/contracts';

function getClient() {
  return createApiClient({
    baseUrl: process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1',
  });
}

/**
 * Challenges et leur classement. Tolérant aux erreurs : renvoie une liste vide
 * si l'API est indisponible, pour ne pas casser la page.
 */
export async function fetchChallenges(): Promise<Challenge[]> {
  try {
    return await getClient().getChallenges();
  } catch {
    return [];
  }
}
