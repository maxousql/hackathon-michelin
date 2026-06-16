import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';

describe('Status endpoint', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responds with a healthy status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/status')
      .expect(200);

    expect(response.body).toMatchObject({
      service: 'michelin-api',
      status: 'ok',
      version: '0.1.0',
    });
    expect(response.body.timestamp).toEqual(expect.any(String));
  });
});
