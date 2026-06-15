import { createApiClient } from '@michelin/api-client';
import type { StatusResponse } from '@michelin/contracts';
import { useEffect, useState } from 'react';

import { apiBaseUrl } from '../../../config/api';

interface StatusState {
  data: StatusResponse | null;
  error: string | null;
  isLoading: boolean;
}

const client = createApiClient({ baseUrl: apiBaseUrl });

export function useStatus(): StatusState {
  const [state, setState] = useState<StatusState>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    client
      .getStatus(controller.signal)
      .then((data) => {
        setState({ data, error: null, isLoading: false });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          data: null,
          error:
            error instanceof Error
              ? error.message
              : 'Une erreur inconnue est survenue.',
          isLoading: false,
        });
      });

    return () => {
      controller.abort();
    };
  }, []);

  return state;
}
