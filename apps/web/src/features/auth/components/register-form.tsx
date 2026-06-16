'use client';

import { useActionState, useState } from 'react';

import { registerAction } from '../actions/auth.actions';

const rules = [
  { label: '8 caractères minimum', test: (v: string) => v.length >= 8 },
  { label: 'Une majuscule', test: (v: string) => /[A-Z]/.test(v) },
  {
    label: 'Un caractère spécial',
    test: (v: string) => /[^a-zA-Z0-9]/.test(v),
  },
];

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined);
  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
  });

  const update =
    (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));

  const passwordsMatch = fields.password === fields.confirm;
  const bothFilled = fields.password.length > 0 && fields.confirm.length > 0;

  return (
    <form action={action} className="auth-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">Prénom</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            placeholder="Jane"
            value={fields.firstName}
            onChange={update('firstName')}
          />
          {state?.errors?.firstName && (
            <p className="field-error">{state.errors.firstName[0]}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Nom</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            placeholder="Doe"
            value={fields.lastName}
            onChange={update('lastName')}
          />
          {state?.errors?.lastName && (
            <p className="field-error">{state.errors.lastName[0]}</p>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Adresse email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="jane@example.com"
          value={fields.email}
          onChange={update('email')}
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
          autoComplete="new-password"
          required
          placeholder="••••••••"
          value={fields.password}
          onChange={update('password')}
        />
        {fields.password.length > 0 && (
          <ul className="password-rules">
            {rules.map((rule) => (
              <li
                key={rule.label}
                className={rule.test(fields.password) ? 'valid' : ''}
              >
                {rule.label}
              </li>
            ))}
          </ul>
        )}
        {state?.errors?.password && (
          <p className="field-error">{state.errors.password[0]}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          value={fields.confirm}
          onChange={update('confirm')}
        />
        {bothFilled && !passwordsMatch && (
          <p className="field-error">Les mots de passe ne correspondent pas.</p>
        )}
        {bothFilled && passwordsMatch && (
          <p className="field-valid">Les mots de passe correspondent.</p>
        )}
      </div>

      {state?.message && <p className="form-error">{state.message}</p>}

      <button
        type="submit"
        disabled={pending || (bothFilled && !passwordsMatch)}
        className="btn-primary"
      >
        {pending ? 'Inscription…' : 'Créer mon compte'}
      </button>

      <p className="auth-switch">
        Déjà un compte ? <a href="/login">Se connecter</a>
      </p>
    </form>
  );
}
