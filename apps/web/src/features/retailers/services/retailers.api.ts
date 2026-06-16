import { createApiClient } from '@michelin/api-client';
import type { Retailer } from '@michelin/contracts';

function getClient() {
  return createApiClient({
    baseUrl: process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1',
  });
}

/**
 * Revendeurs partenaires (« où acheter »). Tolérant aux erreurs : renvoie une
 * liste vide si l'API est indisponible, pour ne pas casser la fiche produit.
 */
export async function fetchRetailers(): Promise<Retailer[]> {
  try {
    return await getClient().getRetailers();
  } catch {
    return [];
  }
}
