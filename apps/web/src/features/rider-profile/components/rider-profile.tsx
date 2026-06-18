'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';

import {
  stravaLogoutAction,
  logoutAction,
} from '@/features/auth/actions/auth.actions';
import type { AuthUser } from '@michelin/contracts';
import type { Bike, CreateBikeRequest } from '@michelin/contracts';

import '../rider-profile.css';

interface StravaBike {
  id: string;
  name: string;
  distance: number;
  primary: boolean;
}

interface StravaProfile {
  id: number;
  firstName: string;
  lastName: string;
  photo: string;
  city: string;
  country: string;
  bikes: StravaBike[];
}

interface StravaActivity {
  id: number;
  sport_type: string;
  distance: number;
  total_elevation_gain: number;
  start_date_local: string;
}

interface RiderProfileProps {
  initialProfile: StravaProfile | null;
  authUser: AuthUser | null;
  stravaConnected: boolean;
}

interface TireRec {
  name: string;
  sub: string;
}

function getTireRecFromType(type: string, distanceKm?: number): TireRec {
  if (type === 'mtb')
    return {
      name: 'Michelin Wild Enduro',
      sub: 'Accroche maximale · Terrain technique',
    };
  if (type === 'gravel')
    return {
      name: 'Michelin Power Gravel',
      sub: 'Polyvalence · Confort sur mixte',
    };
  if (distanceKm && distanceKm > 10000)
    return {
      name: 'Michelin Pro4 Endurance V2',
      sub: 'Longévité maximale · Anti-crevaison',
    };
  return {
    name: 'Michelin Power Cup 2',
    sub: 'Performance · Adhérence en compétition',
  };
}

function getTireRecFromStravaBike(bike: StravaBike): TireRec {
  const n = bike.name.toLowerCase();
  if (
    n.includes('mtb') ||
    n.includes('mountain') ||
    n.includes('vtt') ||
    n.includes('enduro') ||
    n.includes('trail') ||
    n.includes('dirt')
  ) {
    return {
      name: 'Michelin Wild Enduro',
      sub: 'Accroche maximale · Terrain technique',
    };
  }
  if (
    n.includes('gravel') ||
    n.includes('cx') ||
    n.includes('cross') ||
    n.includes('adventure') ||
    n.includes('bikepacking')
  ) {
    return {
      name: 'Michelin Power Gravel',
      sub: 'Polyvalence · Confort sur mixte',
    };
  }
  if (bike.distance > 10000000)
    return {
      name: 'Michelin Pro4 Endurance V2',
      sub: 'Longévité maximale · Anti-crevaison',
    };
  return {
    name: 'Michelin Power Cup 2',
    sub: 'Performance · Adhérence en compétition',
  };
}

function getSportTerrain(sportType: string): string {
  const s = sportType.toLowerCase();
  if (s.includes('mountain') || s.includes('mtb')) return 'VTT';
  if (s.includes('gravel') || s.includes('trail')) return 'Gravel';
  return 'Route';
}

function computeStats(activities: StravaActivity[]) {
  if (!activities.length)
    return { sorties: 0, terrain: '—', distanceMoy: 0, elevMoy: 0 };

  const eightWeeksAgo = Date.now() - 8 * 7 * 24 * 60 * 60 * 1000;
  const recent = activities.filter(
    (a) => new Date(a.start_date_local).getTime() > eightWeeksAgo,
  );
  const sorties = Math.round((recent.length / 8) * 10) / 10;

  const counts: Record<string, number> = {};
  for (const a of activities) {
    const t = getSportTerrain(a.sport_type);
    counts[t] = (counts[t] ?? 0) + 1;
  }
  const terrain =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  const distanceMoy = Math.round(
    activities.reduce((s, a) => s + a.distance, 0) / activities.length / 1000,
  );
  const elevMoy = Math.round(
    activities.reduce((s, a) => s + a.total_elevation_gain, 0) /
      activities.length,
  );

  return { sorties, terrain, distanceMoy, elevMoy };
}

const BIKE_TYPE_LABELS: Record<string, string> = {
  road: 'Route',
  mtb: 'VTT',
  gravel: 'Gravel',
};

export function RiderProfile({
  initialProfile,
  authUser,
  stravaConnected,
}: RiderProfileProps) {
  const [stravaProfile, setStravaProfile] = useState<StravaProfile | null>(
    initialProfile,
  );
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [manualBikes, setManualBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBike, setShowAddBike] = useState(false);
  const [logoutPending, startLogout] = useTransition();
  const [addPending, setAddPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const firstName = stravaProfile?.firstName ?? authUser?.firstName ?? '';
  const lastName = stravaProfile?.lastName ?? authUser?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || '—';
  const photo = stravaProfile?.photo ?? null;
  const city = stravaProfile?.city ?? '';
  const country = stravaProfile?.country ?? '';

  useEffect(() => {
    async function load() {
      try {
        const promises: Promise<void>[] = [];

        if (stravaConnected) {
          promises.push(
            fetch('/api/strava/athlete').then(async (r) => {
              if (!r.ok) return;
              const data = (await r.json()) as {
                id: number;
                firstname: string;
                lastname: string;
                profile_medium: string;
                city: string;
                country: string;
                bikes: StravaBike[];
              };
              setStravaProfile({
                id: data.id,
                firstName: data.firstname,
                lastName: data.lastname,
                photo: data.profile_medium,
                city: data.city ?? '',
                country: data.country ?? '',
                bikes: data.bikes ?? [],
              });
            }),
            fetch('/api/strava/activities').then(async (r) => {
              if (r.ok) setActivities((await r.json()) as StravaActivity[]);
            }),
          );
        }

        promises.push(
          fetch('/api/bikes').then(async (r) => {
            if (r.ok) setManualBikes((await r.json()) as Bike[]);
          }),
        );

        await Promise.all(promises);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [stravaConnected]);

  async function handleAddBike(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: CreateBikeRequest = {
      name: fd.get('name') as string,
      type: fd.get('type') as 'road' | 'mtb' | 'gravel',
      distanceKm: Number(fd.get('distanceKm') ?? 0),
      isPrimary: fd.get('isPrimary') === 'true',
    };
    setAddPending(true);
    try {
      const res = await fetch('/api/bikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = (await res.json()) as Bike;
        setManualBikes((prev) =>
          payload.isPrimary
            ? [created, ...prev.map((b) => ({ ...b, isPrimary: false }))]
            : [...prev, created],
        );
        setShowAddBike(false);
        formRef.current?.reset();
      }
    } finally {
      setAddPending(false);
    }
  }

  async function handleDeleteBike(id: string) {
    await fetch(`/api/bikes/${id}`, { method: 'DELETE' });
    setManualBikes((prev) => prev.filter((b) => b.id !== id));
  }

  const stats = computeStats(activities);
  const stravaBikes = stravaProfile?.bikes ?? [];

  return (
    <main className="rp-page">
      {/* ── Hero ── */}
      <div className="rp-hero">
        <div className="container rp-hero-inner">
          <div className="rp-hero-left">
            {photo ? (
              <Image
                src={photo}
                alt={fullName}
                width={80}
                height={80}
                className="rp-avatar"
                unoptimized
              />
            ) : (
              <div
                className="rp-avatar rp-avatar--placeholder"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
                </svg>
              </div>
            )}
            <div className="rp-hero-text">
              <p className="rp-eyebrow">Profil cycliste</p>
              <h1 className="rp-name">{fullName}</h1>
              {city && (
                <p className="rp-city">
                  {city}
                  {country ? `, ${country}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="rp-hero-right">
            {stravaConnected && (
              <div className="rp-strava-badge">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="#FC4C02"
                  aria-hidden="true"
                >
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
                Connecté via Strava
              </div>
            )}
            <button
              type="button"
              className="rp-logout-btn"
              disabled={logoutPending}
              onClick={() =>
                startLogout(() =>
                  stravaConnected ? stravaLogoutAction() : logoutAction(),
                )
              }
            >
              {logoutPending ? 'Déconnexion…' : 'Se déconnecter'}
            </button>
          </div>
        </div>
      </div>

      <div className="container rp-content">
        {/* ── Stats (Strava only) ── */}
        {stravaConnected && (
          <section className="rp-section">
            <p className="rp-kicker">Activité</p>
            <h2 className="rp-section-title">Tes habitudes de pratique</h2>
            <div className="rp-stats-grid">
              <div className="rp-stat-card">
                <span className="rp-stat-value">
                  {loading ? '…' : stats.sorties}
                </span>
                <span className="rp-stat-label">sorties / semaine</span>
              </div>
              <div className="rp-stat-card">
                <span className="rp-stat-value">
                  {loading ? '…' : stats.terrain}
                </span>
                <span className="rp-stat-label">terrain dominant</span>
              </div>
              <div className="rp-stat-card">
                <span className="rp-stat-value">
                  {loading ? '…' : `${stats.distanceMoy} km`}
                </span>
                <span className="rp-stat-label">distance moyenne</span>
              </div>
              <div className="rp-stat-card">
                <span className="rp-stat-value">
                  {loading ? '…' : `${stats.elevMoy} m`}
                </span>
                <span className="rp-stat-label">D+ moyen</span>
              </div>
            </div>
          </section>
        )}

        {/* ── Vélos ── */}
        <section className="rp-section">
          <div className="rp-section-header">
            <div>
              <p className="rp-kicker">Équipement</p>
              <h2 className="rp-section-title">Mes vélos</h2>
            </div>
            <button
              type="button"
              className="rp-add-btn"
              onClick={() => setShowAddBike(true)}
            >
              + Ajouter un vélo
            </button>
          </div>

          {loading ? (
            <div className="rp-bikes-loading">
              {[1, 2].map((i) => (
                <div key={i} className="rp-bike-skeleton" />
              ))}
            </div>
          ) : stravaBikes.length === 0 && manualBikes.length === 0 ? (
            <p className="rp-empty">
              Aucun vélo enregistré. Ajoute ton premier vélo !
            </p>
          ) : (
            <div className="rp-bikes-list">
              {stravaBikes.map((bike) => {
                const rec = getTireRecFromStravaBike(bike);
                const km = Math.round(bike.distance / 1000).toLocaleString(
                  'fr-FR',
                );
                return (
                  <div
                    key={bike.id}
                    className={`rp-bike-card${bike.primary ? ' rp-bike-card--primary' : ''}`}
                  >
                    <div className="rp-bike-left">
                      <div className="rp-bike-icon" aria-hidden="true">
                        <BikeIcon />
                      </div>
                      <div>
                        <div className="rp-bike-header">
                          <h3 className="rp-bike-name">{bike.name}</h3>
                          {bike.primary && (
                            <span className="rp-primary-badge">Principal</span>
                          )}
                          <span className="rp-source-badge rp-source-badge--strava">
                            Strava
                          </span>
                        </div>
                        <p className="rp-bike-distance">{km} km parcourus</p>
                      </div>
                    </div>
                    <div className="rp-bike-rec">
                      <p className="rp-rec-label">Pneu recommandé</p>
                      <p className="rp-rec-name">{rec.name}</p>
                      <p className="rp-rec-sub">{rec.sub}</p>
                    </div>
                  </div>
                );
              })}

              {manualBikes.map((bike) => {
                const rec = getTireRecFromType(bike.type, bike.distanceKm);
                const km = bike.distanceKm.toLocaleString('fr-FR');
                return (
                  <div
                    key={bike.id}
                    className={`rp-bike-card${bike.isPrimary ? ' rp-bike-card--primary' : ''}`}
                  >
                    <div className="rp-bike-left">
                      <div className="rp-bike-icon" aria-hidden="true">
                        <BikeIcon />
                      </div>
                      <div>
                        <div className="rp-bike-header">
                          <h3 className="rp-bike-name">{bike.name}</h3>
                          {bike.isPrimary && (
                            <span className="rp-primary-badge">Principal</span>
                          )}
                          <span className="rp-source-badge">
                            {BIKE_TYPE_LABELS[bike.type] ?? bike.type}
                          </span>
                        </div>
                        <p className="rp-bike-distance">{km} km parcourus</p>
                      </div>
                    </div>
                    <div className="rp-bike-right">
                      <div className="rp-bike-rec">
                        <p className="rp-rec-label">Pneu recommandé</p>
                        <p className="rp-rec-name">{rec.name}</p>
                        <p className="rp-rec-sub">{rec.sub}</p>
                      </div>
                      <button
                        type="button"
                        className="rp-delete-btn"
                        onClick={() => handleDeleteBike(bike.id)}
                        aria-label="Supprimer ce vélo"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── CTA ── */}
        <section className="rp-cta-section">
          <div className="rp-cta-card">
            <div className="rp-cta-text">
              <p className="rp-kicker rp-kicker--yellow">Race Intelligence</p>
              <h2 className="rp-cta-title">Prêt à analyser ton parcours ?</h2>
              <p className="rp-cta-sub">
                {stravaConnected
                  ? 'Tu es déjà connecté à Strava — importe directement ton itinéraire pour une recommandation pneu personnalisée.'
                  : 'Analyse ton parcours et reçois une recommandation pneu personnalisée selon la météo et le terrain.'}
              </p>
            </div>
            <Link
              href="/race-intelligence"
              className="michelin-button button-primary rp-cta-btn"
            >
              Lancer Race Intelligence
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
        </section>
      </div>

      {/* ── Modal Ajouter un vélo ── */}
      {showAddBike && (
        <div className="rp-modal-overlay" onClick={() => setShowAddBike(false)}>
          <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rp-modal-header">
              <h2 className="rp-modal-title">Ajouter un vélo</h2>
              <button
                type="button"
                className="rp-modal-close"
                onClick={() => setShowAddBike(false)}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <form
              ref={formRef}
              onSubmit={handleAddBike}
              className="rp-modal-form"
            >
              <div className="rp-field">
                <label htmlFor="bike-name" className="rp-label">
                  Nom du vélo
                </label>
                <input
                  id="bike-name"
                  name="name"
                  type="text"
                  className="rp-input"
                  placeholder="ex. Trek Domane SL6"
                  required
                  maxLength={100}
                />
              </div>
              <div className="rp-field">
                <label htmlFor="bike-type" className="rp-label">
                  Type
                </label>
                <select
                  id="bike-type"
                  name="type"
                  className="rp-input"
                  required
                >
                  <option value="road">Route</option>
                  <option value="gravel">Gravel</option>
                  <option value="mtb">VTT</option>
                </select>
              </div>
              <div className="rp-field">
                <label htmlFor="bike-km" className="rp-label">
                  Kilométrage actuel (km)
                </label>
                <input
                  id="bike-km"
                  name="distanceKm"
                  type="number"
                  className="rp-input"
                  placeholder="0"
                  min={0}
                  max={1000000}
                  defaultValue={0}
                />
              </div>
              <div className="rp-field rp-field--checkbox">
                <label className="rp-checkbox-label">
                  <input type="checkbox" name="isPrimary" value="true" />
                  Définir comme vélo principal
                </label>
              </div>
              <div className="rp-modal-actions">
                <button
                  type="button"
                  className="rp-btn-cancel"
                  onClick={() => setShowAddBike(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="michelin-button button-primary"
                  disabled={addPending}
                >
                  {addPending ? 'Ajout…' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function BikeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6h-3l-3 5H5.5M15 6l3 5.5M9 11.5l4 6M18.5 17.5L15 12" />
    </svg>
  );
}
