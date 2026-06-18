'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { logoutAction, stravaLogoutAction } from '../actions/auth.actions';

interface UserMenuProps {
  canViewProfile?: boolean;
  isAdmin?: boolean;
  stravaConnected?: boolean;
}

export function UserMenu({
  canViewProfile = false,
  isAdmin = false,
  stravaConnected = false,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div className="user-menu" ref={ref}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu utilisateur"
        className="user-menu-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        {stravaConnected ? (
          <svg
            aria-hidden="true"
            fill="currentColor"
            height="20"
            viewBox="0 0 24 24"
            width="20"
          >
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            fill="none"
            height="20"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="20"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
          </svg>
        )}
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
          {canViewProfile && (
            <a
              className="user-menu-item"
              href="/profil"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
              </svg>
              Mon Profil
            </a>
          )}

          {isAdmin && (
            <a
              className="user-menu-item"
              href="/admin/users"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
              >
                <rect height="7" rx="1" width="7" x="3" y="3" />
                <rect height="7" rx="1" width="7" x="14" y="3" />
                <rect height="7" rx="1" width="7" x="14" y="14" />
                <rect height="7" rx="1" width="7" x="3" y="14" />
              </svg>
              Back Office
            </a>
          )}

          {stravaConnected ? (
            <button
              className="user-menu-item user-menu-item--danger"
              disabled={pending}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                startTransition(() => stravaLogoutAction());
              }}
            >
              <svg
                aria-hidden="true"
                fill="currentColor"
                height="16"
                viewBox="0 0 24 24"
                width="16"
              >
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              {pending ? 'Déconnexion…' : 'Déconnecter Strava'}
            </button>
          ) : (
            <button
              className="user-menu-item user-menu-item--danger"
              disabled={pending}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                startTransition(() => logoutAction());
              }}
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              {pending ? 'Déconnexion…' : 'Se déconnecter'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
