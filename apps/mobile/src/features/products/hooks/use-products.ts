import type { ProductFilters, ProductListResponse } from '@michelin/contracts';
import { useEffect, useState } from 'react';

import { productsClient } from '../api';

interface ProductsState {
  data: ProductListResponse | null;
  error: string | null;
  isLoading: boolean;
}

/** Liste paginée et filtrée du catalogue. Recharge à chaque changement de filtres. */
export function useProducts(filters: ProductFilters): ProductsState {
  const [state, setState] = useState<ProductsState>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    productsClient
      .getProducts(filters, controller.signal)
      .then((data) => setState({ data, error: null, isLoading: false }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          error: error instanceof Error ? error.message : 'Erreur inconnue.',
          isLoading: false,
        });
      });

    return () => controller.abort();
  }, [filters]);

  return state;
}
