import { createApiClient } from '@michelin/api-client';

import { apiBaseUrl } from '../../config/api';

export const raceClient = createApiClient({ baseUrl: apiBaseUrl });
