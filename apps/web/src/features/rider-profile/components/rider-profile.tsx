'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';

import {
  stravaLogoutAction,
  logoutAction,
} from '@/features/auth/actions/auth.actions';
import type {
  AuthUser,
  Bike,
  CreateBikeRequest,
  CreateTirePassportRequest,
  ProductListItem,
  SavedRace,
  TirePassport,
  UpdateTirePassportRequest,
  UpdateSavedRaceRequest,
} from '@michelin/contracts';

import {
  BIKE_TYPE_LABELS,
  RIDING_PRIORITY_OPTIONS,
  RIDING_SURFACE_OPTIONS,
  TIRE_SEALING_OPTIONS,
  bikeToRecommendationInput,
  getTireRecommendation,
  inferBikeTypeFromName,
  type ResolvedTireRecommendation,
  type TireRecommendationInput,
} from '../services/tire-recommendation';
import {
  activePassportForBike,
  buildProfileAlerts,
  buildRacePreparation,
  buildTireComparison,
  calculateProfileCompleteness,
  calculateProfileStats,
  raceBadge,
  splitRacesByDate,
} from '../services/profile-insights';
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

type ProfileBikeRow =
  | { kind: 'strava'; bike: StravaBike }
  | { kind: 'manual'; bike: Bike };

interface PaginationState<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
  start: number;
  end: number;
  previous: () => void;
  next: () => void;
}

interface RiderProfileProps {
  initialProfile: StravaProfile | null;
  authUser: AuthUser | null;
  stravaConnected: boolean;
}

interface TireRecommendationsResponse {
  recommendations: Array<{
    bikeId: string;
    recommendation: ResolvedTireRecommendation;
  }>;
}

interface ProductSearchResponse {
  items: ProductListItem[];
}

type BikeModalState =
  | { mode: 'add'; bike: null }
  | { mode: 'edit'; bike: Bike };

interface PassportModalState {
  mode: 'create' | 'edit';
  bike: Bike;
  recommendation?: ResolvedTireRecommendation;
  tirePreset?: PassportTirePreset;
  passport?: TirePassport;
}

interface PassportTirePreset {
  brand: string;
  model: string;
  name: string;
  productId?: number;
  referenceFrontBar?: number;
  referenceRearBar?: number;
}

const BIKES_PAGE_SIZE = 4;
const PASSPORTS_PAGE_SIZE = 4;
const RACES_PAGE_SIZE = 3;

function usePaginatedItems<T>(
  items: T[],
  pageSize: number,
): PaginationState<T> {
  const [requestedPage, setRequestedPage] = useState(1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pageCount);

  const startIndex = (page - 1) * pageSize;
  const pagedItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, pageSize, startIndex],
  );

  return {
    items: pagedItems,
    page,
    pageCount,
    total,
    start: total === 0 ? 0 : startIndex + 1,
    end: Math.min(total, startIndex + pageSize),
    previous: () => setRequestedPage((current) => Math.max(1, current - 1)),
    next: () => setRequestedPage((current) => Math.min(pageCount, current + 1)),
  };
}

function manualBikeKey(id: string): string {
  return `manual:${id}`;
}

function stravaBikeKey(id: string): string {
  return `strava:${id}`;
}

function manualBikeToRecommendationInput(bike: Bike): TireRecommendationInput {
  return {
    ...bikeToRecommendationInput(bike),
    id: manualBikeKey(bike.id),
  };
}

function stravaBikeToRecommendationInput(
  bike: StravaBike,
): TireRecommendationInput {
  const distanceKm = Math.round(bike.distance / 1000);
  const isEbike = /\be[-\s]?bike\b|electric|e[-\s]?mtb/i.test(bike.name);

  return {
    id: stravaBikeKey(bike.id),
    name: bike.name,
    type: inferBikeTypeFromName(bike.name),
    distanceKm,
    ridingPriority: distanceKm > 10000 ? 'endurance' : 'versatility',
    ridingSurface: 'mixed',
    isEbike,
  };
}

function optionalFormString(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function optionalFormNumber(formData: FormData, name: string): number | null {
  const value = formData.get(name);
  if (typeof value !== 'string' || !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function bikeFitmentLabel(bike: Bike): string {
  return [bike.tireDiameter, bike.tireWidth].filter(Boolean).join(' x ');
}

function bikePayloadFromForm(formData: FormData): CreateBikeRequest {
  return {
    name: String(formData.get('name') ?? ''),
    type: formData.get('type') as CreateBikeRequest['type'],
    distanceKm: Number(formData.get('distanceKm') ?? 0),
    tireDiameter: optionalFormString(formData, 'tireDiameter'),
    tireWidth: optionalFormString(formData, 'tireWidth'),
    tireSealing: optionalFormString(
      formData,
      'tireSealing',
    ) as CreateBikeRequest['tireSealing'],
    ridingSurface: (formData.get('ridingSurface') ??
      'mixed') as CreateBikeRequest['ridingSurface'],
    ridingPriority: (formData.get('ridingPriority') ??
      'versatility') as CreateBikeRequest['ridingPriority'],
    isEbike: formData.get('isEbike') === 'true',
    isPrimary: formData.get('isPrimary') === 'true',
  };
}

function tireModelFromName(name: string): string {
  return name.replace(/^michelin\s+/i, '').trim() || name || '';
}

function michelinTirePreset({
  name,
  productId,
  referenceFrontBar,
  referenceRearBar,
}: {
  name: string;
  productId?: number;
  referenceFrontBar?: number;
  referenceRearBar?: number;
}): PassportTirePreset {
  return {
    brand: 'Michelin',
    model: tireModelFromName(name),
    name,
    productId,
    referenceFrontBar,
    referenceRearBar,
  };
}

function bikeReferencePreset(
  recommendation: ResolvedTireRecommendation | undefined,
): PassportTirePreset | undefined {
  const name = recommendation?.productName ?? recommendation?.name;
  if (!name) return undefined;
  return michelinTirePreset({ name, productId: recommendation?.productId });
}

function raceTirePreset(race: SavedRace): PassportTirePreset {
  return michelinTirePreset({
    name: race.result.tire.name,
    referenceFrontBar: race.result.pressure.frontBar,
    referenceRearBar: race.result.pressure.rearBar,
  });
}

function passportDisplayName(passport: TirePassport): string {
  return `${passport.tireBrand} ${passport.tireModel}`.trim();
}

function cleanProductValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function productDisplayName(product: ProductListItem): string {
  return (
    cleanProductValue(product.web_product_designation) ??
    cleanProductValue(product.designation) ??
    cleanProductValue(product.web_range_name) ??
    cleanProductValue(product.range) ??
    `Produit ${product.id}`
  );
}

function productBrand(product: ProductListItem): string {
  return cleanProductValue(product.brand) ?? 'Michelin';
}

function productDimension(product: ProductListItem): string {
  const diameter =
    cleanProductValue(product.web_diameter) ??
    cleanProductValue(product.diameter_etrto);
  const width =
    cleanProductValue(product.web_width) ??
    cleanProductValue(product.width_etrto);
  return [diameter, width].filter(Boolean).join(' x ');
}

function productModel(product: ProductListItem): string {
  const name = productDisplayName(product);
  return name.replace(/^michelin\s+/i, '').trim() || name;
}

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
  const [savedRaces, setSavedRaces] = useState<SavedRace[]>([]);
  const [tirePassports, setTirePassports] = useState<TirePassport[]>([]);
  const [recommendations, setRecommendations] = useState<
    Record<string, ResolvedTireRecommendation>
  >({});
  const [loading, setLoading] = useState(true);
  const [bikeModal, setBikeModal] = useState<BikeModalState | null>(null);
  const [passportModal, setPassportModal] = useState<PassportModalState | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [logoutPending, startLogout] = useTransition();
  const [bikePending, setBikePending] = useState(false);
  const [passportPending, setPassportPending] = useState(false);

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
          fetch('/api/saved-races').then(async (r) => {
            if (r.ok) setSavedRaces((await r.json()) as SavedRace[]);
          }),
          fetch('/api/tire-passports').then(async (r) => {
            if (r.ok) setTirePassports((await r.json()) as TirePassport[]);
          }),
        );

        await Promise.all(promises);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [stravaConnected]);

  useEffect(() => {
    if (loading) return;

    const stravaInputs = (stravaProfile?.bikes ?? []).map(
      stravaBikeToRecommendationInput,
    );
    const manualInputs = manualBikes.map(manualBikeToRecommendationInput);
    const inputs = [...stravaInputs, ...manualInputs];

    if (inputs.length === 0) return;

    const controller = new AbortController();

    async function loadRecommendations() {
      try {
        const res = await fetch('/api/tire-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bikes: inputs }),
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as TireRecommendationsResponse;
        setRecommendations((current) => ({
          ...current,
          ...Object.fromEntries(
            data.recommendations.map((item) => [
              item.bikeId,
              item.recommendation,
            ]),
          ),
        }));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
      }
    }

    void loadRecommendations();

    return () => controller.abort();
  }, [loading, manualBikes, stravaProfile]);

  async function handleBikeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!bikeModal) return;

    const payload = bikePayloadFromForm(new FormData(e.currentTarget));
    setBikePending(true);
    setActionError(null);

    try {
      const res = await fetch(
        bikeModal.mode === 'edit'
          ? `/api/bikes/${bikeModal.bike.id}`
          : '/api/bikes',
        {
          method: bikeModal.mode === 'edit' ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error('bike-save-failed');
      const saved = (await res.json()) as Bike;

      setManualBikes((prev) => {
        const next =
          bikeModal.mode === 'edit'
            ? prev.map((bike) => (bike.id === saved.id ? saved : bike))
            : [saved, ...prev];
        return saved.isPrimary
          ? next.map((bike) =>
              bike.id === saved.id ? saved : { ...bike, isPrimary: false },
            )
          : next;
      });
      setBikeModal(null);
    } catch {
      setActionError("Impossible d'enregistrer ce vélo pour le moment.");
    } finally {
      setBikePending(false);
    }
  }

  async function handleSetPrimary(bike: Bike) {
    setActionError(null);
    try {
      const res = await fetch(`/api/bikes/${bike.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
      });
      if (!res.ok) throw new Error('primary-bike-failed');
      const saved = (await res.json()) as Bike;
      setManualBikes((prev) =>
        prev.map((item) =>
          item.id === saved.id ? saved : { ...item, isPrimary: false },
        ),
      );
    } catch {
      setActionError('Impossible de définir ce vélo comme principal.');
    }
  }

  async function handleDeleteBike(bike: Bike) {
    if (
      !window.confirm(
        `Supprimer ${bike.name} ? Les passeports associés seront supprimés.`,
      )
    ) {
      return;
    }

    setActionError(null);
    try {
      const res = await fetch(`/api/bikes/${bike.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error('bike-delete-failed');
      setManualBikes((prev) => prev.filter((b) => b.id !== bike.id));
      setTirePassports((prev) =>
        prev.filter((passport) => passport.bikeId !== bike.id),
      );
      setSavedRaces((prev) =>
        prev.map((race) =>
          race.bikeId === bike.id ? { ...race, bikeId: null } : race,
        ),
      );
    } catch {
      setActionError('Impossible de supprimer ce vélo pour le moment.');
    }
  }

  async function handleDeleteSavedRace(race: SavedRace) {
    if (!window.confirm(`Supprimer ${race.raceName} ?`)) return;

    setActionError(null);
    try {
      const res = await fetch(`/api/saved-races/${race.id}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) throw new Error('race-delete-failed');
      setSavedRaces((prev) => prev.filter((r) => r.id !== race.id));
    } catch {
      setActionError('Impossible de supprimer cette course pour le moment.');
    }
  }

  async function handleRaceBikeChange(race: SavedRace, bikeId: string) {
    const payload: UpdateSavedRaceRequest = { bikeId: bikeId || null };
    setActionError(null);

    try {
      const res = await fetch(`/api/saved-races/${race.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('race-update-failed');
      const saved = (await res.json()) as SavedRace;
      setSavedRaces((prev) =>
        prev.map((item) => (item.id === saved.id ? saved : item)),
      );
    } catch {
      setActionError("Impossible d'associer ce vélo à la course.");
    }
  }

  async function handlePassportSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!passportModal) return;
    if (passportModal.mode === 'edit' && !passportModal.passport) return;

    const fd = new FormData(e.currentTarget);
    const tireBrand = String(fd.get('tireBrand') ?? '').trim();
    const tireModel = String(fd.get('tireModel') ?? '').trim();
    const passportFields = {
      bikeId: String(fd.get('bikeId') ?? passportModal.bike.id),
      productId: optionalFormNumber(fd, 'productId'),
      tireBrand,
      tireModel,
      tireName:
        String(fd.get('tireName') ?? '').trim() ||
        `${tireBrand} ${tireModel}`.trim(),
      tireDimension: optionalFormString(fd, 'tireDimension'),
      mountedAt: String(fd.get('mountedAt') ?? todayInputValue()),
      mountedDistanceKm: Number(fd.get('mountedDistanceKm') ?? 0),
      referenceFrontBar: optionalFormNumber(fd, 'referenceFrontBar'),
      referenceRearBar: optionalFormNumber(fd, 'referenceRearBar'),
    };
    const payload =
      passportModal.mode === 'edit'
        ? ({
            ...passportFields,
            status: fd.get('status') as TirePassport['status'],
          } satisfies UpdateTirePassportRequest)
        : ({
            ...passportFields,
          } satisfies CreateTirePassportRequest);

    setPassportPending(true);
    setActionError(null);
    try {
      const res = await fetch(
        passportModal.mode === 'edit'
          ? `/api/tire-passports/${passportModal.passport?.id}`
          : '/api/tire-passports',
        {
          method: passportModal.mode === 'edit' ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        throw new Error(
          passportModal.mode === 'edit'
            ? 'passport-update-failed'
            : 'passport-save-failed',
        );
      }
      const saved = (await res.json()) as TirePassport;
      setTirePassports((prev) => {
        const next =
          passportModal.mode === 'edit'
            ? prev.map((passport) =>
                passport.id === saved.id ? saved : passport,
              )
            : [saved, ...prev];

        return next.map((passport) =>
          passport.id !== saved.id &&
          saved.status === 'active' &&
          passport.bikeId === saved.bikeId &&
          passport.status === 'active'
            ? { ...passport, status: 'retired' as const }
            : passport,
        );
      });
      setPassportModal(null);
    } catch {
      setActionError(
        passportModal.mode === 'edit'
          ? 'Impossible de modifier ce passeport pneu.'
          : 'Impossible de créer ce passeport pneu.',
      );
    } finally {
      setPassportPending(false);
    }
  }

  async function handleDeletePassport(passport: TirePassport) {
    if (!window.confirm(`Supprimer le passeport ${passport.tireName} ?`)) {
      return;
    }

    setActionError(null);
    try {
      const res = await fetch(`/api/tire-passports/${passport.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok && res.status !== 204)
        throw new Error('passport-delete-failed');
      setTirePassports((prev) =>
        prev.filter((item) => item.id !== passport.id),
      );
    } catch {
      setActionError('Impossible de supprimer ce passeport pneu.');
    }
  }

  function handleMountRaceTire(race: SavedRace, bike: Bike) {
    setPassportModal({
      mode: 'create',
      bike,
      tirePreset: raceTirePreset(race),
    });
  }

  const stravaBikes = useMemo(
    () => stravaProfile?.bikes ?? [],
    [stravaProfile?.bikes],
  );
  const bikeRows = useMemo<ProfileBikeRow[]>(
    () => [
      ...stravaBikes.map((bike) => ({ kind: 'strava' as const, bike })),
      ...manualBikes.map((bike) => ({ kind: 'manual' as const, bike })),
    ],
    [manualBikes, stravaBikes],
  );
  const paginatedBikes = usePaginatedItems(bikeRows, BIKES_PAGE_SIZE);
  const paginatedPassports = usePaginatedItems(
    tirePassports,
    PASSPORTS_PAGE_SIZE,
  );
  const raceBuckets = useMemo(() => splitRacesByDate(savedRaces), [savedRaces]);
  const stats = useMemo(
    () =>
      calculateProfileStats({
        activities: activities.map((activity) => ({
          sportType: activity.sport_type,
          distanceMeters: activity.distance,
          elevationGainM: activity.total_elevation_gain,
          startedAt: activity.start_date_local,
        })),
        bikes: manualBikes,
        savedRaces,
        tirePassports,
      }),
    [activities, manualBikes, savedRaces, tirePassports],
  );
  const primaryManualBike =
    manualBikes.find((bike) => bike.isPrimary) ?? manualBikes[0] ?? null;
  const primaryStravaBike =
    stravaBikes.find((bike) => bike.primary) ?? stravaBikes[0] ?? null;
  const primaryBikeName = primaryManualBike?.name ?? primaryStravaBike?.name;
  const primaryRecommendation: ResolvedTireRecommendation | null =
    primaryManualBike
      ? (recommendations[manualBikeKey(primaryManualBike.id)] ??
        getTireRecommendation(
          manualBikeToRecommendationInput(primaryManualBike),
        ))
      : null;
  const completeness = calculateProfileCompleteness({
    bikes: manualBikes,
    savedRaces,
    stravaConnected,
    tirePassports,
  });
  const alerts = buildProfileAlerts({
    bikes: manualBikes,
    savedRaces,
    tirePassports,
  });

  return (
    <main className="rp-page">
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
                <UserIcon />
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
        {actionError && (
          <div className="rp-alert rp-alert--warning" role="alert">
            {actionError}
          </div>
        )}

        <section className="rp-section">
          <p className="rp-kicker">Ride ID</p>
          <h2 className="rp-section-title">Synthèse du profil</h2>
          <div className="rp-overview-grid">
            <SummaryTile
              label="Terrain dominant"
              value={loading ? '…' : stats.terrain}
              detail={`${stats.terrainDetail} · ${stats.distanceMoy} km moyens · ${stats.elevMoy} m D+`}
            />
            <SummaryTile
              label="Vélo principal"
              value={primaryBikeName ?? 'À définir'}
              detail={
                primaryManualBike
                  ? BIKE_TYPE_LABELS[primaryManualBike.type]
                  : primaryStravaBike
                    ? 'Importé depuis Strava'
                    : 'Ajoute un vélo pour préciser la référence'
              }
            />
            <SummaryTile
              label="Prochaine course"
              value={raceBuckets.upcoming[0]?.raceName ?? 'Aucune'}
              detail={
                raceBuckets.upcoming[0]
                  ? `${raceBadge(raceBuckets.upcoming[0].raceDate)} · ${
                      raceBuckets.upcoming[0].distanceKm
                    } km`
                  : 'Sauvegarde une analyse Race Intelligence'
              }
            />
            <SummaryTile
              label="Référence vélo"
              value={
                primaryRecommendation?.productName ??
                primaryRecommendation?.name ??
                'À calculer'
              }
              detail={
                primaryRecommendation?.sub ??
                'Basée sur le vélo principal et son usage habituel'
              }
            />
          </div>
        </section>

        <section className="rp-section rp-insights-grid">
          <div className="rp-completeness">
            <div className="rp-completeness-head">
              <div>
                <p className="rp-kicker">Complétude</p>
                <h2 className="rp-section-title">{completeness.score} %</h2>
              </div>
              <span className="rp-completeness-count">
                {completeness.completed}/{completeness.total}
              </span>
            </div>
            <div className="rp-progress" aria-hidden="true">
              <span style={{ width: `${completeness.score}%` }} />
            </div>
            {completeness.actions.length > 0 ? (
              <ul className="rp-action-list">
                {completeness.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            ) : (
              <p className="rp-muted">
                Profil prêt pour une recommandation fine.
              </p>
            )}
          </div>

          <div className="rp-alerts-panel">
            <p className="rp-kicker">Alertes</p>
            {alerts.length === 0 ? (
              <p className="rp-muted">Aucune alerte prioritaire.</p>
            ) : (
              <div className="rp-alert-list">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rp-alert rp-alert--${alert.tone}`}
                  >
                    <strong>{alert.title}</strong>
                    <span>{alert.body}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {stravaConnected && (
          <section className="rp-section">
            <p className="rp-kicker">Activité</p>
            <h2 className="rp-section-title">Tes habitudes de pratique</h2>
            <div className="rp-stats-grid">
              <StatCard
                value={loading ? '…' : stats.sorties}
                label="sorties / semaine"
              />
              <StatCard
                value={loading ? '…' : stats.terrain}
                label="terrain dominant"
              />
              <StatCard
                value={loading ? '…' : `${stats.distanceMoy} km`}
                label="distance moyenne"
              />
              <StatCard
                value={loading ? '…' : `${stats.elevMoy} m`}
                label="D+ moyen"
              />
            </div>
          </section>
        )}

        <section className="rp-section rp-data-section">
          <div className="rp-section-header">
            <div>
              <p className="rp-kicker">Équipement</p>
              <div className="rp-section-title-row">
                <h2 className="rp-section-title">Mes vélos</h2>
                <span className="rp-section-count">
                  {bikeRows.length} {bikeRows.length > 1 ? 'vélos' : 'vélo'}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="rp-add-btn"
              onClick={() => setBikeModal({ mode: 'add', bike: null })}
            >
              + Ajouter un vélo
            </button>
          </div>

          {loading ? (
            <LoadingRows />
          ) : bikeRows.length === 0 ? (
            <p className="rp-empty">
              Aucun vélo enregistré. Ajoute ton premier vélo pour démarrer ton
              Ride ID.
            </p>
          ) : (
            <div className="rp-list-shell">
              <div className="rp-bikes-list">
                {paginatedBikes.items.map((row) => {
                  if (row.kind === 'strava') {
                    const bike = row.bike;
                    const input = stravaBikeToRecommendationInput(bike);
                    const rec =
                      recommendations[input.id] ?? getTireRecommendation(input);
                    const km = Math.round(bike.distance / 1000).toLocaleString(
                      'fr-FR',
                    );
                    return (
                      <div
                        key={`strava-${bike.id}`}
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
                                <span className="rp-primary-badge">
                                  Principal
                                </span>
                              )}
                              <span className="rp-source-badge rp-source-badge--strava">
                                Strava
                              </span>
                            </div>
                            <p className="rp-bike-distance">
                              {km} km parcourus
                            </p>
                            {rec.details.length > 0 && (
                              <TagList items={rec.details} />
                            )}
                          </div>
                        </div>
                        <div className="rp-bike-right">
                          <span className="rp-muted">
                            Référence vélo disponible
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const bike = row.bike;
                  const input = manualBikeToRecommendationInput(bike);
                  const rec =
                    recommendations[input.id] ?? getTireRecommendation(input);
                  const km = bike.distanceKm.toLocaleString('fr-FR');
                  const activePassport = activePassportForBike(
                    tirePassports,
                    bike.id,
                  );
                  const comparison = buildTireComparison(activePassport, rec);
                  const details = [
                    ...rec.details,
                    activePassport
                      ? `Monté : ${passportDisplayName(activePassport)}`
                      : null,
                  ].filter((item): item is string => Boolean(item));

                  return (
                    <div
                      key={`manual-${bike.id}`}
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
                              <span className="rp-primary-badge">
                                Principal
                              </span>
                            )}
                            <span className="rp-source-badge">
                              {BIKE_TYPE_LABELS[bike.type] ?? bike.type}
                            </span>
                          </div>
                          <p className="rp-bike-distance">{km} km parcourus</p>
                          {details.length > 0 && <TagList items={details} />}
                          <div
                            className={`rp-comparison rp-comparison--${comparison.status}`}
                          >
                            <strong>{comparison.title}</strong>
                            <span>{comparison.body}</span>
                          </div>
                        </div>
                      </div>
                      <div className="rp-bike-right">
                        <div className="rp-bike-actions">
                          {!bike.isPrimary && (
                            <button
                              type="button"
                              className="rp-link-btn"
                              onClick={() => void handleSetPrimary(bike)}
                            >
                              Principal
                            </button>
                          )}
                          <button
                            type="button"
                            className="rp-link-btn"
                            onClick={() => setBikeModal({ mode: 'edit', bike })}
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            className="rp-link-btn"
                            onClick={() =>
                              setPassportModal({
                                mode: 'create',
                                bike,
                                recommendation: rec,
                                tirePreset: bikeReferencePreset(rec),
                              })
                            }
                          >
                            Monter le pneu de référence
                          </button>
                          <button
                            type="button"
                            className="rp-delete-btn"
                            onClick={() => void handleDeleteBike(bike)}
                            aria-label="Supprimer ce vélo"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <PaginationControls label="vélos" pagination={paginatedBikes} />
            </div>
          )}
        </section>

        <section className="rp-section rp-data-section">
          <div className="rp-section-header">
            <div>
              <p className="rp-kicker">RideProof Passport</p>
              <div className="rp-section-title-row">
                <h2 className="rp-section-title">Passeports pneus</h2>
                <span className="rp-section-count">
                  {tirePassports.length}{' '}
                  {tirePassports.length > 1 ? 'passeports' : 'passeport'}
                </span>
              </div>
            </div>
            {manualBikes.length > 0 && (
              <button
                type="button"
                className="rp-add-btn"
                onClick={() =>
                  setPassportModal({
                    mode: 'create',
                    bike: primaryManualBike ?? manualBikes[0]!,
                  })
                }
              >
                + Créer un passeport
              </button>
            )}
          </div>
          {loading ? (
            <LoadingRows />
          ) : tirePassports.length === 0 ? (
            <p className="rp-empty">
              Aucun passeport pneu. Crée un suivi après montage pour garder la
              pression, la date et le kilométrage de référence.
            </p>
          ) : (
            <div className="rp-list-shell">
              <div className="rp-passport-grid">
                {paginatedPassports.items.map((passport) => {
                  const passportBike = manualBikes.find(
                    (bike) => bike.id === passport.bikeId,
                  );
                  return (
                    <div className="rp-passport" key={passport.id}>
                      <div>
                        <p className="rp-rec-label">Pneu monté</p>
                        <h3>{passportDisplayName(passport)}</h3>
                        <p>
                          {passport.bikeName ?? 'Vélo'} ·{' '}
                          {passport.tireDimension ?? 'Dimension à préciser'}
                        </p>
                      </div>
                      <dl>
                        <div>
                          <dt>Montage</dt>
                          <dd>
                            {new Date(passport.mountedAt).toLocaleDateString(
                              'fr-FR',
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>Kilométrage</dt>
                          <dd>
                            {passport.mountedDistanceKm.toLocaleString('fr-FR')}{' '}
                            km
                          </dd>
                        </div>
                        <div>
                          <dt>Pression</dt>
                          <dd>
                            {passport.referenceFrontBar &&
                            passport.referenceRearBar
                              ? `${passport.referenceFrontBar} / ${passport.referenceRearBar} bar`
                              : 'À préciser'}
                          </dd>
                        </div>
                      </dl>
                      <div className="rp-passport-actions">
                        {passportBike && (
                          <button
                            type="button"
                            className="rp-link-btn"
                            onClick={() =>
                              setPassportModal({
                                mode: 'edit',
                                bike: passportBike,
                                passport,
                              })
                            }
                          >
                            Modifier
                          </button>
                        )}
                        <button
                          type="button"
                          className="rp-delete-btn"
                          onClick={() => void handleDeletePassport(passport)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <PaginationControls
                label="passeports"
                pagination={paginatedPassports}
              />
            </div>
          )}
        </section>

        {(savedRaces.length > 0 || loading) && (
          <>
            <RaceSection
              title="Mes prochaines courses"
              races={raceBuckets.upcoming}
              loading={loading}
              bikes={manualBikes}
              tirePassports={tirePassports}
              onBikeChange={handleRaceBikeChange}
              onMountRaceTire={handleMountRaceTire}
              onDelete={handleDeleteSavedRace}
            />
            {raceBuckets.past.length > 0 && (
              <RaceSection
                title="Historique des courses"
                races={raceBuckets.past}
                loading={false}
                bikes={manualBikes}
                tirePassports={tirePassports}
                onBikeChange={handleRaceBikeChange}
                onMountRaceTire={handleMountRaceTire}
                onDelete={handleDeleteSavedRace}
              />
            )}
          </>
        )}

        <section className="rp-cta-section">
          <div className="rp-cta-card">
            <div className="rp-cta-text">
              <p className="rp-kicker rp-kicker--yellow">Race Intelligence</p>
              <h2 className="rp-cta-title">Prêt à analyser ton parcours ?</h2>
              <p className="rp-cta-sub">
                {stravaConnected
                  ? 'Tu es déjà connecté à Strava : importe directement ton itinéraire pour une recommandation pneu personnalisée.'
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

      {bikeModal && (
        <BikeModal
          state={bikeModal}
          pending={bikePending}
          onClose={() => setBikeModal(null)}
          onSubmit={handleBikeSubmit}
        />
      )}

      {passportModal && (
        <PassportModal
          state={passportModal}
          bikes={manualBikes}
          pending={passportPending}
          onClose={() => setPassportModal(null)}
          onSubmit={handlePassportSubmit}
        />
      )}
    </main>
  );
}

function SummaryTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rp-summary-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rp-stat-card">
      <span className="rp-stat-value">{value}</span>
      <span className="rp-stat-label">{label}</span>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="rp-bikes-loading">
      {[1, 2].map((i) => (
        <div key={i} className="rp-bike-skeleton" />
      ))}
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="rp-bike-fitment">
      {items.map((detail) => (
        <span key={detail}>{detail}</span>
      ))}
    </div>
  );
}

function PaginationControls<T>({
  label,
  pagination,
}: {
  label: string;
  pagination: PaginationState<T>;
}) {
  if (pagination.pageCount <= 1) return null;

  return (
    <nav className="rp-pagination" aria-label={`Pagination ${label}`}>
      <p>
        {pagination.start}-{pagination.end} sur {pagination.total}
      </p>
      <div className="rp-pagination-actions">
        <button
          type="button"
          className="rp-pagination-btn"
          onClick={pagination.previous}
          disabled={pagination.page === 1}
          aria-label={`Page précédente des ${label}`}
        >
          Précédent
        </button>
        <span>
          Page {pagination.page} / {pagination.pageCount}
        </span>
        <button
          type="button"
          className="rp-pagination-btn"
          onClick={pagination.next}
          disabled={pagination.page === pagination.pageCount}
          aria-label={`Page suivante des ${label}`}
        >
          Suivant
        </button>
      </div>
    </nav>
  );
}

function RaceSection({
  title,
  races,
  loading,
  bikes,
  tirePassports,
  onBikeChange,
  onMountRaceTire,
  onDelete,
}: {
  title: string;
  races: SavedRace[];
  loading: boolean;
  bikes: Bike[];
  tirePassports: TirePassport[];
  onBikeChange: (race: SavedRace, bikeId: string) => void;
  onMountRaceTire: (race: SavedRace, bike: Bike) => void;
  onDelete: (race: SavedRace) => void;
}) {
  const paginatedRaces = usePaginatedItems(races, RACES_PAGE_SIZE);

  return (
    <section className="rp-section rp-data-section">
      <div className="rp-section-header">
        <div>
          <p className="rp-kicker">Race Intelligence</p>
          <div className="rp-section-title-row">
            <h2 className="rp-section-title">{title}</h2>
            <span className="rp-section-count">
              {races.length} {races.length > 1 ? 'courses' : 'course'}
            </span>
          </div>
        </div>
      </div>
      {loading ? (
        <LoadingRows />
      ) : races.length === 0 ? (
        <p className="rp-empty">Aucune course dans cette catégorie.</p>
      ) : (
        <div className="rp-list-shell">
          <div className="rp-races-list">
            {paginatedRaces.items.map((race) => {
              const preparation = buildRacePreparation(
                race,
                bikes,
                tirePassports,
              );
              return (
                <div key={race.id} className="rp-race-card">
                  <div className="rp-race-main">
                    <div className="rp-race-left">
                      <div className="rp-race-icon" aria-hidden="true">
                        <CalendarIcon />
                      </div>
                      <div>
                        <div className="rp-race-name-row">
                          <span className="rp-date-badge">
                            {preparation.badge}
                          </span>
                          <div className="rp-race-name">{race.raceName}</div>
                        </div>
                        <div className="rp-race-meta">
                          <span>
                            {new Date(race.raceDate).toLocaleDateString(
                              'fr-FR',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              },
                            )}
                          </span>
                          <span className="rp-race-sep">·</span>
                          <span>{race.locationName}</span>
                          <span className="rp-race-sep">·</span>
                          <span>
                            {race.distanceKm} km / {race.elevationGainM} m D+
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rp-race-right">
                      <div className="rp-race-tire">
                        <p className="rp-rec-label">Pneu recommandé</p>
                        <p className="rp-rec-name">{race.result.tire.name}</p>
                        <p className="rp-rec-sub">
                          Pression conseillée AV/AR :{' '}
                          {race.result.pressure.frontBar} /{' '}
                          {race.result.pressure.rearBar} bar
                        </p>
                        <p className="rp-pressure-note">
                          {race.result.pressure.note} À valider avec le pneu
                          monté et sa plage constructeur. Confiance{' '}
                          {race.result.confidenceScore} %.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="rp-delete-btn"
                        onClick={() => void onDelete(race)}
                        aria-label="Supprimer cette course"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="rp-race-prep">
                    <label className="rp-race-bike-select">
                      <span>Vélo associé</span>
                      <select
                        className="rp-input"
                        value={race.bikeId ?? ''}
                        onChange={(event) =>
                          void onBikeChange(race, event.target.value)
                        }
                      >
                        <option value="">Aucun vélo</option>
                        {bikes.map((bike) => (
                          <option key={bike.id} value={bike.id}>
                            {bike.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div
                      className={`rp-race-tire-status rp-race-tire-status--${preparation.tireMountStatus.status}`}
                    >
                      <strong>{preparation.tireMountStatus.title}</strong>
                      <span>{preparation.tireMountStatus.body}</span>
                      {preparation.bike &&
                        preparation.tireMountStatus.status !== 'aligned' && (
                          <button
                            type="button"
                            className="rp-link-btn rp-race-mount-btn"
                            onClick={() =>
                              onMountRaceTire(race, preparation.bike!)
                            }
                          >
                            Monter ce pneu pour la course
                          </button>
                        )}
                    </div>
                    <ul className="rp-checklist">
                      {preparation.checklist.map((item) => (
                        <li
                          key={item.label}
                          className={item.done ? 'is-done' : undefined}
                        >
                          <span aria-hidden="true">
                            {item.done ? '✓' : '!'}
                          </span>
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
          <PaginationControls label="courses" pagination={paginatedRaces} />
        </div>
      )}
    </section>
  );
}

function BikeModal({
  state,
  pending,
  onClose,
  onSubmit,
}: {
  state: BikeModalState;
  pending: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const bike = state.bike;

  return (
    <div className="rp-modal-overlay" onClick={onClose}>
      <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rp-modal-header">
          <h2 className="rp-modal-title">
            {state.mode === 'edit' ? 'Modifier le vélo' : 'Ajouter un vélo'}
          </h2>
          <button
            type="button"
            className="rp-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="rp-modal-form">
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
              defaultValue={bike?.name ?? ''}
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
              defaultValue={bike?.type ?? 'road'}
            >
              <option value="road">Route</option>
              <option value="gravel">Gravel</option>
              <option value="mtb">VTT</option>
            </select>
          </div>
          <div className="rp-field-grid">
            <div className="rp-field">
              <label htmlFor="bike-diameter" className="rp-label">
                Diamètre pneu
              </label>
              <input
                id="bike-diameter"
                name="tireDiameter"
                type="text"
                className="rp-input"
                placeholder="700, 29, 27.5..."
                maxLength={40}
                defaultValue={bike?.tireDiameter ?? ''}
              />
            </div>
            <div className="rp-field">
              <label htmlFor="bike-width" className="rp-label">
                Largeur pneu
              </label>
              <input
                id="bike-width"
                name="tireWidth"
                type="text"
                className="rp-input"
                placeholder="28, 40, 2.4..."
                maxLength={40}
                defaultValue={bike?.tireWidth ?? ''}
              />
            </div>
          </div>
          <div className="rp-field">
            <label htmlFor="bike-sealing" className="rp-label">
              Montage
            </label>
            <select
              id="bike-sealing"
              name="tireSealing"
              className="rp-input"
              defaultValue={bike?.tireSealing ?? ''}
            >
              <option value="">À préciser</option>
              {TIRE_SEALING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="rp-field-grid">
            <div className="rp-field">
              <label htmlFor="bike-surface" className="rp-label">
                Surface dominante
              </label>
              <select
                id="bike-surface"
                name="ridingSurface"
                className="rp-input"
                defaultValue={bike?.ridingSurface ?? 'mixed'}
              >
                {RIDING_SURFACE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="rp-field">
              <label htmlFor="bike-priority" className="rp-label">
                Priorité
              </label>
              <select
                id="bike-priority"
                name="ridingPriority"
                className="rp-input"
                defaultValue={bike?.ridingPriority ?? 'versatility'}
              >
                {RIDING_PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
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
              min={0}
              max={1000000}
              defaultValue={bike?.distanceKm ?? 0}
            />
          </div>
          <div className="rp-field rp-field--checkbox">
            <label className="rp-checkbox-label">
              <input
                type="checkbox"
                name="isEbike"
                value="true"
                defaultChecked={bike?.isEbike ?? false}
              />
              Compatible ou usage e-bike
            </label>
          </div>
          <div className="rp-field rp-field--checkbox">
            <label className="rp-checkbox-label">
              <input
                type="checkbox"
                name="isPrimary"
                value="true"
                defaultChecked={bike?.isPrimary ?? false}
              />
              Définir comme vélo principal
            </label>
          </div>
          <div className="rp-modal-actions">
            <button type="button" className="rp-btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="michelin-button button-primary"
              disabled={pending}
            >
              {pending
                ? 'Enregistrement…'
                : state.mode === 'edit'
                  ? 'Enregistrer'
                  : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PassportModal({
  state,
  bikes,
  pending,
  onClose,
  onSubmit,
}: {
  state: PassportModalState;
  bikes: Bike[];
  pending: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const recommendation = state.recommendation;
  const passport = state.passport ?? null;
  const tirePreset = state.tirePreset ?? bikeReferencePreset(recommendation);
  const initialBikeId = passport?.bikeId ?? state.bike.id;
  const initialBike =
    bikes.find((bike) => bike.id === initialBikeId) ?? state.bike;
  const defaultDimension =
    passport?.tireDimension ?? bikeFitmentLabel(initialBike);
  const defaultBrand = passport?.tireBrand ?? tirePreset?.brand ?? 'Michelin';
  const defaultModel = passport?.tireModel ?? tirePreset?.model ?? '';
  const defaultProductId = passport?.productId ?? tirePreset?.productId ?? null;
  const defaultFrontBar =
    passport?.referenceFrontBar ?? tirePreset?.referenceFrontBar ?? '';
  const defaultRearBar =
    passport?.referenceRearBar ?? tirePreset?.referenceRearBar ?? '';
  const [selectedBikeId, setSelectedBikeId] = useState(initialBike.id);
  const [productQuery, setProductQuery] = useState(defaultModel);
  const [productResults, setProductResults] = useState<ProductListItem[]>([]);
  const [productStatus, setProductStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    defaultProductId,
  );
  const [selectedProductLabel, setSelectedProductLabel] =
    useState<string>(defaultModel);
  const [brand, setBrand] = useState(defaultBrand);
  const [model, setModel] = useState(defaultModel);
  const [dimension, setDimension] = useState(defaultDimension);
  const [mountedDistanceKm, setMountedDistanceKm] = useState(
    passport?.mountedDistanceKm ?? initialBike.distanceKm,
  );
  const tireName =
    [brand, model].filter(Boolean).join(' ') ||
    passport?.tireName ||
    tirePreset?.name ||
    '';

  useEffect(() => {
    const query = productQuery.trim();

    if (
      selectedProductId !== null &&
      selectedProductLabel &&
      query === selectedProductLabel
    ) {
      return;
    }

    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setProductStatus('loading');
      try {
        const response = await fetch(
          `/api/product-search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('product-search-failed');
        const data = (await response.json()) as ProductSearchResponse;
        setProductResults(data.items);
        setProductStatus('ready');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setProductResults([]);
        setProductStatus('error');
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [productQuery, selectedProductId, selectedProductLabel]);

  function handleProductQueryChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const nextQuery = event.target.value;
    setProductQuery(nextQuery);
    setSelectedProductId(null);
    setSelectedProductLabel('');
    setModel('');
    setProductResults([]);
    setProductStatus(nextQuery.trim().length >= 2 ? 'loading' : 'idle');
  }

  function handleProductSelect(product: ProductListItem) {
    const nextLabel = productDisplayName(product);
    const nextDimension = productDimension(product);
    setSelectedProductId(product.id);
    setSelectedProductLabel(nextLabel);
    setProductQuery(nextLabel);
    setBrand(productBrand(product));
    setModel(productModel(product));
    setDimension(nextDimension || defaultDimension);
    setProductResults([]);
    setProductStatus('idle');
  }

  function handleBikeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextBikeId = event.target.value;
    const nextBike = bikes.find((bike) => bike.id === nextBikeId);
    setSelectedBikeId(nextBikeId);
    if (!passport && nextBike) {
      setDimension(bikeFitmentLabel(nextBike));
      setMountedDistanceKm(nextBike.distanceKm);
    }
  }

  return (
    <div className="rp-modal-overlay" onClick={onClose}>
      <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rp-modal-header">
          <h2 className="rp-modal-title">
            {state.mode === 'edit'
              ? 'Modifier le passeport pneu'
              : 'Créer un passeport pneu'}
          </h2>
          <button
            type="button"
            className="rp-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="rp-modal-form">
          <div className="rp-field">
            <label htmlFor="passport-bike" className="rp-label">
              Vélo associé
            </label>
            <select
              id="passport-bike"
              name="bikeId"
              className="rp-input"
              value={selectedBikeId}
              onChange={handleBikeChange}
            >
              {bikes.map((bike) => (
                <option key={bike.id} value={bike.id}>
                  {bike.name}
                </option>
              ))}
            </select>
          </div>
          <input
            type="hidden"
            name="productId"
            value={selectedProductId ?? ''}
          />
          <input type="hidden" name="tireName" value={tireName} />
          <div className="rp-field">
            <label htmlFor="passport-product" className="rp-label">
              Produit Michelin
            </label>
            <div className="rp-product-search">
              <input
                id="passport-product"
                type="search"
                className="rp-input"
                placeholder="Power Cup, Wild Enduro..."
                value={productQuery}
                onChange={handleProductQueryChange}
                autoComplete="off"
                role="combobox"
                aria-expanded={productResults.length > 0}
                aria-controls="passport-product-results"
              />
              {productResults.length > 0 && (
                <div
                  id="passport-product-results"
                  className="rp-product-results"
                  role="listbox"
                >
                  {productResults.map((product) => {
                    const label = productDisplayName(product);
                    const optionDimension = productDimension(product);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        className="rp-product-option"
                        role="option"
                        aria-selected={selectedProductId === product.id}
                        onClick={() => handleProductSelect(product)}
                      >
                        <span>
                          <strong>{label}</strong>
                          <small>
                            {[productBrand(product), optionDimension]
                              .filter(Boolean)
                              .join(' · ')}
                          </small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {productStatus === 'loading' && (
              <span className="rp-product-status">Recherche...</span>
            )}
            {productStatus === 'ready' &&
              productQuery.trim().length >= 2 &&
              productResults.length === 0 &&
              !model && (
                <span className="rp-product-status">Aucun produit trouvé.</span>
              )}
            {productStatus === 'error' && (
              <span className="rp-product-status">
                Recherche produit indisponible.
              </span>
            )}
          </div>
          <div className="rp-field-grid">
            <div className="rp-field">
              <label htmlFor="passport-tire-brand" className="rp-label">
                Marque du pneu
              </label>
              <input
                id="passport-tire-brand"
                name="tireBrand"
                type="text"
                className="rp-input"
                required
                maxLength={60}
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
              />
            </div>
            <div className="rp-field">
              <label htmlFor="passport-tire-model" className="rp-label">
                Modèle
              </label>
              <input
                id="passport-tire-model"
                name="tireModel"
                type="text"
                className="rp-input"
                required
                maxLength={100}
                value={model}
                readOnly
              />
            </div>
          </div>
          <div className="rp-field-grid">
            <div className="rp-field">
              <label htmlFor="passport-dimension" className="rp-label">
                Dimension
              </label>
              <input
                id="passport-dimension"
                name="tireDimension"
                type="text"
                className="rp-input"
                maxLength={100}
                value={dimension}
                onChange={(event) => setDimension(event.target.value)}
              />
            </div>
            <div className="rp-field">
              <label htmlFor="passport-mounted-at" className="rp-label">
                Date de montage
              </label>
              <input
                id="passport-mounted-at"
                name="mountedAt"
                type="date"
                className="rp-input"
                required
                defaultValue={passport?.mountedAt ?? todayInputValue()}
              />
            </div>
          </div>
          <div className="rp-field">
            <label htmlFor="passport-mounted-km" className="rp-label">
              Kilométrage au montage
            </label>
            <input
              id="passport-mounted-km"
              name="mountedDistanceKm"
              type="number"
              min={0}
              className="rp-input"
              value={mountedDistanceKm}
              onChange={(event) =>
                setMountedDistanceKm(Number(event.target.value))
              }
            />
          </div>
          <div className="rp-field-grid">
            <div className="rp-field">
              <label htmlFor="passport-front" className="rp-label">
                Pression avant
              </label>
              <input
                id="passport-front"
                name="referenceFrontBar"
                type="number"
                min={0.1}
                step={0.1}
                className="rp-input"
                placeholder="bar"
                defaultValue={defaultFrontBar}
              />
            </div>
            <div className="rp-field">
              <label htmlFor="passport-rear" className="rp-label">
                Pression arrière
              </label>
              <input
                id="passport-rear"
                name="referenceRearBar"
                type="number"
                min={0.1}
                step={0.1}
                className="rp-input"
                placeholder="bar"
                defaultValue={defaultRearBar}
              />
            </div>
          </div>
          {state.mode === 'edit' && (
            <div className="rp-field">
              <label htmlFor="passport-status" className="rp-label">
                Statut
              </label>
              <select
                id="passport-status"
                name="status"
                className="rp-input"
                defaultValue={passport?.status ?? 'active'}
              >
                <option value="active">Actif</option>
                <option value="replace-soon">À remplacer bientôt</option>
                <option value="retired">Retiré</option>
              </select>
            </div>
          )}
          <div className="rp-modal-actions">
            <button type="button" className="rp-btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="michelin-button button-primary"
              disabled={pending || !brand.trim() || !model.trim()}
            >
              {pending
                ? state.mode === 'edit'
                  ? 'Enregistrement…'
                  : 'Création…'
                : state.mode === 'edit'
                  ? 'Enregistrer'
                  : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
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

function UserIcon() {
  return (
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
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
