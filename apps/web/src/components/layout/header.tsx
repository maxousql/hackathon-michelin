import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import styles from './header.module.css';

export interface HeaderLink {
  href: string;
  label: string;
}

interface HeaderProps {
  ariaLabel?: string;
  actions?: ReactNode;
  cta?: HeaderLink;
  homeHref?: string;
  navigation?: HeaderLink[];
}

const DEFAULT_NAVIGATION: HeaderLink[] = [
  { href: '/', label: 'Accueil' },
  { href: '/products', label: 'Catalogue' },
  { href: '/comparateur', label: 'Comparateur' },
  { href: '/reprise', label: 'Reprise' },
];

const DEFAULT_CTA: HeaderLink = {
  href: '/race-intelligence',
  label: 'Lancer Race Intelligence',
};

interface SmartLinkProps extends HeaderLink {
  'aria-label'?: string;
  children?: ReactNode;
  className?: string;
}

function SmartLink({
  'aria-label': ariaLabel,
  children,
  className,
  href,
  label,
}: SmartLinkProps) {
  const content = children ?? label;

  if (href.startsWith('#')) {
    return (
      <a aria-label={ariaLabel} className={className} href={href}>
        {content}
      </a>
    );
  }

  return (
    <Link aria-label={ariaLabel} className={className} href={href}>
      {content}
    </Link>
  );
}

export function HeaderIconLink({ href, label }: HeaderLink) {
  return (
    <SmartLink
      aria-label={label}
      className={styles.iconAction}
      href={href}
      label={label}
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
    </SmartLink>
  );
}

export function Header({
  ariaLabel = 'Navigation principale',
  actions,
  cta = DEFAULT_CTA,
  homeHref = '/',
  navigation = DEFAULT_NAVIGATION,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <SmartLink
          href={homeHref}
          label="Michelin Race"
          className={styles.brand}
          aria-label="Michelin Race, accueil"
        >
          <Image
            alt="Michelin Race"
            className={styles.logo}
            height={96}
            priority
            src="/logo-michelin-race.png"
            width={240}
          />
        </SmartLink>

        <nav className={styles.nav} aria-label={ariaLabel}>
          {navigation.map((item) => (
            <SmartLink key={item.href} className={styles.link} {...item} />
          ))}
        </nav>

        <div className={styles.actions}>
          <SmartLink className={styles.finder} {...cta}>
            <span className={styles.finderCopy}>{cta.label}</span>
            <span className={styles.finderArrow} aria-hidden="true">
              →
            </span>
          </SmartLink>
          {actions}
        </div>

        <details className={styles.mobileMenu}>
          <summary>Menu</summary>
          <div className={styles.mobilePanel}>
            {navigation.map((item) => (
              <SmartLink key={item.href} {...item} />
            ))}
            <SmartLink className={styles.mobileCta} {...cta} />
          </div>
        </details>
      </div>
    </header>
  );
}
