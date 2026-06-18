'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { loginAction } from '../actions/auth.actions';
import styles from './auth-shell.module.css';

interface LoginFormProps {
  errorMessage?: string;
  redirectTo?: string;
}

export function LoginForm({ errorMessage, redirectTo }: LoginFormProps) {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <>
      <form action={action} className={styles.form}>
        {redirectTo && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Adresse email
          </label>
          <Input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="jane@example.com"
          />
          {state?.errors?.email && (
            <p className={styles.fieldError}>{state.errors.email[0]}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Mot de passe
          </label>
          <Input
            className={styles.input}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
          {state?.errors?.password && (
            <p className={styles.fieldError}>{state.errors.password[0]}</p>
          )}
        </div>

        {errorMessage && <p className={styles.formError}>{errorMessage}</p>}
        {state?.message && <p className={styles.formError}>{state.message}</p>}

        <Button className={styles.submit} disabled={pending} type="submit">
          {pending ? 'Connexion…' : 'Se connecter'}
        </Button>

        <p className={styles.switch}>
          Pas encore de compte ? <Link href="/register">Créer un compte</Link>
        </p>
      </form>

      <div className={styles.divider}>
        <span>ou</span>
      </div>

      <a href="/api/strava/auth?mode=login" className={styles.stravaButton}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        Continuer avec Strava
      </a>
    </>
  );
}
