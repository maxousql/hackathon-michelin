'use client';

import dynamic from 'next/dynamic';

import type { GpxPoint } from '../utils/gpx-parser';

interface RouteMapProps {
  points: GpxPoint[];
  highlightLatLon?: [number, number] | null;
  variant?: 'default' | 'michelin';
}

const RouteMapInner = dynamic(
  () => import('./route-map-inner').then((m) => m.RouteMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="ri-route-map ri-route-map--loading">
        <span>Chargement de la carte…</span>
      </div>
    ),
  },
);

export function RouteMap(props: RouteMapProps) {
  return <RouteMapInner {...props} />;
}
