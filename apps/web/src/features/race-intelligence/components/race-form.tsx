'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';

import type {
  CreateSavedRaceRequest,
  Discipline,
  RaceAnalyzeRequest,
  RaceAnalyzeResponse,
  SurfaceType,
} from '@michelin/contracts';

import {
  analyzeRaceAction,
  type AnalyzeRaceState,
} from '../actions/analyze-race.action';
import type { GpxStats } from '../utils/gpx-parser';
import { parseGpx } from '../utils/gpx-parser';
import { BicycleSpinner } from './bicycle-spinner';
import { CityAutocomplete } from './city-autocomplete';
import { ElevationProfile } from './elevation-profile';
import { RecommendationCard } from './recommendation-card';
import { RouteMap } from './route-map';
import { StravaPicker } from './strava-picker';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  surface: SurfaceType | null;
  discipline: Discipline | null;
  distanceKm: string;
  elevationGainM: string;
  hasGpx: boolean;
  gradientStats?: {
    flat: number;
    rolling: number;
    hilly: number;
    steep: number;
  };
  locationName: string;
  raceDate: string;
  riderWeightKg: string;
}

const TOTAL_STEPS = 4;

const STEP_LABELS = ['Surface', 'Discipline', 'Parcours', 'Détails'] as const;

// ── Option configs ────────────────────────────────────────────────────────────

const SURFACE_OPTIONS: Array<{
  value: SurfaceType;
  label: string;
  sub: string;
  icon: React.ReactNode;
}> = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 17l3-9 3 9M5.5 13.5h3M15 17V8M15 8l-3 3M15 8l3 3" />
        <circle cx="19" cy="17" r="1" />
        <circle cx="11" cy="17" r="1" />
      </svg>
    ),
    label: 'Route',
    sub: 'Asphalte · Cyclosportive · Compétition',
    value: 'road',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 20c3-5 6-8 9-8s6 3 9 8M8 20c1-3 2-5 4-5s3 2 4 5" />
        <circle cx="12" cy="8" r="3" />
      </svg>
    ),
    label: 'Gravel',
    sub: 'Chemins mixtes · Bikepacking · Aventure',
    value: 'gravel',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 20h20M5 20L9 10l4 6 3-4 3 8" />
        <path d="M17 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      </svg>
    ),
    label: 'VTT',
    sub: 'Trail · Enduro · Single tracks',
    value: 'mtb',
  },
];

const DISCIPLINE_OPTIONS: Record<
  SurfaceType,
  Array<{
    value: Discipline;
    label: string;
    sub: string;
    icon: React.ReactNode;
  }>
> = {
  gravel: [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          <path d="M13 13l6 6" />
        </svg>
      ),
      label: 'Cyclosportive Gravel',
      sub: 'Événement chronométré sur mixte',
      value: 'sportive',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h18M3 6h18M3 18h12" />
          <circle cx="19" cy="18" r="2" />
        </svg>
      ),
      label: 'Bikepacking / Rando',
      sub: 'Longue distance · Autonomie',
      value: 'training',
    },
  ],
  mtb: [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 20h20M6 20L9 12l3 4 3-6 3 10" />
        </svg>
      ),
      label: 'All Mountain',
      sub: 'Montées et descentes équilibrées',
      value: 'all-mountain',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 20h20L12 2z" />
          <path d="M12 10v6" />
        </svg>
      ),
      label: 'Enduro',
      sub: 'Spéciales chronométrées · Terrain technique',
      value: 'enduro',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7-7 7 7" />
        </svg>
      ),
      label: 'Gravity / DH',
      sub: 'Descente pure · Vitesse maximale',
      value: 'gravity',
    },
  ],
  road: [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      ),
      label: 'Compétition',
      sub: 'Course chronométrée · Performance maximale',
      value: 'competition',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3" />
        </svg>
      ),
      label: 'Cyclosportive',
      sub: 'Grand fondo · Défi personnel',
      value: 'sportive',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      label: 'Entraînement',
      sub: 'Sorties longue distance · Régularité',
      value: 'training',
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTodayStr() {
  return new Date().toISOString().split('T')[0]!;
}

function getMaxDateStr() {
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]!;
}

// ── Step interfaces ───────────────────────────────────────────────────────────

interface BaseStepProps {
  data: FormData;
  onUpdate: (partial: Partial<FormData>) => void;
  direction: 'forward' | 'back';
  onBack: () => void;
}

// ── Step 1 — Surface ──────────────────────────────────────────────────────────

interface StepSurfaceProps extends BaseStepProps {
  onNext: () => void;
}

function StepSurface({ data, onUpdate, onNext, direction }: StepSurfaceProps) {
  return (
    <div className="ri-step" data-direction={direction}>
      <div className="ri-step-question">
        <span className="ri-step-num">01</span>
        <h2>Quelle est votre surface ?</h2>
        <p>Votre choix déterminera la gamme de pneus Michelin adaptée.</p>
      </div>
      <div className="ri-option-list">
        {SURFACE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`ri-option-card${data.surface === opt.value ? ' selected' : ''}`}
            onClick={() => {
              onUpdate({ discipline: null, surface: opt.value });
              setTimeout(onNext, 200);
            }}
          >
            <div className="ri-option-icon">{opt.icon}</div>
            <div className="ri-option-body">
              <span className="ri-option-label">{opt.label}</span>
              <span className="ri-option-sub">{opt.sub}</span>
            </div>
            <div className="ri-option-check">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 2 — Discipline ───────────────────────────────────────────────────────

interface StepDisciplineProps extends BaseStepProps {
  onNext: () => void;
}

function StepDiscipline({
  data,
  onUpdate,
  onNext,
  onBack,
  direction,
}: StepDisciplineProps) {
  const options = data.surface ? DISCIPLINE_OPTIONS[data.surface] : [];
  const surfaceLabel =
    SURFACE_OPTIONS.find((s) => s.value === data.surface)?.label ?? '';

  return (
    <div className="ri-step" data-direction={direction}>
      <div className="ri-step-question">
        <span className="ri-step-num">02</span>
        <h2>
          Votre discipline <span>{surfaceLabel}</span> ?
        </h2>
        <p>
          Chaque discipline a ses exigences spécifiques en matière de grip et
          d&apos;endurance.
        </p>
      </div>
      <div className="ri-option-list">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`ri-option-card${data.discipline === opt.value ? ' selected' : ''}`}
            onClick={() => {
              onUpdate({ discipline: opt.value });
              setTimeout(onNext, 200);
            }}
          >
            <div className="ri-option-icon">{opt.icon}</div>
            <div className="ri-option-body">
              <span className="ri-option-label">{opt.label}</span>
              <span className="ri-option-sub">{opt.sub}</span>
            </div>
            <div className="ri-option-check">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </button>
        ))}
      </div>
      <div className="ri-step-footer-solo">
        <button type="button" className="ri-back-btn" onClick={onBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </button>
      </div>
    </div>
  );
}

// ── Step 3 — Parcours ─────────────────────────────────────────────────────────

interface StepParcoursProps extends BaseStepProps {
  onNext: (values: {
    distanceKm: string;
    elevationGainM: string;
    hasGpx: boolean;
    gradientStats?: GpxStats['gradientStats'];
  }) => void;
  onLocationDetected?: (city: string) => void;
}

const GRADIENT_LABELS = [
  { key: 'flat' as const, label: 'Plat', color: '#e8eef8', text: '#003189' },
  {
    key: 'rolling' as const,
    label: 'Vallonné',
    color: '#16a34a',
    text: '#fff',
  },
  {
    key: 'hilly' as const,
    label: 'Montagneux',
    color: '#FFD200',
    text: '#003189',
  },
  { key: 'steep' as const, label: 'Raide', color: '#f97316', text: '#fff' },
];

function StepParcours({
  data,
  onBack,
  direction,
  onNext,
  onLocationDetected,
}: StepParcoursProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [localDist, setLocalDist] = useState(data.distanceKm);
  const [localElev, setLocalElev] = useState(data.elevationGainM);
  const [gpxStats, setGpxStats] = useState<GpxStats | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const hoveredLatLon = useMemo<[number, number] | null>(() => {
    if (hoveredIdx === null || !gpxStats) return null;
    const profilePt = gpxStats.profile[hoveredIdx];
    if (!profilePt) return null;
    const targetDist = profilePt.distKm;
    let closest = gpxStats.points[0];
    let minDiff = Infinity;
    for (const pt of gpxStats.points) {
      const diff = Math.abs(pt.distKm - targetDist);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    }
    return closest ? [closest.lat, closest.lon] : null;
  }, [hoveredIdx, gpxStats]);

  const [stravaSource, setStravaSource] = useState<string | null>(null);
  const canContinue = Number(localDist) > 0 && localElev !== '';

  function applyStats(stats: GpxStats, startLatLon?: [number, number] | null) {
    setGpxStats(stats);
    setLocalDist(String(stats.distanceKm));
    setLocalElev(String(stats.elevationGainM));

    const firstPt = startLatLon
      ? { lat: startLatLon[0], lon: startLatLon[1] }
      : stats.points[0];

    if (firstPt && onLocationDetected) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${firstPt.lat}&lon=${firstPt.lon}&format=json&accept-language=fr`,
        { headers: { 'Accept-Language': 'fr' } },
      )
        .then((r) => r.json())
        .then(
          (json: {
            address?: {
              city?: string;
              town?: string;
              village?: string;
              country?: string;
            };
          }) => {
            const addr = json.address ?? {};
            const city = addr.city ?? addr.town ?? addr.village ?? '';
            const country = addr.country ?? '';
            if (city)
              onLocationDetected(country ? `${city}, ${country}` : city);
          },
        )
        .catch(() => {});
    }
  }

  function handleGpx(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? '';
      const stats = parseGpx(text);
      if (stats) {
        setStravaSource(null);
        applyStats(stats);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="ri-step" data-direction={direction}>
      <div className="ri-step-question">
        <span className="ri-step-num">03</span>
        <h2>Votre parcours</h2>
        <p>Distance et dénivelé pour calibrer résistance et pression idéale.</p>
      </div>

      <div className="ri-step-fields">
        {/* ── Sources de parcours ── */}
        <div className="ri-gpx-section">
          {/* Strava */}
          <div className="ri-source-row">
            <StravaPicker
              onActivitySelected={(stats, _surface, startLatLon) => {
                setFileName(null);
                setStravaSource(`Activité Strava chargée`);
                applyStats(stats, startLatLon);
              }}
            />
          </div>

          {/* Séparateur */}
          <div className="ri-source-sep">
            <span>ou</span>
          </div>

          {/* GPX upload */}
          <p className="ri-gpx-optional">
            Import GPX <span>— fichier .gpx</span>
          </p>
          <div
            className={`ri-gpx-drop${dragging ? ' dragging' : ''}${fileName ? ' has-file' : ''}${stravaSource ? ' has-file' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleGpx(f);
            }}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".gpx"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleGpx(f);
              }}
            />
            {(fileName ?? stravaSource) ? (
              <>
                <div className="ri-gpx-drop-icon ri-gpx-drop-icon--ok">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="ri-gpx-drop-name">
                  {fileName ?? stravaSource}
                </span>
              </>
            ) : (
              <>
                <div className="ri-gpx-drop-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <span className="ri-gpx-drop-label">
                  Déposez votre fichier .gpx — distance & D+ auto-calculés
                </span>
              </>
            )}
          </div>
        </div>

        {/* Carte + stats GPX */}
        {gpxStats && (
          <div className="ri-gpx-preview">
            <RouteMap
              points={gpxStats.points}
              highlightLatLon={hoveredLatLon}
            />

            <div className="ri-gpx-stats-row">
              <div className="ri-gpx-stat">
                <span className="ri-gpx-stat-val">{gpxStats.distanceKm}</span>
                <span className="ri-gpx-stat-unit">km</span>
                <span className="ri-gpx-stat-label">Distance</span>
              </div>
              <div className="ri-gpx-stat-sep" />
              <div className="ri-gpx-stat">
                <span className="ri-gpx-stat-val">
                  {gpxStats.elevationGainM}
                </span>
                <span className="ri-gpx-stat-unit">m</span>
                <span className="ri-gpx-stat-label">Dénivelé +</span>
              </div>
              <div className="ri-gpx-stat-sep" />
              <div className="ri-gpx-stat">
                <span className="ri-gpx-stat-val">
                  {gpxStats.points.length}
                </span>
                <span className="ri-gpx-stat-unit">pts</span>
                <span className="ri-gpx-stat-label">Points GPS</span>
              </div>
            </div>

            <div className="ri-gradient-wrap">
              <p className="ri-gradient-title">Profil de terrain</p>
              <div className="ri-gradient-bar">
                {GRADIENT_LABELS.map(({ key, label, color, text }) => {
                  const pct = gpxStats.gradientStats[key];
                  if (pct === 0) return null;
                  return (
                    <div
                      key={key}
                      className="ri-gradient-seg"
                      style={{
                        width: `${pct}%`,
                        background: color,
                        color: text,
                      }}
                      title={`${label} : ${pct}%`}
                    >
                      {pct >= 12 && <span>{pct}%</span>}
                    </div>
                  );
                })}
              </div>
              <div className="ri-gradient-legend">
                {GRADIENT_LABELS.map(({ key, label, color }) => (
                  <div key={key} className="ri-gradient-legend-item">
                    <span
                      className="ri-gradient-legend-dot"
                      style={{ background: color }}
                    />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="ri-elev-wrap">
              <p className="ri-elev-title">Profil d&apos;élévation</p>
              <ElevationProfile
                profile={gpxStats.profile}
                hoveredIdx={hoveredIdx}
                onHover={setHoveredIdx}
              />
            </div>
          </div>
        )}

        {/* Inputs manuels (auto-remplis si GPX) */}
        <div className="ri-big-field-row">
          <div className="ri-big-field">
            <label htmlFor="distanceKm">
              Distance <span className="ri-unit">km</span>
              {gpxStats && <span className="ri-gpx-autofilled">● GPX</span>}
            </label>
            <input
              id="distanceKm"
              type="number"
              min={1}
              max={500}
              placeholder="120"
              value={localDist}
              onChange={(e) => setLocalDist(e.target.value)}
              className={`ri-big-input${gpxStats ? ' ri-big-input--autofilled' : ''}`}
            />
          </div>
          <div className="ri-big-field">
            <label htmlFor="elevationGainM">
              Dénivelé + <span className="ri-unit">m</span>
              {gpxStats && <span className="ri-gpx-autofilled">● GPX</span>}
            </label>
            <input
              id="elevationGainM"
              type="number"
              min={0}
              max={8000}
              placeholder="1800"
              value={localElev}
              onChange={(e) => setLocalElev(e.target.value)}
              className={`ri-big-input${gpxStats ? ' ri-big-input--autofilled' : ''}`}
            />
          </div>
        </div>
      </div>

      <div className="ri-step-footer">
        <button type="button" className="ri-back-btn" onClick={onBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </button>
        <button
          type="button"
          className="ri-next-btn"
          disabled={!canContinue}
          onClick={() =>
            onNext({
              distanceKm: localDist,
              elevationGainM: localElev,
              hasGpx: !!gpxStats,
              gradientStats: gpxStats?.gradientStats,
            })
          }
        >
          Continuer
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Step 4 — Details ──────────────────────────────────────────────────────────

interface StepDetailsValues {
  locationName: string;
  raceDate: string;
  riderWeightKg: string;
}

interface StepDetailsProps extends BaseStepProps {
  onAnalyze: (values: StepDetailsValues) => void;
}

function StepDetails({ data, onBack, direction, onAnalyze }: StepDetailsProps) {
  const [localLoc, setLocalLoc] = useState(data.locationName);
  const [localDate, setLocalDate] = useState(data.raceDate);
  const [localWeight, setLocalWeight] = useState(data.riderWeightKg);

  const canContinue =
    localLoc.trim().length > 2 && !!localDate && Number(localWeight) >= 30;

  return (
    <div className="ri-step" data-direction={direction}>
      <div className="ri-step-question">
        <span className="ri-step-num">04</span>
        <h2>Date, lieu & profil</h2>
        <p>Pour analyser la météo prévue et calibrer la pression exacte.</p>
      </div>

      <div className="ri-step-fields">
        <div className="ri-detail-field">
          <label htmlFor="locationName">Lieu de départ</label>
          <CityAutocomplete
            id="locationName"
            value={localLoc}
            onChange={setLocalLoc}
            placeholder="ex : Alpe d'Huez, France"
          />
        </div>

        <div className="ri-detail-row">
          <div className="ri-detail-field">
            <label htmlFor="raceDate">Date de course</label>
            <input
              id="raceDate"
              type="date"
              min={getTodayStr()}
              max={getMaxDateStr()}
              value={localDate}
              onChange={(e) => setLocalDate(e.target.value)}
              className="ri-detail-input"
            />
          </div>
          <div className="ri-detail-field">
            <label htmlFor="riderWeightKg">
              Poids rider <span className="ri-unit-inline">kg</span>
            </label>
            <input
              id="riderWeightKg"
              type="number"
              min={30}
              max={150}
              placeholder="72"
              value={localWeight}
              onChange={(e) => setLocalWeight(e.target.value)}
              className="ri-detail-input"
            />
          </div>
        </div>
      </div>

      <div className="ri-step-footer">
        <button type="button" className="ri-back-btn" onClick={onBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </button>
        <button
          type="button"
          className="ri-next-btn"
          disabled={!canContinue}
          onClick={() =>
            onAnalyze({
              locationName: localLoc,
              raceDate: localDate,
              riderWeightKg: localWeight,
            })
          }
        >
          Analyser ma course
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Main Stepper ──────────────────────────────────────────────────────────────

const INITIAL_FORM: FormData = {
  discipline: null,
  distanceKm: '',
  elevationGainM: '',
  hasGpx: false,
  locationName: '',
  raceDate: '',
  riderWeightKg: '',
  surface: null,
};

interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  raceName: string;
}

export function RaceForm({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [result, setResult] = useState<AnalyzeRaceState>({
    data: null,
    error: null,
  });
  const [isPending, startTransition] = useTransition();
  const [saveState, setSaveState] = useState<SaveState>({
    status: 'idle',
    raceName: '',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ri_stepper');
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        step?: number;
        form?: Partial<FormData>;
      };
      const savedStep = typeof saved.step === 'number' ? saved.step : 0;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedStep > 0 && savedStep < TOTAL_STEPS) setStep(savedStep);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved.form) setForm((prev) => ({ ...prev, ...saved.form }));
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (step >= TOTAL_STEPS || isPending) return;
    try {
      localStorage.setItem('ri_stepper', JSON.stringify({ step, form }));
    } catch {
      /* storage unavailable */
    }
  }, [step, form, isPending]);

  function restart() {
    try {
      localStorage.removeItem('ri_stepper');
    } catch {
      /* storage unavailable */
    }
    setResult({ data: null, error: null });
    setStep(0);
    setForm(INITIAL_FORM);
  }

  function updateForm(partial: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function goNext() {
    setDirection('forward');
    setStep((s) => s + 1);
  }

  function goBack() {
    setDirection('back');
    setStep((s) => Math.max(0, s - 1));
  }

  function handleAnalyze(allData: FormData) {
    if (!allData.surface || !allData.discipline) return;

    startTransition(async () => {
      const request: RaceAnalyzeRequest = {
        discipline: allData.discipline!,
        distanceKm: Number(allData.distanceKm),
        elevationGainM: Number(allData.elevationGainM),
        hasGpx: allData.hasGpx || undefined,
        gradientStats: allData.gradientStats,
        locationName: allData.locationName,
        raceDate: allData.raceDate,
        riderWeightKg: Number(allData.riderWeightKg),
        surface: allData.surface!,
      };
      const [res] = await Promise.all([
        analyzeRaceAction(request),
        new Promise<void>((resolve) => setTimeout(resolve, 3000)),
      ]);
      setResult(res);
      setSaveState({ status: 'idle', raceName: allData.locationName });
    });
  }

  async function handleSaveRace(result: RaceAnalyzeResponse) {
    if (saveState.status === 'saving' || saveState.status === 'saved') return;
    setSaveState((s) => ({ ...s, status: 'saving' }));
    const payload: CreateSavedRaceRequest = {
      raceName: saveState.raceName || form.locationName || 'Ma course',
      raceDate: form.raceDate,
      locationName: form.locationName,
      surface: form.surface ?? '',
      discipline: form.discipline ?? '',
      distanceKm: Number(form.distanceKm),
      elevationGainM: Number(form.elevationGainM),
      riderWeightKg: Number(form.riderWeightKg),
      result,
    };
    try {
      const res = await fetch('/api/saved-races', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSaveState((s) => ({
        ...s,
        status: res.ok ? 'saved' : 'error',
      }));
    } catch {
      setSaveState((s) => ({ ...s, status: 'error' }));
    }
  }

  const baseProps = {
    data: form,
    direction,
    onBack: goBack,
    onUpdate: updateForm,
  };

  // ── Loading ──
  if (isPending) {
    return (
      <div className="ri-stepper-shell">
        <BicycleSpinner />
      </div>
    );
  }

  // ── Result ──
  if (step === TOTAL_STEPS) {
    if (result.error) {
      return (
        <div className="ri-stepper-shell">
          <div className="ri-step" data-direction="forward">
            <div className="ri-error-screen">
              <div className="ri-error-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p>{result.error}</p>
              <button type="button" className="ri-next-btn" onClick={restart}>
                Recommencer
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (result.data) {
      const raceResult = result.data;
      return (
        <div className="ri-stepper-shell">
          <div className="ri-result-wrapper">
            <RecommendationCard result={raceResult} />
          </div>

          <div className="ri-save-wrap">
            {saveState.status === 'saved' ? (
              <div className="ri-save-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Course sauvegardée dans votre profil
              </div>
            ) : (
              <div className="ri-save-form">
                <input
                  className="ri-save-input"
                  type="text"
                  placeholder="Nom de la course"
                  value={saveState.raceName}
                  onChange={(e) =>
                    setSaveState((s) => ({ ...s, raceName: e.target.value }))
                  }
                  maxLength={100}
                />
                <button
                  type="button"
                  className="ri-save-btn"
                  disabled={saveState.status === 'saving'}
                  onClick={() => void handleSaveRace(raceResult)}
                >
                  {saveState.status === 'saving' ? (
                    'Sauvegarde…'
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Sauvegarder dans mon profil
                    </>
                  )}
                </button>
                {saveState.status === 'error' && (
                  <p className="ri-save-error">
                    Erreur lors de la sauvegarde. Réessaie.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="ri-restart-wrap">
            <button type="button" className="ri-restart-btn" onClick={restart}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
              </svg>
              Nouvelle analyse
            </button>
          </div>
        </div>
      );
    }

    // Waiting for result (shouldn't happen if isPending is correct, but fallback)
    return (
      <div className="ri-stepper-shell">
        <BicycleSpinner />
      </div>
    );
  }

  // ── Steps ──
  return (
    <div className="ri-stepper-shell">
      {/* Steps nav */}
      <div className="ri-steps-nav">
        <div className="ri-steps-nav-pills">
          {STEP_LABELS.map((label, i) => {
            const parts = [];
            if (i > 0)
              parts.push(
                <div
                  key={`line-${i}`}
                  className={`ri-steps-connector${i <= step ? ' active' : ''}`}
                />,
              );
            parts.push(
              <div
                key={`node-${i}`}
                className={`ri-step-node${i < step ? ' done' : ''}${i === step ? ' current' : ''}`}
              >
                <div className="ri-step-node-num">
                  {i < step ? (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="ri-step-node-label">{label}</span>
              </div>,
            );
            return parts;
          })}
        </div>
        {step > 0 && (
          <button
            type="button"
            className="ri-nav-restart-btn"
            onClick={restart}
            title="Recommencer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
            Recommencer
          </button>
        )}
      </div>

      {step === 0 && <StepSurface {...baseProps} onNext={goNext} />}

      {step === 1 && <StepDiscipline {...baseProps} onNext={goNext} />}

      {step === 2 && (
        <StepParcours
          {...baseProps}
          onNext={(parcoursValues) => {
            updateForm(parcoursValues);
            goNext();
          }}
          onLocationDetected={(city) => updateForm({ locationName: city })}
        />
      )}

      {step === 3 && (
        <StepDetails
          {...baseProps}
          onAnalyze={(detailValues) => {
            const allData: FormData = { ...form, ...detailValues };
            if (!isLoggedIn) {
              try {
                localStorage.setItem(
                  'ri_stepper',
                  JSON.stringify({ step: 3, form: allData }),
                );
              } catch {
                /* storage unavailable */
              }
              router.push('/login?redirect=/race-intelligence');
              return;
            }
            updateForm(detailValues);
            setDirection('forward');
            setStep(TOTAL_STEPS);
            handleAnalyze(allData);
          }}
        />
      )}
    </div>
  );
}
