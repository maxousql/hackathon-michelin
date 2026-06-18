import type {
  Bike,
  BikeType,
  ProductFilters,
  ProductListItem,
  RidingPriority,
  RidingSurface,
  TireSealing,
} from '@michelin/contracts';

export const BIKE_TYPE_LABELS: Record<BikeType, string> = {
  road: 'Route',
  mtb: 'VTT',
  gravel: 'Gravel',
};

export const TIRE_SEALING_OPTIONS: Array<{
  value: TireSealing;
  label: string;
}> = [
  { value: 'TUBE TYPE', label: 'Chambre à air' },
  { value: 'TUBELESS READY', label: 'Tubeless ready' },
  { value: 'TUBULAR', label: 'Boyau' },
];

export const RIDING_SURFACE_OPTIONS: Array<{
  value: RidingSurface;
  label: string;
}> = [
  { value: 'smooth', label: 'Route lisse' },
  { value: 'mixed', label: 'Mixte' },
  { value: 'loose', label: 'Graviers / terre meuble' },
  { value: 'mud', label: 'Boue / terrain humide' },
  { value: 'urban', label: 'Ville / vélotaf' },
];

export const RIDING_PRIORITY_OPTIONS: Array<{
  value: RidingPriority;
  label: string;
}> = [
  { value: 'versatility', label: 'Polyvalence' },
  { value: 'performance', label: 'Rendement' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'grip', label: 'Grip' },
  { value: 'durability', label: 'Longévité' },
];

const CYCLE_TYPE_BY_BIKE_TYPE: Record<BikeType, string> = {
  road: 'ROAD',
  mtb: 'MTB',
  gravel: 'GRAVEL',
};

export interface TireRecommendationInput {
  id: string;
  name: string;
  type: BikeType;
  distanceKm?: number;
  tireDiameter?: string | null;
  tireWidth?: string | null;
  tireSealing?: TireSealing | null;
  ridingSurface?: RidingSurface;
  ridingPriority?: RidingPriority;
  isEbike?: boolean;
}

export interface TireRecommendation {
  name: string;
  sub: string;
  query: string;
  details: string[];
}

export interface ResolvedTireRecommendation extends TireRecommendation {
  productHref?: string;
  productId?: number;
  productName?: string;
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function inferBikeTypeFromName(name: string): BikeType {
  const normalized = name.toLowerCase();
  if (
    normalized.includes('mtb') ||
    normalized.includes('mountain') ||
    normalized.includes('vtt') ||
    normalized.includes('enduro') ||
    normalized.includes('trail')
  ) {
    return 'mtb';
  }
  if (
    normalized.includes('gravel') ||
    normalized.includes('cx') ||
    normalized.includes('cross') ||
    normalized.includes('adventure') ||
    normalized.includes('bikepacking')
  ) {
    return 'gravel';
  }
  return 'road';
}

export function bikeToRecommendationInput(bike: Bike): TireRecommendationInput {
  return {
    id: bike.id,
    name: bike.name,
    type: bike.type,
    distanceKm: bike.distanceKm,
    tireDiameter: bike.tireDiameter,
    tireWidth: bike.tireWidth,
    tireSealing: bike.tireSealing,
    ridingSurface: bike.ridingSurface,
    ridingPriority: bike.ridingPriority,
    isEbike: bike.isEbike,
  };
}

export function getTireRecommendation(
  input: TireRecommendationInput,
): TireRecommendation {
  const surface = input.ridingSurface ?? 'mixed';
  const priority = input.ridingPriority ?? 'versatility';
  const details = buildRecommendationDetails(input);

  if (input.type === 'mtb') {
    if (surface === 'mud' || priority === 'grip') {
      return {
        name: 'Michelin Wild Enduro MS',
        sub: 'Grip prioritaire sur terrain souple ou humide',
        query: 'Wild Enduro MS',
        details,
      };
    }
    return {
      name: 'Michelin Wild Enduro MH',
      sub: 'Accroche et précision sur terrain dur à mixte',
      query: 'Wild Enduro MH',
      details,
    };
  }

  if (input.type === 'gravel') {
    return {
      name: 'Michelin Power Gravel',
      sub: 'Polyvalence et rendement sur surfaces mixtes',
      query: 'Power Gravel',
      details,
    };
  }

  if (
    priority === 'endurance' ||
    priority === 'durability' ||
    (input.distanceKm ?? 0) > 10000
  ) {
    return {
      name: 'Michelin Power Endurance',
      sub: 'Longévité et protection pour gros kilométrage',
      query: 'Power Endurance',
      details,
    };
  }

  if (input.tireSealing === 'TUBELESS READY') {
    return {
      name: 'Michelin Power Cup TLR',
      sub: 'Performance route avec montage tubeless ready',
      query: 'Power Cup TLR',
      details,
    };
  }

  return {
    name: 'Michelin Power Cup',
    sub: 'Rendement et grip pour une pratique route sportive',
    query: 'Power Cup',
    details,
  };
}

export function buildRecommendationFilterAttempts(
  input: TireRecommendationInput,
  recommendation = getTireRecommendation(input),
): ProductFilters[] {
  const base: ProductFilters = {
    productType: 'TYRE',
    cycleType: CYCLE_TYPE_BY_BIKE_TYPE[input.type],
    sort: 'range',
    page: 1,
  };

  const exact: ProductFilters = {
    ...base,
    sealing: input.tireSealing ?? undefined,
    diameter: clean(input.tireDiameter) ?? undefined,
    width: clean(input.tireWidth) ?? undefined,
    ebike: input.isEbike ? true : undefined,
  };

  const attempts: ProductFilters[] = [
    exact,
    { ...exact, width: undefined },
    { ...exact, diameter: undefined },
    {
      ...base,
      sealing: input.tireSealing ?? undefined,
      ebike: input.isEbike ? true : undefined,
      q: recommendation.query,
    },
    { ...base, q: recommendation.query },
    { productType: 'TYRE', q: recommendation.query, sort: 'range', page: 1 },
  ];

  return uniqueFilters(attempts);
}

export function pickBestRecommendedProduct(
  items: ProductListItem[],
  input: TireRecommendationInput,
  recommendation: TireRecommendation,
): ProductListItem | null {
  const [best] = [...items].sort(
    (a, b) =>
      scoreProduct(b, input, recommendation) -
      scoreProduct(a, input, recommendation),
  );
  return best ?? null;
}

export function productDisplayName(product: ProductListItem): string {
  return (
    clean(product.web_product_designation) ??
    clean(product.designation) ??
    clean(product.web_range_name) ??
    clean(product.range) ??
    `Produit ${product.id}`
  );
}

export function mergeResolvedRecommendation(
  recommendation: TireRecommendation,
  product: ProductListItem | null,
): ResolvedTireRecommendation {
  if (!product) return recommendation;
  return {
    ...recommendation,
    productHref: `/produit/${product.id}`,
    productId: product.id,
    productName: productDisplayName(product),
  };
}

function scoreProduct(
  product: ProductListItem,
  input: TireRecommendationInput,
  recommendation: TireRecommendation,
): number {
  const productText = [
    product.web_product_designation,
    product.designation,
    product.web_range_name,
    product.range,
    product.segment,
  ]
    .map((value) => clean(value)?.toLowerCase())
    .filter(Boolean)
    .join(' ');

  let score = 0;
  if (clean(product.cycle_type) === CYCLE_TYPE_BY_BIKE_TYPE[input.type]) {
    score += 8;
  }
  if (
    clean(input.tireDiameter) &&
    clean(product.web_diameter) === clean(input.tireDiameter)
  ) {
    score += 10;
  }
  if (
    clean(input.tireWidth) &&
    clean(product.web_width) === clean(input.tireWidth)
  ) {
    score += 10;
  }
  if (input.tireSealing && clean(product.sealing) === input.tireSealing) {
    score += 8;
  }
  if (input.isEbike && clean(product.e_bike_technologies)) score += 6;

  for (const token of recommendation.query.toLowerCase().split(/\s+/)) {
    if (token && productText.includes(token)) score += 3;
  }

  if (
    input.ridingPriority === 'performance' &&
    productText.includes('racing')
  ) {
    score += 2;
  }
  if (
    (input.ridingPriority === 'endurance' ||
      input.ridingPriority === 'durability') &&
    productText.includes('endurance')
  ) {
    score += 4;
  }

  return score;
}

function buildRecommendationDetails(input: TireRecommendationInput): string[] {
  const details = [
    BIKE_TYPE_LABELS[input.type],
    clean(input.tireDiameter) && clean(input.tireWidth)
      ? `${clean(input.tireDiameter)} x ${clean(input.tireWidth)}`
      : clean(input.tireDiameter) || clean(input.tireWidth),
    input.tireSealing,
    input.isEbike ? 'E-bike' : null,
    RIDING_SURFACE_OPTIONS.find(
      (option) => option.value === input.ridingSurface,
    )?.label,
    RIDING_PRIORITY_OPTIONS.find(
      (option) => option.value === input.ridingPriority,
    )?.label,
  ];

  return details.filter((detail): detail is string => Boolean(detail));
}

function uniqueFilters(filters: ProductFilters[]): ProductFilters[] {
  const seen = new Set<string>();
  const unique: ProductFilters[] = [];

  for (const filter of filters) {
    const normalized = Object.fromEntries(
      Object.entries(filter).filter(([, value]) => value !== undefined),
    );
    const key = JSON.stringify(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(normalized as ProductFilters);
  }

  return unique;
}
