import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { StatusResponse } from '@michelin/contracts';

import type { Environment } from '../../config/environment';

@Injectable()
export class StatusService {
  constructor(private readonly config: ConfigService<Environment, true>) {}

  getStatus(): StatusResponse {
    return {
      service: 'michelin-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: this.config.get('APP_VERSION', { infer: true }),
    };
  }
}
