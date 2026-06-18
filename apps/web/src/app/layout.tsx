import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import { AppChrome } from '@/components/layout/app-chrome';
import { AppHeader } from '@/components/layout/app-header';
import { Footer } from '@/components/layout/footer';

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
      <body className={notoSans.variable}>
        <AppChrome footer={<Footer />} header={<AppHeader />}>
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
