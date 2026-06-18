'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import type { LatLng } from '../services/geo';
import styles from './retailer-map.module.css';

export interface MapPoint {
  id: string;
  name: string;
  /** Libellé secondaire (ex. « France · ~120 km »). */
  label: string;
  website: string;
  position: LatLng;
}

interface RetailerMapProps {
  points: MapPoint[];
  userPosition?: LatLng | null;
}

const retailerIcon = L.divIcon({
  className: '',
  html: `<span class="${styles.pin}"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const userIcon = L.divIcon({
  className: '',
  html: `<span class="${styles.userPin}"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/** Ajuste la vue pour englober tous les points (et l'utilisateur). */
function FitBounds({ points, userPosition }: RetailerMapProps) {
  const map = useMap();

  useEffect(() => {
    const coords: [number, number][] = points.map((p) => [
      p.position.lat,
      p.position.lng,
    ]);
    if (userPosition) coords.push([userPosition.lat, userPosition.lng]);
    const [first] = coords;
    if (!first) return;
    if (coords.length === 1) {
      map.setView(first, 7);
      return;
    }
    map.fitBounds(coords, { padding: [40, 40], maxZoom: 9 });
  }, [points, userPosition, map]);

  return null;
}

export default function RetailerMap({
  points,
  userPosition,
}: RetailerMapProps) {
  return (
    <MapContainer
      className={styles.map}
      center={[48, 7]}
      zoom={4}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
          <Popup>Votre position</Popup>
        </Marker>
      )}

      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.position.lat, point.position.lng]}
          icon={retailerIcon}
        >
          <Popup>
            <strong>{point.name}</strong>
            <br />
            {point.label}
            <br />
            <a href={point.website} target="_blank" rel="noreferrer noopener">
              Visiter le site →
            </a>
          </Popup>
        </Marker>
      ))}

      <FitBounds points={points} userPosition={userPosition} />
    </MapContainer>
  );
}
