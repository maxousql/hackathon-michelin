import Link from 'next/link';

import styles from './pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Filtres sérialisés sans le paramètre `page`. */
  baseParams: string;
}

function pageHref(baseParams: string, target: number): string {
  const params = new URLSearchParams(baseParams);
  if (target > 1) params.set('page', String(target));
  const query = params.toString();
  return query ? `/products?${query}` : '/products';
}

export function Pagination({ page, totalPages, baseParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav className={styles.pagination} aria-label="Pagination du catalogue">
      {hasPrev ? (
        <Link
          href={pageHref(baseParams, page - 1)}
          className={styles.link}
          rel="prev"
        >
          ← Précédent
        </Link>
      ) : (
        <span className={styles.disabled}>← Précédent</span>
      )}

      <span className={styles.status} aria-current="page">
        Page {page} sur {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={pageHref(baseParams, page + 1)}
          className={styles.link}
          rel="next"
        >
          Suivant →
        </Link>
      ) : (
        <span className={styles.disabled}>Suivant →</span>
      )}
    </nav>
  );
}
