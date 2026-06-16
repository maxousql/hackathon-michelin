'use server';

import { buybackInputSchema, type ProductListItem } from '@michelin/contracts';
import { revalidatePath } from 'next/cache';

import { fetchProducts } from '@/features/products/services/products.api';

import { getAuthToken, getBuybackClient } from '../services/buyback.api';

/** Recherche de pneus dans le catalogue pour le sélecteur de reprise. */
export async function searchTiresAction(
  query: string,
): Promise<ProductListItem[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const result = await fetchProducts({ q, sort: 'range', page: 1 });
  return result.items.slice(0, 8);
}

export type CreateBuybackState =
  | { error: string }
  | { amountEur: number }
  | undefined;

/** Crée une demande de reprise pour le pneu et l'état sélectionnés. */
export async function createBuybackAction(
  _prev: CreateBuybackState,
  formData: FormData,
): Promise<CreateBuybackState> {
  const token = await getAuthToken();
  if (!token)
    return { error: 'Vous devez être connecté pour demander une reprise.' };

  const parsed = buybackInputSchema.safeParse({
    productId: formData.get('productId'),
    condition: formData.get('condition'),
    quantity: formData.get('quantity') ?? undefined,
  });
  if (!parsed.success) {
    return { error: 'Sélectionnez un pneu et son état avant d’envoyer.' };
  }

  try {
    const created = await getBuybackClient().createBuybackRequest(
      token,
      parsed.data,
    );
    revalidatePath('/reprise');
    return { amountEur: created.estimated_amount_eur };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'La demande a échoué. Réessayez.',
    };
  }
}
