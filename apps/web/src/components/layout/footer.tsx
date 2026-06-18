import Image from 'next/image';
import Link from 'next/link';

import styles from './footer.module.css';

const PRODUCT_LINKS = [
  { label: 'Catalogue pneus', href: '/products' },
  { label: 'Comparateur', href: '/comparateur' },
  { label: 'Race Intelligence', href: '/race-intelligence' },
  { label: 'Reprise Michelin', href: '/reprise' },
];

const ACCOUNT_LINKS = [
  { label: 'Connexion', href: '/login' },
  { label: 'Inscription', href: '/register' },
];

const LEGAL_LINKS = [
  { label: 'Confidentialité', href: '#' },
  { label: 'Mentions légales', href: '#' },
  { label: 'Accessibilité', href: '#' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandPanel}>
          <Link
            href="/"
            className={styles.brand}
            aria-label="Michelin Race, accueil"
          >
            <Image
              alt="Michelin Race"
              className={styles.logo}
              height={96}
              src="/logo-michelin-race.png"
              width={240}
            />
          </Link>
          <p className={styles.lede}>
            Trouvez, comparez et entretenez vos pneus MICHELIN vélo avec une
            lecture terrain claire, du choix produit à la seconde vie.
          </p>
          <Link className={styles.cta} href="/race-intelligence">
            Lancer Race Intelligence
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Navigation du pied de page">
          <div className={styles.column}>
            <h2 className={styles.title}>Explorer</h2>
            {PRODUCT_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.column}>
            <h2 className={styles.title}>Compte</h2>
            {ACCOUNT_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.column}>
            <h2 className={styles.title}>Michelin</h2>
            {LEGAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} className={styles.link}>
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </div>

      <div className={styles.bottom}>
        <p>© {year} Compagnie Générale des Établissements Michelin</p>
        <p>Michelin Race Intelligence</p>
      </div>
    </footer>
  );
}
