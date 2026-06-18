export interface GpxStats {
  distanceKm: number;
  elevationGainM: number;
  points: { latitude: number; longitude: number }[];
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number };
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

export function parseGpxMobile(content: string): GpxStats | null {
  const trkptRegex =
    /<trkpt\s[^>]*?(lat="([^"]+)"\s+lon="([^"]+)"|lon="([^"]+)"\s+lat="([^"]+)")[^>]*>([\s\S]*?)<\/trkpt>/g;
  const eleRegex = /<ele>([\d.eE+-]+)<\/ele>/;

  const points: { lat: number; lon: number; ele: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = trkptRegex.exec(content)) !== null) {
    const lat = parseFloat(match[2] ?? match[5] ?? '0');
    const lon = parseFloat(match[3] ?? match[4] ?? '0');
    const eleMatch = eleRegex.exec(match[6] ?? '');
    const ele = eleMatch ? parseFloat(eleMatch[1]!) : 0;
    if (!isNaN(lat) && !isNaN(lon)) points.push({ lat, lon, ele });
  }

  if (points.length < 2) return null;

  let distKm = 0;
  let elevGain = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    distKm += haversineKm(prev.lat, prev.lon, curr.lat, curr.lon);
    const dEle = curr.ele - prev.ele;
    if (dEle > 0) elevGain += dEle;
  }

  const step = Math.max(1, Math.floor(points.length / 500));
  const decimated = points.filter((_, i) => i % step === 0);

  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);

  return {
    distanceKm: Math.round(distKm),
    elevationGainM: Math.round(elevGain),
    points: decimated.map((p) => ({ latitude: p.lat, longitude: p.lon })),
    bounds: {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
    },
  };
}
