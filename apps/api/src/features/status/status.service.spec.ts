import { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';

import type { Environment } from '../../config/environment';
import { StatusService } from './status.service';

describe('StatusService', () => {
  it('returns the current API status', () => {
    const config = new ConfigService<Environment, true>({
      APP_VERSION: '0.1.0',
      CORS_ORIGIN: 'http://localhost:3000',
      NODE_ENV: 'test',
      PORT: 3001,
    });
    const service = new StatusService(config);

    expect(service.getStatus()).toMatchObject({
      service: 'michelin-api',
      status: 'ok',
      version: '0.1.0',
    });
  });
});
