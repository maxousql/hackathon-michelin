'use client';

import type { ProductFacets } from '@michelin/contracts';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

import {
  FILTER_LABELS,
  FILTER_ORDER,
  type FilterKey,
} from '../services/filter-config';
import styles from './product-filters.module.css';

const INLINE_FILTER_KEYS: FilterKey[] = ['diameter', 'width'];
const STACKED_FILTER_KEYS = FILTER_ORDER.filter(
  (key) => !INLINE_FILTER_KEYS.includes(key),
);

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
  const hasInlineFilters = INLINE_FILTER_KEYS.some(
    (key) => (facets[key]?.length ?? 0) > 0,
  );

  function renderFilterControl(key: FilterKey, compact = false) {
    const options = facets[key];
    if (!options || options.length === 0) return null;
    const value = searchParams.get(key) ?? '';
    const controlClassName = compact
      ? `${styles.control} ${styles.compactControl}`
      : styles.control;

    return (
      <Field className={styles.group} key={key}>
        <FieldLabel htmlFor={`filter-${key}`}>{FILTER_LABELS[key]}</FieldLabel>
        <NativeSelect
          id={`filter-${key}`}
          className={controlClassName}
          value={value}
          onChange={(event) => setParam(key, event.target.value)}
        >
          <NativeSelectOption value="">Tous</NativeSelectOption>
          {options.map((option) => (
            <NativeSelectOption key={option} value={option}>
              {option}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
    );
  }

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

      <Field className={styles.group}>
        <FieldLabel htmlFor="filter-q">Recherche</FieldLabel>
        <Input
          id="filter-q"
          type="search"
          className={styles.control}
          placeholder="Nom, gamme…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Field>

      {STACKED_FILTER_KEYS.map((key) => renderFilterControl(key))}

      {hasInlineFilters && (
        <div className={styles.inlineGroup}>
          {INLINE_FILTER_KEYS.map((key) => renderFilterControl(key, true))}
        </div>
      )}

      <Field className={styles.checkboxRow}>
        <input
          id="filter-ebike"
          type="checkbox"
          checked={ebikeChecked}
          onChange={(event) =>
            setParam('ebike', event.target.checked ? '1' : '')
          }
        />
        <FieldLabel htmlFor="filter-ebike">
          Compatible vélo électrique
        </FieldLabel>
      </Field>

      <Field className={styles.group}>
        <FieldLabel htmlFor="filter-sort">Trier par</FieldLabel>
        <NativeSelect
          id="filter-sort"
          className={styles.control}
          value={sortValue}
          onChange={(event) =>
            setParam(
              'sort',
              event.target.value === 'range' ? '' : event.target.value,
            )
          }
        >
          <NativeSelectOption value="range">Gamme</NativeSelectOption>
          <NativeSelectOption value="diameter">Diamètre</NativeSelectOption>
        </NativeSelect>
      </Field>

      <Button
        className={styles.reset}
        variant="ghost"
        onClick={reset}
        disabled={isPending}
      >
        Réinitialiser
      </Button>
    </aside>
  );
}
