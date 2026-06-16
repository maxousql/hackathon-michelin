import { ApiClientError } from '@michelin/api-client';
import type { MichelinProduct } from '@michelin/contracts';
import { useEffect, useState } from 'react';

import { productsClient } from '../api';

interface ProductState {
  data: MichelinProduct | null;
  error: string | null;
  isLoading: boolean;
  notFound: boolean;
}

/** Détail d'un produit par identifiant. */
export function useProduct(id: number): ProductState {
  const [state, setState] = useState<ProductState>({
    data: null,
    error: null,
    isLoading: true,
    notFound: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    productsClient
      .getProduct(id, controller.signal)
      .then((data) =>
        setState({ data, error: null, isLoading: false, notFound: false }),
      )
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiClientError && error.status === 404) {
          setState({
            data: null,
            error: null,
            isLoading: false,
            notFound: true,
          });
          return;
        }
        setState({
          data: null,
          error: error instanceof Error ? error.message : 'Erreur inconnue.',
          isLoading: false,
          notFound: false,
        });
      });

    return () => controller.abort();
  }, [id]);

  return state;
}
