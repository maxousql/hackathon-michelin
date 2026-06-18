'use client';

import Link from 'next/link';
import type { ChangeEvent } from 'react';
import { useActionState, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { registerAction } from '../actions/auth.actions';
import styles from './auth-shell.module.css';

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
    (key: keyof typeof fields) => (e: ChangeEvent<HTMLInputElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));

  const passwordsMatch = fields.password === fields.confirm;
  const bothFilled = fields.password.length > 0 && fields.confirm.length > 0;

  return (
    <form action={action} className={styles.form}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="firstName">
            Prénom
          </label>
          <Input
            className={styles.input}
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
            <p className={styles.fieldError}>{state.errors.firstName[0]}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="lastName">
            Nom
          </label>
          <Input
            className={styles.input}
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
            <p className={styles.fieldError}>{state.errors.lastName[0]}</p>
          )}
        </div>
      </div>

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
          value={fields.email}
          onChange={update('email')}
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
          autoComplete="new-password"
          required
          placeholder="••••••••"
          value={fields.password}
          onChange={update('password')}
        />
        {fields.password.length > 0 && (
          <ul className={styles.passwordRules}>
            {rules.map((rule) => (
              <li key={rule.label} data-valid={rule.test(fields.password)}>
                {rule.label}
              </li>
            ))}
          </ul>
        )}
        {state?.errors?.password && (
          <p className={styles.fieldError}>{state.errors.password[0]}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="confirmPassword">
          Confirmer le mot de passe
        </label>
        <Input
          className={styles.input}
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
          <p className={styles.fieldError}>
            Les mots de passe ne correspondent pas.
          </p>
        )}
        {bothFilled && passwordsMatch && (
          <p className={styles.fieldValid}>Les mots de passe correspondent.</p>
        )}
      </div>

      {state?.message && <p className={styles.formError}>{state.message}</p>}

      <Button
        className={styles.submit}
        type="submit"
        disabled={pending || (bothFilled && !passwordsMatch)}
      >
        {pending ? 'Inscription…' : 'Créer mon compte'}
      </Button>

      <p className={styles.switch}>
        Déjà un compte ? <Link href="/login">Se connecter</Link>
      </p>
    </form>
  );
}
