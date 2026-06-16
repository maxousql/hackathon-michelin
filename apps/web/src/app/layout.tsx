import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
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
    'Michelin Race aide les cyclistes route, gravel et VTT à trouver les pneus Michelin adaptés à leur pratique, leur terrain et leurs priorités de performance.',
  title: 'Michelin Race | Pneus vélo performance',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className={notoSans.variable} lang="fr">
      <body>{children}</body>
    </html>
  );
}
