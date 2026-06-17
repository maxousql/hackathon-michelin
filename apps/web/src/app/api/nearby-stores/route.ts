import { NextResponse, type NextRequest } from 'next/server';

import { searchBikeShops } from '@/features/retailers/services/physical-stores';

/** Rayon maximal autorisé (km), garde-fou contre les requêtes Overpass géantes. */
const MAX_RADIUS_KM = 100;

/**
 * Proxy serveur vers Overpass (OpenStreetMap) : le navigateur appelle cette
 * route (même origine) et le serveur interroge Overpass, qui n'expose pas de
 * CORS. Renvoie les magasins de vélo autour d'un point.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));
  const radius = Number(searchParams.get('radius'));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: 'Paramètres lat et lng requis.' },
      { status: 400 },
    );
  }

  const radiusKm =
    Number.isFinite(radius) && radius > 0
      ? Math.min(radius, MAX_RADIUS_KM)
      : 50;

  const stores = await searchBikeShops({ lat, lng }, radiusKm);
  return NextResponse.json(stores);
}
