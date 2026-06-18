import type { GpxPoint, GpxStats } from './gpx-parser';
import type { SurfaceType } from '@michelin/contracts';

interface StravaStreams {
  latlng?: { data: [number, number][] };
  altitude?: { data: number[] };
  distance?: { data: number[] };
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function streamsToGpxStats(streams: StravaStreams): GpxStats | null {
  const latlng = streams.latlng?.data;
  const altitude = streams.altitude?.data;
  const distanceData = streams.distance?.data; // absent pour les itinéraires Strava

  if (!latlng || latlng.length < 2) return null;

  const points: GpxPoint[] = [];
  let elevGain = 0;
  let flat = 0,
    rolling = 0,
    hilly = 0,
    steep = 0;
  let cumulativeDist = 0;

  for (let i = 0; i < latlng.length; i++) {
    const [lat, lon] = latlng[i]!;
    const ele = altitude?.[i] ?? 0;

    // Distance : utilise le stream Strava si dispo, sinon haversine
    let distKm: number;
    if (distanceData) {
      distKm = Math.round(((distanceData[i] ?? 0) / 1000) * 100) / 100;
    } else {
      if (i > 0) {
        const prev = latlng[i - 1]!;
        cumulativeDist += haversineKm(prev[0], prev[1], lat, lon);
      }
      distKm = Math.round(cumulativeDist * 100) / 100;
    }

    if (i > 0) {
      const prevEle = altitude?.[i - 1] ?? 0;
      const prevDistKm = points[i - 1]!.distKm;
      const dEle = ele - prevEle;
      const segDist = distKm - prevDistKm;
      if (dEle > 0) elevGain += dEle;
      const grade =
        segDist > 0.0001 ? Math.abs((dEle / (segDist * 1000)) * 100) : 0;
      if (grade < 3) flat += segDist;
      else if (grade < 6) rolling += segDist;
      else if (grade < 12) hilly += segDist;
      else steep += segDist;
    }

    points.push({ lat, lon, ele, distKm });
  }

  const step = Math.max(1, Math.floor(points.length / 300));
  const profile = points
    .filter((_, i) => i % step === 0)
    .map((p) => ({
      distKm: Math.round(p.distKm * 10) / 10,
      eleM: Math.round(p.ele),
    }));

  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const total = flat + rolling + hilly + steep || 1;
  const lastDistKm = distanceData
    ? (distanceData[distanceData.length - 1] ?? 0) / 1000
    : (points[points.length - 1]?.distKm ?? 0);

  return {
    points,
    distanceKm: Math.round(lastDistKm),
    elevationGainM: Math.round(elevGain),
    profile,
    bounds: {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
    },
    gradientStats: {
      flat: Math.round((flat / total) * 100),
      rolling: Math.round((rolling / total) * 100),
      hilly: Math.round((hilly / total) * 100),
      steep: Math.round((steep / total) * 100),
    },
  };
}

export function sportTypeToSurface(sportType: string): SurfaceType {
  if (sportType === 'GravelRide') return 'gravel';
  if (sportType === 'MountainBikeRide' || sportType === 'EMountainBikeRide')
    return 'mtb';
  return 'road';
}

export function sportTypeLabel(sportType: string): string {
  const labels: Record<string, string> = {
    Ride: 'Route',
    GravelRide: 'Gravel',
    MountainBikeRide: 'VTT',
    EMountainBikeRide: 'E-VTT',
    EBikeRide: 'E-Bike',
    VirtualRide: 'Virtuel',
    Run: 'Course',
    TrailRun: 'Trail',
    Hike: 'Randonnée',
  };
  return labels[sportType] ?? sportType;
}
