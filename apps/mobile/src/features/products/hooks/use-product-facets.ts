import type { ProductFacets } from '@michelin/contracts';
import { useEffect, useState } from 'react';

import { productsClient } from '../api';

interface FacetsState {
  data: ProductFacets | null;
  error: string | null;
  isLoading: boolean;
}

/** Valeurs distinctes proposées pour les filtres, chargées une fois. */
export function useProductFacets(): FacetsState {
  const [state, setState] = useState<FacetsState>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    productsClient
      .getProductFacets(controller.signal)
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
  }, []);

  return state;
}
