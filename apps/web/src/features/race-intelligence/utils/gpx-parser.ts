export interface GpxPoint {
  lat: number;
  lon: number;
  ele: number;
  distKm: number;
}

export interface GpxStats {
  points: GpxPoint[];
  distanceKm: number;
  elevationGainM: number;
  profile: Array<{ distKm: number; eleM: number }>;
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number };
  gradientStats: {
    flat: number;
    rolling: number;
    hilly: number;
    steep: number;
  };
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

export function parseGpx(gpxString: string): GpxStats | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxString, 'text/xml');

  const ptEls = Array.from(doc.querySelectorAll('trkpt'));
  if (ptEls.length < 2) return null;

  const raw = ptEls.map((el) => ({
    lat: parseFloat(el.getAttribute('lat') ?? '0'),
    lon: parseFloat(el.getAttribute('lon') ?? '0'),
    ele: parseFloat(el.querySelector('ele')?.textContent ?? '0'),
  }));

  const points: GpxPoint[] = [];
  let distKm = 0;
  let elevGain = 0;
  let flat = 0,
    rolling = 0,
    hilly = 0,
    steep = 0;

  for (let i = 0; i < raw.length; i++) {
    const pt = raw[i]!;
    if (i > 0) {
      const prev = raw[i - 1]!;
      const segDist = haversineKm(prev.lat, prev.lon, pt.lat, pt.lon);
      distKm += segDist;
      const dEle = pt.ele - prev.ele;
      if (dEle > 0) elevGain += dEle;
      const grade =
        segDist > 0.0001 ? Math.abs((dEle / (segDist * 1000)) * 100) : 0;
      if (grade < 3) flat += segDist;
      else if (grade < 6) rolling += segDist;
      else if (grade < 12) hilly += segDist;
      else steep += segDist;
    }
    points.push({
      lat: pt.lat,
      lon: pt.lon,
      ele: pt.ele,
      distKm: Math.round(distKm * 100) / 100,
    });
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

  return {
    points,
    distanceKm: Math.round(distKm),
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
