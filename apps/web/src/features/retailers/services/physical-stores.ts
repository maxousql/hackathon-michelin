/**
 * Magasins physiques réels via l'API Overpass (OpenStreetMap).
 *
 * On interroge les boutiques de vélo (`shop=bicycle`) autour d'un point. Données
 * libres, sans clé API. Overpass ne renvoyant pas d'en-têtes CORS, l'appel passe
 * par notre Route Handler `/api/nearby-stores` (côté serveur), ce qui évite tout
 * problème de cross-origin. Tolérant aux pannes : renvoie [] en cas d'échec.
 */

import { distanceKm, type LatLng } from './geo';

export interface PhysicalStore {
  id: string;
  name: string;
  position: LatLng;
  /** Distance au point de recherche, en kilomètres. */
  distance: number;
  address: string | null;
  /** Lien externe : site du magasin si connu, sinon fiche OpenStreetMap. */
  website: string;
}

/** Instances Overpass essayées dans l'ordre (bascule si l'une échoue). */
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

function buildQuery(center: LatLng, radiusKm: number): string {
  const radiusM = Math.round(radiusKm * 1000);
  const { lat, lng } = center;
  return `[out:json][timeout:25];
(
  node["shop"="bicycle"](around:${radiusM},${lat},${lng});
  way["shop"="bicycle"](around:${radiusM},${lat},${lng});
);
out center tags;`;
}

function elementPosition(element: OverpassElement): LatLng | null {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return { lat: element.lat, lng: element.lon };
  }
  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  return null;
}

function elementAddress(tags: Record<string, string>): string | null {
  const parts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:city'],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

async function queryOverpass(query: string): Promise<OverpassResponse | null> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Overpass renvoie 406 sans User-Agent (fetch n'en envoie pas par défaut).
          'User-Agent': 'michelin-ride-id/1.0 (where-to-buy)',
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!response.ok) continue;
      return (await response.json()) as OverpassResponse;
    } catch {
      // essaie l'instance suivante
    }
  }
  return null;
}

/**
 * Magasins de vélo dans un rayon donné autour d'un point, triés par distance.
 * Exécuté côté serveur (Route Handler) : interroge directement Overpass.
 * Renvoie [] si Overpass est indisponible.
 */
export async function searchBikeShops(
  center: LatLng,
  radiusKm: number,
): Promise<PhysicalStore[]> {
  const data = await queryOverpass(buildQuery(center, radiusKm));
  if (!data?.elements) return [];

  return data.elements
    .map((element): PhysicalStore | null => {
      const position = elementPosition(element);
      if (!position) return null;
      const tags = element.tags ?? {};
      return {
        id: `osm-${element.type}-${element.id}`,
        name: tags.name ?? 'Magasin de vélo',
        position,
        distance: distanceKm(center, position),
        address: elementAddress(tags),
        website:
          tags.website ??
          tags['contact:website'] ??
          `https://www.openstreetmap.org/${element.type}/${element.id}`,
      };
    })
    .filter((store): store is PhysicalStore => store !== null)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Côté navigateur : passe par notre Route Handler pour contourner l'absence de
 * CORS sur Overpass. Renvoie [] si la requête échoue.
 */
export async function fetchNearbyStores(
  center: LatLng,
  radiusKm: number,
): Promise<PhysicalStore[]> {
  const params = new URLSearchParams({
    lat: String(center.lat),
    lng: String(center.lng),
    radius: String(radiusKm),
  });
  try {
    const response = await fetch(`/api/nearby-stores?${params.toString()}`);
    if (!response.ok) return [];
    return (await response.json()) as PhysicalStore[];
  } catch {
    return [];
  }
}
