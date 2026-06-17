import { describe, expect, it, vi } from 'vitest';

import { ApiClientError, createApiClient } from './client';

const AUTH_RESPONSE = {
  accessToken: 'mock-token',
  user: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    isAdmin: false,
  },
};

describe('createApiClient', () => {
  it('returns a validated status payload', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          service: 'michelin-api',
          status: 'ok',
          timestamp: '2026-06-15T12:00:00.000Z',
          version: '0.1.0',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      ),
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3001/api/v1/',
      fetcher,
    });

    await expect(client.getStatus()).resolves.toMatchObject({
      service: 'michelin-api',
      status: 'ok',
    });
    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/status',
      expect.any(Object),
    );
  });

  it('raises a typed error on an invalid payload', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ status: 'ok' })));

    const client = createApiClient({
      baseUrl: 'http://localhost:3001/api/v1',
      fetcher,
    });

    await expect(client.getStatus()).rejects.toBeInstanceOf(ApiClientError);
  });
});

describe('createApiClient — auth', () => {
  it('login() posts credentials and returns a validated auth response', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(AUTH_RESPONSE), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3001/api/v1',
      fetcher,
    });
    const result = await client.login({
      email: 'jane@example.com',
      password: 'Password1!',
    });

    expect(result.accessToken).toBe('mock-token');
    expect(result.user.email).toBe('jane@example.com');
    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/auth/login',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('register() posts registration data and returns a validated auth response', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(AUTH_RESPONSE), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3001/api/v1',
      fetcher,
    });
    const result = await client.register({
      email: 'jane@example.com',
      password: 'Password1!',
      firstName: 'Jane',
      lastName: 'Doe',
    });

    expect(result.accessToken).toBe('mock-token');
    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/auth/register',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('login() throws ApiClientError on HTTP 401', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Invalid email or password.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      }),
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3001/api/v1',
      fetcher,
    });

    await expect(
      client.login({ email: 'jane@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(ApiClientError);
  });

  it('register() throws ApiClientError on HTTP 409 (duplicate email)', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Email already in use.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 409,
      }),
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3001/api/v1',
      fetcher,
    });

    await expect(
      client.register({
        email: 'existing@example.com',
        password: 'Password1!',
        firstName: 'Jane',
        lastName: 'Doe',
      }),
    ).rejects.toBeInstanceOf(ApiClientError);
  });

  it('getMe() sends the Authorization header and returns the user', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(AUTH_RESPONSE.user), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3001/api/v1',
      fetcher,
    });
    await client.getMe('mock-token');

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      }),
    );
  });
});

describe('createApiClient — comparator', () => {
  it('compareTires() posts the benchmark input and returns the validated response', async () => {
    const response = {
      recommendedProductId: 2,
      routeSummary: ['118 km', '1750 m de D+'],
      results: [
        {
          product: {
            id: 1,
            name: 'Power Cup',
            productType: 'TYRE',
            range: 'Power',
            cycleType: 'ROAD',
            segment: 'Racing',
            size: '700 x 28',
            widthEtrto: '28',
            diameterEtrto: '622',
            type: null,
            valve: null,
            valveLength: null,
            rimType: null,
            fitting: null,
            sealing: 'Tubeless Ready',
            weight: '250 g',
            pressureRange: 'Pression : 5 - 7 bar',
            terrainTypes: 'Road',
            use: 'Race',
            technologies: ['Grip Compound'],
          },
          scores: {
            overall: 82,
            routeFit: 80,
            rollingEfficiency: 92,
            grip: 75,
            punctureProtection: 70,
            durability: 72,
          },
          advantages: ['Très bon rendement'],
          tradeoffs: ['Protection limitée sur routes dégradées'],
          technicalDetails: ['ETRTO : 28-622'],
          equivalenceNote: null,
          verdict: 'Rapide, mais moins sécurisant sur très longue distance.',
        },
        {
          product: {
            id: 2,
            name: 'Power Endurance',
            productType: 'TYRE',
            range: 'Power',
            cycleType: 'ROAD',
            segment: 'Performance',
            size: '700 x 28',
            widthEtrto: '28',
            diameterEtrto: '622',
            type: null,
            valve: null,
            valveLength: null,
            rimType: null,
            fitting: null,
            sealing: 'Tube Type',
            weight: '300 g',
            pressureRange: 'Pression : 5 - 7 bar',
            terrainTypes: 'Road',
            use: 'Endurance',
            technologies: ['Bead 2 Bead Protek'],
          },
          scores: {
            overall: 86,
            routeFit: 88,
            rollingEfficiency: 78,
            grip: 80,
            punctureProtection: 90,
            durability: 92,
          },
          advantages: ['Protection adaptée à la distance'],
          tradeoffs: ['Rendement moins explosif'],
          technicalDetails: ['ETRTO : 28-622'],
          equivalenceNote: null,
          verdict: 'Le meilleur compromis pour ce parcours.',
        },
      ],
    };

    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3001/api/v1',
      fetcher,
    });

    await expect(
      client.compareTires({
        route: {
          source: 'gpx',
          surface: 'road',
          distanceKm: 118,
          elevationGainM: 1750,
        },
        selectedProductIds: [1, 2],
      }),
    ).resolves.toMatchObject({
      recommendedProductId: 2,
      results: expect.arrayContaining([
        expect.objectContaining({ verdict: expect.any(String) }),
      ]),
    });

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/comparator/benchmark',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
