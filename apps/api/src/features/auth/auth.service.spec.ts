import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks must be hoisted so they are available when vi.mock() factory runs.
const mocks = vi.hoisted(() => {
  const single = vi.fn();
  const insert = vi.fn();
  const upsert = vi.fn();
  const eq = vi.fn();
  const select = vi.fn();

  const fromResult = { select, eq, single, insert, upsert };
  select.mockReturnValue(fromResult);
  eq.mockReturnValue(fromResult);

  const from = vi.fn().mockReturnValue(fromResult);
  const createUser = vi.fn();
  const signInWithPassword = vi.fn();

  return { from, single, upsert, insert, createUser, signInWithPassword };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      admin: { createUser: mocks.createUser },
      signInWithPassword: mocks.signInWithPassword,
    },
    from: mocks.from,
  }),
}));

import { AuthService } from './auth.service';

const config = new ConfigService({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  SUPABASE_JWT_SECRET: 'test-jwt-secret',
  NODE_ENV: 'test',
});

const REGISTER_DTO = {
  email: 'jane@example.com',
  password: 'Password1!',
  firstName: 'Jane',
  lastName: 'Doe',
};

const MOCK_USER = { id: '550e8400-e29b-41d4-a716-446655440000' };
const MOCK_SESSION = { access_token: 'mock-jwt-token' };
const MOCK_PROFILE = { first_name: 'Jane', last_name: 'Doe' };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(config as never);
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('returns an access token and user on success', async () => {
      mocks.createUser.mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      });
      mocks.upsert.mockResolvedValue({ error: null });
      mocks.signInWithPassword.mockResolvedValue({
        data: { session: MOCK_SESSION, user: MOCK_USER },
        error: null,
      });

      const result = await service.register(REGISTER_DTO);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toMatchObject({
        id: MOCK_USER.id,
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
      });
    });

    it('throws ConflictException when email is already in use', async () => {
      mocks.createUser.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      await expect(service.register(REGISTER_DTO)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws InternalServerErrorException on unexpected Supabase error', async () => {
      mocks.createUser.mockResolvedValue({
        data: null,
        error: { message: 'Database unavailable' },
      });

      await expect(service.register(REGISTER_DTO)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws if sign-in after registration fails', async () => {
      mocks.createUser.mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      });
      mocks.upsert.mockResolvedValue({ error: null });
      mocks.signInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: 'Sign-in failed' },
      });

      await expect(service.register(REGISTER_DTO)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('returns an access token and profile on success', async () => {
      mocks.signInWithPassword.mockResolvedValue({
        data: {
          session: MOCK_SESSION,
          user: {
            id: MOCK_USER.id,
            email: 'jane@example.com',
            user_metadata: { firstName: 'Jane', lastName: 'Doe' },
          },
        },
        error: null,
      });
      mocks.single.mockResolvedValue({ data: MOCK_PROFILE });

      const result = await service.login({
        email: 'jane@example.com',
        password: 'Password1!',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.firstName).toBe('Jane');
    });

    it('throws UnauthorizedException on wrong credentials', async () => {
      mocks.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        service.login({ email: 'jane@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── getUserProfile ────────────────────────────────────────────────────────

  describe('getUserProfile()', () => {
    it('returns the user profile when it exists', async () => {
      mocks.single.mockResolvedValue({ data: MOCK_PROFILE });

      const result = await service.getUserProfile(
        MOCK_USER.id,
        'jane@example.com',
      );

      expect(result).toMatchObject({
        id: MOCK_USER.id,
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
      });
    });

    it('returns null when the profile does not exist', async () => {
      mocks.single.mockResolvedValue({ data: null });

      const result = await service.getUserProfile(
        MOCK_USER.id,
        'jane@example.com',
      );

      expect(result).toBeNull();
    });
  });
});
