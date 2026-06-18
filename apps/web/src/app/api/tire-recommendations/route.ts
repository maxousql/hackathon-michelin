import { NextResponse } from 'next/server';

import { fetchProducts } from '@/features/products/services/products.api';
import {
  buildRecommendationFilterAttempts,
  getTireRecommendation,
  mergeResolvedRecommendation,
  pickBestRecommendedProduct,
  type TireRecommendationInput,
} from '@/features/rider-profile/services/tire-recommendation';
import type {
  BikeType,
  RidingPriority,
  RidingSurface,
  TireSealing,
} from '@michelin/contracts';

export const dynamic = 'force-dynamic';

const BIKE_TYPES = new Set(['road', 'mtb', 'gravel']);
const RIDING_SURFACES = new Set(['smooth', 'mixed', 'loose', 'mud', 'urban']);
const RIDING_PRIORITIES = new Set([
  'performance',
  'endurance',
  'grip',
  'durability',
  'versatility',
]);
const TIRE_SEALINGS = new Set(['TUBE TYPE', 'TUBELESS READY', 'TUBULAR']);

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const bikes = parseBikes(body);

  const recommendations = await Promise.all(
    bikes.map(async (bike) => ({
      bikeId: bike.id,
      recommendation: await resolveRecommendation(bike),
    })),
  );

  return NextResponse.json({ recommendations });
}

async function resolveRecommendation(input: TireRecommendationInput) {
  const fallback = getTireRecommendation(input);

  try {
    for (const filters of buildRecommendationFilterAttempts(input, fallback)) {
      const result = await fetchProducts(filters);
      const product = pickBestRecommendedProduct(result.items, input, fallback);
      if (product) return mergeResolvedRecommendation(fallback, product);
    }
  } catch {
    // The profile must remain usable if the catalog API is temporarily unavailable.
  }

  return fallback;
}

function parseBikes(body: unknown): TireRecommendationInput[] {
  if (!isRecord(body) || !Array.isArray(body.bikes)) return [];

  return body.bikes
    .map(parseBike)
    .filter((bike): bike is TireRecommendationInput => bike !== null);
}

function parseBike(value: unknown): TireRecommendationInput | null {
  if (!isRecord(value)) return null;
  const id = stringValue(value.id);
  const name = stringValue(value.name);
  const type = stringValue(value.type);

  if (!id || !name || !type || !BIKE_TYPES.has(type)) return null;

  const ridingSurface = stringValue(value.ridingSurface);
  const ridingPriority = stringValue(value.ridingPriority);
  const tireSealing = stringValue(value.tireSealing);

  return {
    id,
    name,
    type: type as BikeType,
    distanceKm: numberValue(value.distanceKm),
    tireDiameter: stringValue(value.tireDiameter),
    tireWidth: stringValue(value.tireWidth),
    tireSealing: TIRE_SEALINGS.has(tireSealing ?? '')
      ? (tireSealing as TireSealing)
      : null,
    ridingSurface: RIDING_SURFACES.has(ridingSurface ?? '')
      ? (ridingSurface as RidingSurface)
      : 'mixed',
    ridingPriority: RIDING_PRIORITIES.has(ridingPriority ?? '')
      ? (ridingPriority as RidingPriority)
      : 'versatility',
    isEbike: value.isEbike === true,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringValue(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}
