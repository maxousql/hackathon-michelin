import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import Link from 'next/link';
import type { ReactNode } from 'react';

import './globals.css';

const notoSans = Noto_Sans({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-noto-sans',
  weight: ['400', '600', '700', '800'],
});

export const metadata: Metadata = {
  description:
    'La plateforme digitale Michelin Vélo — Race Intelligence & Boutique.',
  title: 'Michelin Vélo',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body>
        <nav className="mi-nav">
          <div className="mi-nav-inner">
            <Link
              href="/"
              className="mi-nav-logo"
              aria-label="Michelin Vélo — Accueil"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>
                Michelin <strong>Vélo</strong>
              </span>
            </Link>
            <ul className="mi-nav-links">
              <li>
                <a
                  href="/race-intelligence"
                  className="mi-nav-link mi-nav-link--primary"
                >
                  Race Intelligence
                </a>
              </li>
              <li>
                <a href="/boutique" className="mi-nav-link">
                  Boutique
                </a>
              </li>
              <li>
                <a href="/challenges" className="mi-nav-link">
                  Challenges
                </a>
              </li>
            </ul>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
