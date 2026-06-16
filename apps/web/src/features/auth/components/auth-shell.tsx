import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link
            className="brand-mark"
            href="/"
            aria-label="Michelin Race – Accueil"
          >
            <Image
              alt="Michelin Race"
              className="brand-logo"
              height={96}
              priority
              src="/logo-michelin-race.png"
              width={240}
            />
          </Link>
        </div>
      </header>
      <main className="auth-page">{children}</main>
    </>
  );
}
