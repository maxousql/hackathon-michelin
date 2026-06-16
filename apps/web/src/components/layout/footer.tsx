import styles from './footer.module.css';

// Liens institutionnels requis (§11.12). Les cibles réelles seront branchées
// quand les pages correspondantes existeront.
const LINKS = [
  { label: 'Confidentialité', href: '#' },
  { label: 'Mentions légales', href: '#' },
  { label: 'Cookies', href: '#' },
  { label: 'Accessibilité', href: '#' },
  { label: 'Plan du site', href: '#' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copyright}>
          © {year} Compagnie Générale des Établissements Michelin
        </p>
        <nav className={styles.links} aria-label="Liens institutionnels">
          {LINKS.map((link) => (
            <a key={link.label} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
