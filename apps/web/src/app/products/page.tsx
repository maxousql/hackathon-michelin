import { PRODUCTS_PAGE_SIZE } from '@michelin/contracts';
import Image from 'next/image';
import Link from 'next/link';

import {
  fetchProductFacets,
  fetchProducts,
} from '@/features/products/services/products.api';
import {
  buildSearchParams,
  parseProductFilters,
} from '@/features/products/services/products.filters';
import { Pagination } from '@/features/products/components/pagination';
import { ProductFilters } from '@/features/products/components/product-filters';
import { ProductGrid } from '@/features/products/components/product-grid';
import { ProductsEmpty } from '@/features/products/components/products-empty';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const filters = parseProductFilters(await searchParams);

  const [facets, list] = await Promise.all([
    fetchProductFacets(),
    fetchProducts(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(list.total / PRODUCTS_PAGE_SIZE));
  const baseParams = buildSearchParams(filters);
  baseParams.delete('page');

  return (
    <div className={styles.page}>
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
            <p className={styles.eyebrow}>Catalogue vélo 2026</p>
            <h1 className={styles.title}>
              Trouvez les pneus adaptés à vos sorties
            </h1>
            <p className={styles.lede}>
              Filtrez la gamme MICHELIN par type de vélo, usage, dimension ou
              montage, puis comparez les références avec une lecture orientée
              terrain, performance et achat.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#catalogue">
                Explorer la gamme
              </a>
              <Link className={styles.secondaryAction} href="/#recherche">
                Lancer RaceFinder
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="catalogue-title"
        className={styles.catalogue}
        id="catalogue"
      >
        <div className={styles.catalogueHeader}>
          <div>
            <p className={styles.sectionKicker}>Sélection Michelin Race</p>
            <h2 id="catalogue-title">
              Comparez les références par usage réel.
            </h2>
          </div>
        </div>

        <div className={styles.layout}>
          <ProductFilters facets={facets} total={list.total} />

          <div className={styles.results}>
            {list.items.length === 0 ? (
              <ProductsEmpty />
            ) : (
              <>
                <ProductGrid items={list.items} />
                <Pagination
                  page={filters.page}
                  totalPages={totalPages}
                  baseParams={baseParams.toString()}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
