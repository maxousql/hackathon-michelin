'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createApiClient } from '@michelin/api-client';
import { loginRequestSchema, registerRequestSchema } from '@michelin/contracts';

export type AuthFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

function getApiClient() {
  return createApiClient({
    baseUrl: process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1',
  });
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const { accessToken } = await getApiClient().login(parsed.data);
    const cookieStore = await cookies();
    cookieStore.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Connexion échouée. Réessaie.';
    return { message };
  }

  redirect('/');
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
  };

  const parsed = registerRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const { accessToken } = await getApiClient().register(parsed.data);
    const cookieStore = await cookies();
    cookieStore.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Inscription échouée. Réessaie.';
    return { message };
  }

  redirect('/');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}

export async function stravaLogoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('strava_at');
  cookieStore.delete('strava_profile');
  cookieStore.delete('auth_token');
  redirect('/');
}
