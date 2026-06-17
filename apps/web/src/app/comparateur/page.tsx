import type { Metadata } from 'next';

import { ComparatorForm } from '@/features/comparator/components/comparator-form';
import { fetchProducts } from '@/features/products/services/products.api';

import '@/features/race-intelligence/race-intelligence.css';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Comparateur — Michelin Vélo',
  description:
    'Comparez 2 à 3 pneus Michelin sur un itinéraire GPX ou Strava et identifiez le meilleur compromis terrain, rendement et protection.',
};

export default async function ComparatorPage() {
  const initialProducts = await fetchProducts({
    page: 1,
    productType: 'TYRE',
    sort: 'range',
  });

  return (
    <main className={styles.page}>
      <section className={styles.workspace} aria-labelledby="comparator-title">
        <div className={styles.header}>
          <p className={styles.kicker}>Comparateur Michelin</p>
          <h1 id="comparator-title">Benchmark pneus par itinéraire</h1>
          <p>
            Importez une trace GPX ou Strava, sélectionnez vos pneus, puis
            comparez rendement, grip, protection et durabilité sur le parcours.
          </p>
        </div>

        <ComparatorForm
          initialProducts={initialProducts.items}
          initialTotal={initialProducts.total}
        />
      </section>
    </main>
  );
}
