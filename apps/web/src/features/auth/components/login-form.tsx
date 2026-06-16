'use client';

import { useActionState } from 'react';

import { loginAction } from '../actions/auth.actions';

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
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
  );
}
