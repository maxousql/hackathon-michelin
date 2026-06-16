'use client';

import { useTransition } from 'react';

import { logoutAction } from '../actions/auth.actions';

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="btn-logout"
      disabled={pending}
      onClick={() => startTransition(() => logoutAction())}
    >
      {pending ? 'Déconnexion…' : 'Se déconnecter'}
    </button>
  );
}
