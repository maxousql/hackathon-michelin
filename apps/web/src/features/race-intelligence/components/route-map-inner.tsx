'use client';

import 'leaflet/dist/leaflet.css';
import type * as LeafletNS from 'leaflet';
import type { CircleMarker, Map, Marker, Polyline } from 'leaflet';
import { useEffect, useRef } from 'react';

import type { GpxPoint } from '../utils/gpx-parser';

interface RouteMapInnerProps {
  points: GpxPoint[];
  highlightLatLon?: [number, number] | null;
}

export function RouteMapInner({ points, highlightLatLon }: RouteMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const polylineRef = useRef<Polyline | null>(null);
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
        zoomControl: true,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      drawRoute(L, map, points);
      mapReadyRef.current = true;
    });

    return () => {
      cancelled = true;
      mapReadyRef.current = false;
      highlightMarkerRef.current?.remove();
      highlightMarkerRef.current = null;
      polylineRef.current = null;
      startMarkerRef.current = null;
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
      polylineRef.current?.remove();
      startMarkerRef.current?.remove();
      endMarkerRef.current?.remove();
      highlightMarkerRef.current?.remove();
      highlightMarkerRef.current = null;
      drawRoute(L, mapRef.current, points);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  // ── Highlight marker (hover sync avec le profil d'élévation) ────────────
  useEffect(() => {
    highlightMarkerRef.current?.remove();
    highlightMarkerRef.current = null;

    if (!highlightLatLon || !mapRef.current) return;

    import('leaflet').then((mod) => {
      if (!mapRef.current || !highlightLatLon) return;
      const L = mod.default;
      highlightMarkerRef.current = L.circleMarker(highlightLatLon, {
        radius: 7,
        color: '#003189',
        fillColor: '#FFD200',
        fillOpacity: 1,
        weight: 2.5,
      }).addTo(mapRef.current);
    });
  }, [highlightLatLon]);

  return <div ref={containerRef} className="ri-route-map" />;

  function drawRoute(L: typeof LeafletNS, map: Map, pts: GpxPoint[]) {
    const latlngs = pts.map((p) => [p.lat, p.lon] as [number, number]);
    polylineRef.current = L.polyline(latlngs, {
      color: '#003189',
      weight: 4,
      opacity: 0.9,
    }).addTo(map);

    const startIcon = L.divIcon({
      html: '<div style="width:12px;height:12px;background:#FFD200;border:2.5px solid #003189;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
      className: '',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
    const endIcon = L.divIcon({
      html: '<div style="width:12px;height:12px;background:#003189;border:2.5px solid #FFD200;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
      className: '',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
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

    map.fitBounds(polylineRef.current.getBounds(), { padding: [24, 24] });
  }
}
