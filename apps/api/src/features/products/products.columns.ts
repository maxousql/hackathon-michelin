import type { ProductFilters } from '@michelin/contracts';

/** Table Supabase du catalogue. */
export const PRODUCTS_TABLE = 'michelin_products';

/**
 * Taille de page du catalogue. Doit rester alignée sur la constante
 * `PRODUCTS_PAGE_SIZE` de @michelin/contracts utilisée côté web (le package de
 * contrats est en TS brut et n'est pas importable comme valeur dans le runtime
 * Node de l'API).
 */
export const PRODUCTS_PAGE_SIZE = 24;

/**
 * Correspondance entre un filtre de l'API et la colonne Supabase interrogée.
 * On retient les colonnes aux catégories franches (pas de combinaisons
 * multivaluées).
 */
export const FILTER_COLUMNS = {
  cycleType: 'cycle_type',
  segment: 'segment',
  productType: 'product_type',
  sealing: 'sealing',
  diameter: 'web_diameter',
  width: 'web_width',
} as const satisfies Record<string, string>;

/** Colonnes renvoyées pour une carte produit (doit refléter productListItemSchema). */
export const PRODUCT_LIST_COLUMNS = [
  'id',
  'brand',
  'product_type',
  'cycle_type',
  'segment',
  'range',
  'web_range_name',
  'designation',
  'web_product_designation',
  'web_diameter',
  'web_width',
  'width_etrto',
  'diameter_etrto',
  'sealing',
  'e_bike_technologies',
  'weight',
].join(',');

/** Colonnes balayées par la recherche plein-texte. */
export const SEARCH_COLUMNS = [
  'web_product_designation',
  'designation',
  'web_range_name',
  'range',
];

/** Mappe une clé de tri vers la colonne Supabase correspondante. */
export function sortColumn(sort: ProductFilters['sort']): string {
  return sort === 'diameter' ? FILTER_COLUMNS.diameter : 'web_range_name';
}
