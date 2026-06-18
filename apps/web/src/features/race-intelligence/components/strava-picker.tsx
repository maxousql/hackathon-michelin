'use client';

import { useEffect, useRef, useState } from 'react';

import type { SurfaceType } from '@michelin/contracts';

import type { GpxStats } from '../utils/gpx-parser';
import { parseGpx } from '../utils/gpx-parser';
import {
  sportTypeLabel,
  sportTypeToSurface,
  streamsToGpxStats,
} from '../utils/strava-streams';

interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  distance: number;
  total_elevation_gain: number;
  start_date_local: string;
  start_latlng: [number, number] | [];
}

interface StravaRoute {
  id: number;
  id_str: string;
  name: string;
  type: number; // 1=vélo, 2=course
  sub_type: number; // 1=route, 2=mtb, 3=cx, 4=trail, 5=mixte
  distance: number;
  elevation_gain: number;
}

interface StravaStreams {
  latlng: { data: [number, number][] };
  altitude: { data: number[] };
  distance: { data: number[] };
}

interface StravaPickerProps {
  onActivitySelected: (
    stats: GpxStats,
    surface: SurfaceType,
    startLatLon: [number, number] | null,
  ) => void;
}

const ROUTE_SUBTYPE: Record<number, string> = {
  1: 'Route',
  2: 'VTT',
  3: 'Cyclo-cross',
  4: 'Trail',
  5: 'Mixte',
};

function routeSubtypeToSurface(subType: number): SurfaceType {
  if (subType === 2) return 'mtb';
  if (subType === 4 || subType === 5) return 'gravel';
  return 'road';
}

export function StravaPicker({ onActivitySelected }: StravaPickerProps) {
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState<'activities' | 'routes'>('activities');
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [routes, setRoutes] = useState<StravaRoute[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const popupRef = useRef<Window | null>(null);

  async function fetchActivities() {
    setLoadingActivities(true);
    try {
      const res = await fetch('/api/strava/activities');
      if (res.ok) setActivities((await res.json()) as StravaActivity[]);
    } finally {
      setLoadingActivities(false);
    }
  }

  async function fetchRoutes() {
    setLoadingRoutes(true);
    try {
      const res = await fetch('/api/strava/routes');
      if (res.ok) setRoutes((await res.json()) as StravaRoute[]);
    } finally {
      setLoadingRoutes(false);
    }
  }

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type !== 'strava_connected' || e.data.status !== 'ok') return;
      setConnected(true);
      void fetchActivities();
      void fetchRoutes();
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    fetch('/api/strava/activities')
      .then((r) => {
        if (r.ok) {
          setConnected(true);
          return r.json();
        }
        return null;
      })
      .then((data: StravaActivity[] | null) => {
        if (data) setActivities(data);
      })
      .catch(() => {});
    fetch('/api/strava/routes')
      .then((r) => {
        if (r.ok) return r.json();
        return null;
      })
      .then((data: StravaRoute[] | null) => {
        if (data) setRoutes(data);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openAuthPopup() {
    const w = 600,
      h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    popupRef.current = window.open(
      '/api/strava/auth',
      'strava_auth',
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`,
    );
  }

  async function selectActivity(act: StravaActivity) {
    setLoadingId(act.id);
    try {
      const res = await fetch(`/api/strava/activities/${act.id}/streams`);
      if (!res.ok) return;
      const streams = (await res.json()) as StravaStreams;
      const stats = streamsToGpxStats(streams);
      if (!stats) return;
      const surface = sportTypeToSurface(act.sport_type);
      const startLatLon =
        Array.isArray(act.start_latlng) && act.start_latlng.length === 2
          ? (act.start_latlng as [number, number])
          : null;
      setSelectedId(act.id);
      onActivitySelected(stats, surface, startLatLon);
    } finally {
      setLoadingId(null);
    }
  }

  async function selectRoute(route: StravaRoute) {
    setLoadingId(route.id);
    try {
      const routeId = route.id_str ?? String(route.id);
      const res = await fetch(`/api/strava/routes/${routeId}/streams`);
      if (!res.ok) return;
      const gpx = await res.text();
      const stats = parseGpx(gpx);
      if (!stats) return;
      const surface = routeSubtypeToSurface(route.sub_type);
      const startLatLon = stats.points[0]
        ? ([stats.points[0].lat, stats.points[0].lon] as [number, number])
        : null;
      setSelectedId(route.id);
      onActivitySelected(stats, surface, startLatLon);
    } finally {
      setLoadingId(null);
    }
  }

  if (!connected) {
    return (
      <button
        type="button"
        className="ri-strava-connect-btn"
        onClick={openAuthPopup}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        Se connecter avec Strava
      </button>
    );
  }

  const visibleActivities = activities.filter(
    (a) => Array.isArray(a.start_latlng) && a.start_latlng.length === 2,
  );

  return (
    <div className="ri-strava-activities">
      <div className="ri-strava-activities-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FC4C02">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        <div className="ri-strava-tabs">
          <button
            type="button"
            className={`ri-strava-tab${tab === 'activities' ? ' active' : ''}`}
            onClick={() => setTab('activities')}
          >
            Activités{' '}
            {visibleActivities.length > 0 && (
              <span className="ri-strava-count">
                {visibleActivities.length}
              </span>
            )}
          </button>
          <button
            type="button"
            className={`ri-strava-tab${tab === 'routes' ? ' active' : ''}`}
            onClick={() => setTab('routes')}
          >
            Itinéraires{' '}
            {routes.length > 0 && (
              <span className="ri-strava-count">{routes.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Activités */}
      {tab === 'activities' && (
        <ul className="ri-strava-list">
          {loadingActivities && (
            <li>
              <div className="ri-strava-loading">Chargement…</div>
            </li>
          )}
          {!loadingActivities && visibleActivities.length === 0 && (
            <li>
              <div className="ri-strava-loading">
                Aucune activité GPS trouvée.
              </div>
            </li>
          )}
          {visibleActivities.map((act) => {
            const distKm = Math.round(act.distance / 1000);
            const elevM = Math.round(act.total_elevation_gain);
            const date = new Date(act.start_date_local).toLocaleDateString(
              'fr-FR',
              { day: '2-digit', month: 'short' },
            );
            const isSelected = selectedId === act.id;
            const isLoading = loadingId === act.id;
            return (
              <li key={act.id}>
                <button
                  type="button"
                  className={`ri-strava-activity${isSelected ? ' ri-strava-activity--selected' : ''}`}
                  onClick={() => selectActivity(act)}
                  disabled={isLoading || loadingId !== null}
                >
                  <div className="ri-strava-activity-left">
                    <span className="ri-strava-activity-name">{act.name}</span>
                    <div className="ri-strava-activity-meta">
                      <span className="ri-strava-badge">
                        {sportTypeLabel(act.sport_type)}
                      </span>
                      <span>{distKm} km</span>
                      <span>↑ {elevM} m</span>
                      <span>{date}</span>
                    </div>
                  </div>
                  <div className="ri-strava-activity-right">
                    {isLoading ? (
                      <span className="ri-strava-spinner" />
                    ) : isSelected ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#003189"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Itinéraires */}
      {tab === 'routes' && (
        <ul className="ri-strava-list">
          {loadingRoutes && (
            <li>
              <div className="ri-strava-loading">Chargement…</div>
            </li>
          )}
          {!loadingRoutes && routes.length === 0 && (
            <li>
              <div className="ri-strava-loading">
                Aucun itinéraire enregistré sur Strava.
              </div>
            </li>
          )}
          {routes.map((route) => {
            const distKm = Math.round(route.distance / 1000);
            const elevM = Math.round(route.elevation_gain);
            const subLabel = ROUTE_SUBTYPE[route.sub_type] ?? 'Itinéraire';
            const isSelected = selectedId === route.id;
            const isLoading = loadingId === route.id;
            return (
              <li key={route.id}>
                <button
                  type="button"
                  className={`ri-strava-activity${isSelected ? ' ri-strava-activity--selected' : ''}`}
                  onClick={() => selectRoute(route)}
                  disabled={isLoading || loadingId !== null}
                >
                  <div className="ri-strava-activity-left">
                    <span className="ri-strava-activity-name">
                      {route.name}
                    </span>
                    <div className="ri-strava-activity-meta">
                      <span className="ri-strava-badge">{subLabel}</span>
                      <span>{distKm} km</span>
                      <span>↑ {elevM} m</span>
                    </div>
                  </div>
                  <div className="ri-strava-activity-right">
                    {isLoading ? (
                      <span className="ri-strava-spinner" />
                    ) : isSelected ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#003189"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
