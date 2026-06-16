import { productFiltersSchema, type ProductFilters } from '@michelin/contracts';

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  const trimmed = v?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Convertit les paramètres d'URL en filtres typés. Tolérant : une valeur
 * invalide retombe sur les valeurs par défaut plutôt que de casser la page.
 */
export function parseProductFilters(
  searchParams: RawSearchParams,
): ProductFilters {
  const parsed = productFiltersSchema.safeParse({
    q: first(searchParams.q),
    cycleType: first(searchParams.cycleType),
    segment: first(searchParams.segment),
    productType: first(searchParams.productType),
    sealing: first(searchParams.sealing),
    diameter: first(searchParams.diameter),
    width: first(searchParams.width),
    ebike: first(searchParams.ebike) === '1' ? true : undefined,
    sort: first(searchParams.sort),
    page: first(searchParams.page),
  });

  return parsed.success ? parsed.data : productFiltersSchema.parse({});
}

/** Sérialise les filtres en `URLSearchParams` (omet les valeurs par défaut). */
export function buildSearchParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.cycleType) params.set('cycleType', filters.cycleType);
  if (filters.segment) params.set('segment', filters.segment);
  if (filters.productType) params.set('productType', filters.productType);
  if (filters.sealing) params.set('sealing', filters.sealing);
  if (filters.diameter) params.set('diameter', filters.diameter);
  if (filters.width) params.set('width', filters.width);
  if (filters.ebike) params.set('ebike', '1');
  if (filters.sort !== 'range') params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
}
