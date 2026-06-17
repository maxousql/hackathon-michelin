import type { Metadata } from 'next';
import Image from 'next/image';

import { ComparatorForm } from '@/features/comparator/components/comparator-form';
import {
  fetchProductFacets,
  fetchProducts,
} from '@/features/products/services/products.api';

import '@/features/race-intelligence/race-intelligence.css';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Comparateur — Michelin Vélo',
  description:
    'Comparez 2 à 3 pneus Michelin sur un itinéraire GPX ou Strava et identifiez le meilleur compromis terrain, rendement et protection.',
};

export default async function ComparatorPage() {
  const [initialProducts, facets] = await Promise.all([
    fetchProducts({
      page: 1,
      productType: 'TYRE',
      sort: 'range',
    }),
    fetchProductFacets(),
  ]);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <Image
          alt="Pneu de vélo Michelin en mouvement sur terrain rapide"
          className={styles.heroImage}
          height={720}
          priority
          sizes="100vw"
          src="/michelin-race-hero.jpg"
          width={1400}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.speedLines} aria-hidden="true" />

        <div className={styles.heroInner}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Comparateur Michelin</p>
            <h1 className={styles.title} id="comparator-title">
              Benchmark pneus par itinéraire
            </h1>
            <p className={styles.lede}>
              Importez une trace GPX ou Strava, sélectionnez deux à trois pneus,
              puis comparez rendement, grip, protection et durabilité sur le
              parcours réel.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#comparateur">
                Lancer le comparatif
              </a>
            </div>
          </div>
        </div>
      </header>

      <section
        className={styles.workspace}
        id="comparateur"
        aria-labelledby="comparator-title"
      >
        <ComparatorForm
          initialFacets={facets}
          initialProducts={initialProducts.items}
          initialTotal={initialProducts.total}
        />
      </section>
    </main>
  );
}
