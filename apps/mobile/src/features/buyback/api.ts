import { createApiClient } from '@michelin/api-client';

import { apiBaseUrl } from '../../config/api';

/** Client API partagé par l'écran de reprise. */
export const buybackClient = createApiClient({ baseUrl: apiBaseUrl });
