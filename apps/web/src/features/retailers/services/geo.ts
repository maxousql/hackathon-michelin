/**
 * Géolocalisation approximative des revendeurs « où acheter ».
 *
 * Les revendeurs n'ont pas de coordonnées propres : on les approxime par le
 * centroïde de leur pays. Le rayon est donc volontairement grossier (un pays
 * entier = un point), suffisant pour un tri « autour de moi » indicatif.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/** Centroïdes approximatifs par code pays ISO (alignés sur COUNTRY_NAMES). */
const COUNTRY_COORDS: Record<string, LatLng> = {
  FR: { lat: 46.6, lng: 2.4 },
  DE: { lat: 51.1, lng: 10.4 },
  UK: { lat: 54.0, lng: -2.0 },
  ES: { lat: 40.3, lng: -3.7 },
  NL: { lat: 52.2, lng: 5.3 },
  IT: { lat: 42.8, lng: 12.6 },
  PL: { lat: 52.1, lng: 19.4 },
  BE: { lat: 50.6, lng: 4.6 },
};

/** Coordonnées approximatives d'un pays, ou null si inconnu. */
export function countryCoords(code: string): LatLng | null {
  return COUNTRY_COORDS[code] ?? null;
}

/**
 * Étale des points partageant la même base (même centroïde pays) sur un petit
 * cercle, afin que des revendeurs d'un même pays restent distinguables et
 * cliquables sur la carte. Déterministe : pas de saut entre rendus.
 */
export function spreadAround(
  base: LatLng,
  index: number,
  total: number,
  radiusDeg = 0.7,
): LatLng {
  if (total <= 1) return base;
  const angle = (2 * Math.PI * index) / total;
  const lngScale = Math.cos((base.lat * Math.PI) / 180) || 1;
  return {
    lat: base.lat + radiusDeg * Math.sin(angle),
    lng: base.lng + (radiusDeg * Math.cos(angle)) / lngScale,
  };
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Distance orthodromique (Haversine) entre deux points, en kilomètres. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}
