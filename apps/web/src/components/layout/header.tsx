import Link from 'next/link';

import { ButtonLink } from '@/components/ui/button';

import styles from './header.module.css';

/**
 * En-tête de l'application (§11.12). Le logo officiel MICHELIN n'étant pas
 * encore disponible, on utilise un emplacement textuel clairement identifié —
 * il est interdit de redessiner le logo.
 */
export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="MICHELIN Ride ID, accueil"
        >
          <span className={styles.wordmark}>MICHELIN</span>
          <span className={styles.product}>Ride ID</span>
        </Link>

        <nav className={styles.nav} aria-label="Navigation principale">
          <Link href="/" className={styles.link}>
            Accueil
          </Link>
          <Link href="/products" className={styles.link}>
            Catalogue
          </Link>
        </nav>

        <div className={styles.actions}>
          <ButtonLink href="/products" variant="secondary" size="small">
            Trouver mes pneus
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
