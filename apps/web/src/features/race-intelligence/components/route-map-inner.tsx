'use client';

import 'leaflet/dist/leaflet.css';
import type * as LeafletNS from 'leaflet';
import type {
  CircleMarker,
  LatLngExpression,
  Map,
  Marker,
  Polyline,
} from 'leaflet';
import { useEffect, useRef } from 'react';

import type { GpxPoint } from '../utils/gpx-parser';

interface RouteMapInnerProps {
  points: GpxPoint[];
  highlightLatLon?: [number, number] | null;
  colorMode?: 'single' | 'terrain';
  variant?: 'default' | 'michelin';
}

export function RouteMapInner({
  colorMode = 'single',
  points,
  highlightLatLon,
  variant = 'default',
}: RouteMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const routeCasingRefs = useRef<Polyline[]>([]);
  const routeLineRefs = useRef<Polyline[]>([]);
  const startMarkerRef = useRef<Marker | null>(null);
  const endMarkerRef = useRef<Marker | null>(null);
  const highlightMarkerRef = useRef<CircleMarker | null>(null);
  const mapReadyRef = useRef(false);

  // ── Init map (once on mount) ─────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    const container = containerRef.current as HTMLDivElement & {
      _leaflet_id?: number;
    };
    if (container._leaflet_id) return;

    let cancelled = false;

    import('leaflet').then((mod) => {
      if (cancelled || !containerRef.current) return;
      const c = containerRef.current as HTMLDivElement & {
        _leaflet_id?: number;
      };
      if (c._leaflet_id) return;

      const L = mod.default;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: variant !== 'michelin',
        attributionControl: true,
        preferCanvas: true,
      });
      mapRef.current = map;

      if (variant === 'michelin') {
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19,
          },
        ).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);
      }

      drawRoute(L, map, points);
      mapReadyRef.current = true;
    });

    return () => {
      cancelled = true;
      mapReadyRef.current = false;
      highlightMarkerRef.current?.remove();
      highlightMarkerRef.current = null;
      clearRouteLayers();
      startMarkerRef.current?.remove();
      startMarkerRef.current = null;
      endMarkerRef.current?.remove();
      endMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mise à jour du tracé quand les points changent (nouvelle activité) ───
  useEffect(() => {
    if (!mapReadyRef.current || !mapRef.current || points.length === 0) return;

    import('leaflet').then((mod) => {
      if (!mapRef.current) return;
      const L = mod.default;
      clearRouteLayers();
      startMarkerRef.current?.remove();
      startMarkerRef.current = null;
      endMarkerRef.current?.remove();
      endMarkerRef.current = null;
      highlightMarkerRef.current?.remove();
      highlightMarkerRef.current = null;
      drawRoute(L, mapRef.current, points);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorMode, points, variant]);

  // ── Highlight marker (hover sync avec le profil d'élévation) ────────────
  useEffect(() => {
    highlightMarkerRef.current?.remove();
    highlightMarkerRef.current = null;

    if (!highlightLatLon || !mapRef.current) return;

    import('leaflet').then((mod) => {
      if (!mapRef.current || !highlightLatLon) return;
      const L = mod.default;
      const isMichelin = variant === 'michelin';
      highlightMarkerRef.current = L.circleMarker(highlightLatLon, {
        radius: isMichelin ? 8 : 7,
        color: isMichelin ? '#ffd200' : '#003189',
        fillColor: isMichelin ? '#003189' : '#FFD200',
        fillOpacity: 1,
        weight: isMichelin ? 3 : 2.5,
      }).addTo(mapRef.current);
    });
  }, [highlightLatLon, variant]);

  return (
    <div
      ref={containerRef}
      className={`ri-route-map ri-route-map--${variant}`}
    />
  );

  function drawRoute(L: typeof LeafletNS, map: Map, pts: GpxPoint[]) {
    const latlngs: LatLngExpression[] = pts.map((p) => [p.lat, p.lon]);
    const isMichelin = variant === 'michelin';
    const usesTerrainColors = colorMode === 'terrain';
    const routeSegments = usesTerrainColors
      ? terrainSegments(pts)
      : [{ color: null, pts }];

    for (const segment of routeSegments) {
      const segmentLatLngs = segment.pts.map(
        (p) => [p.lat, p.lon] as LatLngExpression,
      );

      if (isMichelin && !usesTerrainColors) {
        routeCasingRefs.current.push(
          L.polyline(segmentLatLngs, {
            color: '#00205b',
            lineCap: 'round',
            lineJoin: 'round',
            opacity: 0.92,
            weight: 9,
          }).addTo(map),
        );
      }

      routeLineRefs.current.push(
        L.polyline(segmentLatLngs, {
          color: segment.color ?? (isMichelin ? '#ffd200' : '#003189'),
          lineCap: 'round',
          lineJoin: 'round',
          opacity: isMichelin ? 1 : 0.9,
          weight: usesTerrainColors ? 6 : isMichelin ? 5 : 4,
        }).addTo(map),
      );
    }

    const startIcon = L.divIcon({
      html: isMichelin
        ? '<div style="display:grid;place-items:center;width:28px;height:28px;background:#ffd200;border:3px solid #00205b;border-radius:50%;box-shadow:0 10px 24px rgba(0,32,91,.28);color:#00205b;font-size:11px;font-weight:900">D</div>'
        : '<div style="width:12px;height:12px;background:#FFD200;border:2.5px solid #003189;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
      className: '',
      iconSize: isMichelin ? [28, 28] : [12, 12],
      iconAnchor: isMichelin ? [14, 14] : [6, 6],
    });
    const endIcon = L.divIcon({
      html: isMichelin
        ? '<div style="display:grid;place-items:center;width:28px;height:28px;background:#00205b;border:3px solid #ffd200;border-radius:50%;box-shadow:0 10px 24px rgba(0,32,91,.28);color:#ffffff;font-size:11px;font-weight:900">A</div>'
        : '<div style="width:12px;height:12px;background:#003189;border:2.5px solid #FFD200;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
      className: '',
      iconSize: isMichelin ? [28, 28] : [12, 12],
      iconAnchor: isMichelin ? [14, 14] : [6, 6],
    });

    const first = pts[0];
    const last = pts[pts.length - 1];
    if (first)
      startMarkerRef.current = L.marker([first.lat, first.lon], {
        icon: startIcon,
      }).addTo(map);
    if (last)
      endMarkerRef.current = L.marker([last.lat, last.lon], {
        icon: endIcon,
      }).addTo(map);

    map.fitBounds(L.latLngBounds(latlngs), {
      padding: isMichelin ? [36, 36] : [24, 24],
    });
  }

  function clearRouteLayers() {
    for (const layer of routeCasingRefs.current) layer.remove();
    for (const layer of routeLineRefs.current) layer.remove();
    routeCasingRefs.current = [];
    routeLineRefs.current = [];
  }
}

function terrainSegments(points: GpxPoint[]): Array<{
  color: string;
  pts: GpxPoint[];
}> {
  if (points.length < 2) return [];

  const segments: Array<{ color: string; pts: GpxPoint[] }> = [];

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]!;
    const current = points[index]!;
    const color = terrainColor(previous, current);
    const last = segments[segments.length - 1];

    if (last && last.color === color) {
      last.pts.push(current);
    } else {
      segments.push({ color, pts: [previous, current] });
    }
  }

  return segments;
}

function terrainColor(previous: GpxPoint, current: GpxPoint): string {
  const distanceM = Math.max((current.distKm - previous.distKm) * 1000, 1);
  const grade = Math.abs(((current.ele - previous.ele) / distanceM) * 100);

  if (grade < 3) return '#cbd5e1';
  if (grade < 6) return '#16a34a';
  if (grade < 12) return '#ffd200';
  return '#f97316';
}
