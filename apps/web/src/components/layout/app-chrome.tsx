'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface AppChromeProps {
  children: ReactNode;
  footer: ReactNode;
  header: ReactNode;
}

const AUTH_PATHS = ['/login', '/register'];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function AppChrome({ children, footer, header }: AppChromeProps) {
  const pathname = usePathname();
  const hideChrome = isAuthPath(pathname);

  return (
    <>
      {!hideChrome && header}
      {children}
      {!hideChrome && footer}
    </>
  );
}
