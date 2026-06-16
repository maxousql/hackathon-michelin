import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';

// Police de corps officielle (§11.6). MICHELIN Unit Titling est réservée aux
// titres et n'est pas chargée tant que la licence n'est pas reçue.
const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-noto-sans',
});

export const metadata: Metadata = {
  description:
    'Trouvez les pneus MICHELIN adaptés à vos sorties. Catalogue vélo 2026.',
  title: 'MICHELIN Ride ID',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" className={notoSans.variable}>
      <body>{children}</body>
    </html>
  );
}
