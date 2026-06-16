'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { logoutAction } from '../actions/auth.actions';

interface UserMenuProps {
  isAdmin?: boolean;
}

export function UserMenu({ isAdmin = false }: UserMenuProps) {
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
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
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
        </div>
      )}
    </div>
  );
}
