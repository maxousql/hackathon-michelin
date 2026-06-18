import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import styles from './auth-shell.module.css';

interface AuthShellProps {
  children: ReactNode;
  eyebrow: string;
  subtitle: string;
  title: string;
}

const PROOFS = ['Race Intelligence', 'Comparateur', 'Reprise pneus'];

export function AuthShell({
  children,
  eyebrow,
  subtitle,
  title,
}: AuthShellProps) {
  const titleClassName =
    title.length > 12 ? `${styles.title} ${styles.titleCompact}` : styles.title;

  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="auth-title">
        <aside className={styles.brandPanel} aria-label="Michelin Race">
          <div className={styles.panelOverlay} />
          <div className={styles.speedLines} aria-hidden="true" />

          <div className={styles.brandCopy}>
            <p className={styles.kicker}>Michelin Race</p>
            <h2>Un espace prêt pour vos sorties.</h2>
            <p>
              Retrouvez vos recommandations, vos comparaisons et les services
              Michelin vélo dans une interface claire, rapide et cohérente.
            </p>
          </div>

          <ul className={styles.proofs} aria-label="Services disponibles">
            {PROOFS.map((proof) => (
              <li key={proof}>{proof}</li>
            ))}
          </ul>
        </aside>

        <section className={styles.card}>
          <div className={styles.cardInner}>
            <Link
              aria-label="Michelin Race, accueil"
              className={styles.cardLogoLink}
              href="/"
            >
              <Image
                alt="Michelin Race"
                className={styles.cardLogo}
                height={1080}
                priority
                src="/logo-michelin-race.png"
                width={1080}
              />
            </Link>

            <header className={styles.header}>
              <p className={styles.eyebrow}>{eyebrow}</p>
              <h1 id="auth-title" className={titleClassName}>
                {title}
              </h1>
              <p className={styles.subtitle}>{subtitle}</p>
            </header>
            {children}
          </div>
        </section>
      </section>
    </main>
  );
}
