import { ButtonLink } from '@/components/ui/button';

import styles from './products-empty.module.css';

/**
 * État vide (§11.12) : explique la cause et propose une action concrète plutôt
 * que d'afficher une grille vide.
 */
export function ProductsEmpty() {
  return (
    <div className={styles.empty} role="status">
      <h2 className={styles.title}>Aucun pneu ne correspond à ces filtres</h2>
      <p className={styles.text}>
        Élargissez votre recherche ou réinitialisez les filtres pour voir
        l’ensemble du catalogue.
      </p>
      <ButtonLink href="/products" variant="outline">
        Réinitialiser les filtres
      </ButtonLink>
    </div>
  );
}
