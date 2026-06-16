import { createApiClient } from '@michelin/api-client';

import { apiBaseUrl } from '../../config/api';

/** Client API partagé par les hooks du catalogue. */
export const productsClient = createApiClient({ baseUrl: apiBaseUrl });
