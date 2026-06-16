import { describe, expect, it } from 'vitest';

import {
  authResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
} from './auth.contract';

const VALID_REGISTER = {
  email: 'jane@example.com',
  password: 'Password1!',
  firstName: 'Jane',
  lastName: 'Doe',
};

describe('registerRequestSchema', () => {
  it('accepts a valid payload', () => {
    expect(registerRequestSchema.safeParse(VALID_REGISTER).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(
      registerRequestSchema.safeParse({
        ...VALID_REGISTER,
        email: 'not-an-email',
      }).success,
    ).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(
      registerRequestSchema.safeParse({ ...VALID_REGISTER, password: 'Ab1!' })
        .success,
    ).toBe(false);
  });

  it('rejects a password with no uppercase letter', () => {
    expect(
      registerRequestSchema.safeParse({
        ...VALID_REGISTER,
        password: 'password1!',
      }).success,
    ).toBe(false);
  });

  it('rejects a password with no special character', () => {
    expect(
      registerRequestSchema.safeParse({
        ...VALID_REGISTER,
        password: 'Password1',
      }).success,
    ).toBe(false);
  });

  it('rejects an empty firstName', () => {
    expect(
      registerRequestSchema.safeParse({ ...VALID_REGISTER, firstName: '' })
        .success,
    ).toBe(false);
  });

  it('rejects an empty lastName', () => {
    expect(
      registerRequestSchema.safeParse({ ...VALID_REGISTER, lastName: '' })
        .success,
    ).toBe(false);
  });
});

describe('loginRequestSchema', () => {
  it('accepts a valid payload', () => {
    expect(
      loginRequestSchema.safeParse({
        email: 'jane@example.com',
        password: 'anything',
      }).success,
    ).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(
      loginRequestSchema.safeParse({ email: 'bad', password: 'anything' })
        .success,
    ).toBe(false);
  });

  it('rejects an empty password', () => {
    expect(
      loginRequestSchema.safeParse({ email: 'jane@example.com', password: '' })
        .success,
    ).toBe(false);
  });
});

describe('authResponseSchema', () => {
  const VALID_RESPONSE = {
    accessToken: 'jwt.token.here',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      isAdmin: false,
    },
  };

  it('accepts a valid auth response', () => {
    expect(authResponseSchema.safeParse(VALID_RESPONSE).success).toBe(true);
  });

  it('rejects when accessToken is missing', () => {
    const { accessToken: _, ...withoutToken } = VALID_RESPONSE;
    expect(authResponseSchema.safeParse(withoutToken).success).toBe(false);
  });

  it('rejects when user.id is not a UUID', () => {
    expect(
      authResponseSchema.safeParse({
        ...VALID_RESPONSE,
        user: { ...VALID_RESPONSE.user, id: 'not-a-uuid' },
      }).success,
    ).toBe(false);
  });
});
