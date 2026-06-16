'use client';

import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './button.module.css';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'regular' | 'small';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

function joinClasses(extra?: string): string {
  return [styles.button, extra].filter(Boolean).join(' ');
}

export function Button({
  variant = 'primary',
  size = 'regular',
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={joinClasses(className)}
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'regular',
  href,
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={joinClasses(className)}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </Link>
  );
}
