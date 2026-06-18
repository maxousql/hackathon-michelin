'use client';

import { useActionState } from 'react';

import { loginAction } from '../actions/auth.actions';

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <>
      <form action={action} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Adresse email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="jane@example.com"
          />
          {state?.errors?.email && (
            <p className="field-error">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
          {state?.errors?.password && (
            <p className="field-error">{state.errors.password[0]}</p>
          )}
        </div>

        {state?.message && <p className="form-error">{state.message}</p>}

        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'Connexion…' : 'Se connecter'}
        </button>

        <p className="auth-switch">
          Pas encore de compte ? <a href="/register">Créer un compte</a>
        </p>
      </form>

      <div className="auth-divider">
        <span>ou</span>
      </div>

      <a href="/api/strava/auth?mode=login" className="btn-strava">
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
