'use client';

import type { ProductFacets } from '@michelin/contracts';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';

import { FILTER_LABELS, FILTER_ORDER } from '../services/filter-config';
import styles from './product-filters.module.css';

interface ProductFiltersProps {
  facets: ProductFacets;
  total: number;
}

export function ProductFilters({ facets, total }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');

  // Toute mise à jour de filtre revient à la première page de résultats.
  function commit(next: URLSearchParams) {
    next.delete('page');
    const query = next.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    commit(next);
  }

  // Recherche plein-texte appliquée après une courte pause (debounce).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const current = searchParams.get('q') ?? '';
      if (search.trim() === current) return;
      const next = new URLSearchParams(searchParams.toString());
      if (search.trim()) next.set('q', search.trim());
      else next.delete('q');
      commit(next);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function reset() {
    setSearch('');
    startTransition(() => router.push(pathname, { scroll: false }));
  }

  const ebikeChecked = searchParams.get('ebike') === '1';
  const sortValue = searchParams.get('sort') ?? 'range';

  return (
    <aside
      className={styles.panel}
      data-pending={isPending ? '' : undefined}
      aria-label="Filtres du catalogue"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Filtrer</h2>
        <span className={styles.count} aria-live="polite">
          {total} produit{total > 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="filter-q">
          Recherche
        </label>
        <input
          id="filter-q"
          type="search"
          className={styles.input}
          placeholder="Nom, gamme…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {FILTER_ORDER.map((key) => {
        const options = facets[key];
        if (!options || options.length === 0) return null;
        const value = searchParams.get(key) ?? '';
        return (
          <div className={styles.group} key={key}>
            <label className={styles.label} htmlFor={`filter-${key}`}>
              {FILTER_LABELS[key]}
            </label>
            <select
              id={`filter-${key}`}
              className={styles.select}
              value={value}
              onChange={(event) => setParam(key, event.target.value)}
            >
              <option value="">Tous</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      })}

      <div className={styles.checkboxRow}>
        <input
          id="filter-ebike"
          type="checkbox"
          checked={ebikeChecked}
          onChange={(event) =>
            setParam('ebike', event.target.checked ? '1' : '')
          }
        />
        <label htmlFor="filter-ebike">Compatible vélo électrique</label>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="filter-sort">
          Trier par
        </label>
        <select
          id="filter-sort"
          className={styles.select}
          value={sortValue}
          onChange={(event) =>
            setParam(
              'sort',
              event.target.value === 'range' ? '' : event.target.value,
            )
          }
        >
          <option value="range">Gamme</option>
          <option value="diameter">Diamètre</option>
        </select>
      </div>

      <Button variant="ghost" onClick={reset} disabled={isPending}>
        Réinitialiser
      </Button>
    </aside>
  );
}
