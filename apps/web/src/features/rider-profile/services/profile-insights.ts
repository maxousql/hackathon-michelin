import type {
  Bike,
  BikeType,
  RidingSurface,
  SavedRace,
  TirePassport,
} from '@michelin/contracts';

import type { ResolvedTireRecommendation } from './tire-recommendation';

export interface ProfileCompleteness {
  completed: number;
  total: number;
  score: number;
  actions: string[];
}

export interface ProfileAlert {
  id: string;
  tone: 'info' | 'warning';
  title: string;
  body: string;
}

export interface RaceBuckets {
  upcoming: SavedRace[];
  past: SavedRace[];
}

export interface RacePreparation {
  badge: string;
  daysUntil: number;
  bike: Bike | null;
  passport: TirePassport | null;
  tireMountStatus: RaceTireMountStatus;
  checklist: Array<{ label: string; done: boolean }>;
}

export interface RaceTireMountStatus {
  status: 'missing-bike' | 'missing-passport' | 'aligned' | 'mismatch';
  title: string;
  body: string;
}

export interface TireComparison {
  status: 'missing' | 'aligned' | 'compare';
  title: string;
  body: string;
}

export interface ProfileActivity {
  sportType: string;
  distanceMeters: number;
  elevationGainM: number;
  startedAt: string;
}

export interface ProfileStats {
  sorties: number;
  terrain: string;
  terrainDetail: string;
  distanceMoy: number;
  elevMoy: number;
}

type TerrainKind = BikeType;
type TerrainSource = 'activities' | 'bikes' | 'races' | 'passports';

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

function todayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysUntil(date: string, today = todayDate()): number {
  const target = parseDate(date);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

export function raceBadge(date: string, today = todayDate()): string {
  const days = daysUntil(date, today);
  if (days === 0) return "Aujourd'hui";
  if (days > 0) return `J-${days}`;
  return `Passée`;
}

export function splitRacesByDate(
  races: SavedRace[],
  today = todayDate(),
): RaceBuckets {
  const sorted = [...races].sort(
    (a, b) => parseDate(a.raceDate).getTime() - parseDate(b.raceDate).getTime(),
  );

  return {
    upcoming: sorted.filter((race) => daysUntil(race.raceDate, today) >= 0),
    past: sorted
      .filter((race) => daysUntil(race.raceDate, today) < 0)
      .reverse(),
  };
}

export function calculateProfileStats({
  activities,
  bikes,
  savedRaces,
  tirePassports,
  today = todayDate(),
}: {
  activities: ProfileActivity[];
  bikes: Bike[];
  savedRaces: SavedRace[];
  tirePassports: TirePassport[];
  today?: Date;
}): ProfileStats {
  const eightWeeksAgo = today.getTime() - 8 * 7 * 24 * 60 * 60 * 1000;
  const recent = activities.filter(
    (activity) => parseDateLike(activity.startedAt).getTime() > eightWeeksAgo,
  );
  const sorties = Math.round((recent.length / 8) * 10) / 10;

  const terrainScores: Record<TerrainKind, number> = {
    road: 0,
    gravel: 0,
    mtb: 0,
  };
  const surfaceScoresByTerrain: Record<
    TerrainKind,
    Partial<Record<RidingSurface, number>>
  > = {
    road: {},
    gravel: {},
    mtb: {},
  };
  const sourceCounts: Record<TerrainSource, number> = {
    activities: 0,
    bikes: 0,
    races: 0,
    passports: 0,
  };
  const bikesById = new Map(bikes.map((bike) => [bike.id, bike]));

  function addSignal({
    terrain,
    surface,
    weight,
    source,
  }: {
    terrain: TerrainKind | null;
    surface: RidingSurface | null;
    weight: number;
    source: TerrainSource;
  }) {
    if (!terrain) return;

    const normalizedWeight = Math.max(weight, 1);
    terrainScores[terrain] += normalizedWeight;
    sourceCounts[source] += 1;

    if (surface) {
      const surfaceScores = surfaceScoresByTerrain[terrain];
      surfaceScores[surface] = (surfaceScores[surface] ?? 0) + normalizedWeight;
    }
  }

  for (const activity of activities) {
    const terrain = sportTypeToTerrain(activity.sportType);
    addSignal({
      terrain,
      surface: terrain ? defaultSurfaceForTerrain(terrain) : null,
      weight: activity.distanceMeters / 1000,
      source: 'activities',
    });
  }

  for (const bike of bikes) {
    addSignal({
      terrain: bike.type,
      surface: bike.ridingSurface,
      weight: (bike.distanceKm || 40) * (bike.isPrimary ? 1.15 : 1),
      source: 'bikes',
    });
  }

  for (const race of savedRaces) {
    const terrain = surfaceToTerrain(race.surface);
    addSignal({
      terrain,
      surface: terrain ? defaultSurfaceForTerrain(terrain) : null,
      weight:
        race.distanceKm * (daysUntil(race.raceDate, today) >= 0 ? 1.15 : 1),
      source: 'races',
    });
  }

  for (const passport of tirePassports) {
    const bike = bikesById.get(passport.bikeId);
    if (!bike) continue;

    const confidence = passport.status === 'active' ? 0.25 : 0.1;
    addSignal({
      terrain: bike.type,
      surface: bike.ridingSurface,
      weight: Math.min(passport.mountedDistanceKm, 5000) * confidence,
      source: 'passports',
    });
  }

  const dominantTerrain = highestEntry(terrainScores)?.[0] ?? null;
  const dominantSurface = dominantTerrain
    ? (highestEntry(surfaceScoresByTerrain[dominantTerrain])?.[0] ?? null)
    : null;
  const terrain = dominantTerrainLabel(dominantTerrain, dominantSurface);

  const effortSamples =
    activities.length > 0
      ? activities.map((activity) => ({
          distanceKm: activity.distanceMeters / 1000,
          elevationGainM: activity.elevationGainM,
        }))
      : savedRaces.map((race) => ({
          distanceKm: race.distanceKm,
          elevationGainM: race.elevationGainM,
        }));

  const distanceMoy =
    effortSamples.length > 0
      ? Math.round(
          effortSamples.reduce((sum, sample) => sum + sample.distanceKm, 0) /
            effortSamples.length,
        )
      : 0;
  const elevMoy =
    effortSamples.length > 0
      ? Math.round(
          effortSamples.reduce(
            (sum, sample) => sum + sample.elevationGainM,
            0,
          ) / effortSamples.length,
        )
      : 0;

  return {
    sorties,
    terrain,
    terrainDetail: terrainDetail(sourceCounts),
    distanceMoy,
    elevMoy,
  };
}

export function calculateProfileCompleteness({
  bikes,
  savedRaces,
  stravaConnected,
  tirePassports,
}: {
  bikes: Bike[];
  savedRaces: SavedRace[];
  stravaConnected: boolean;
  tirePassports: TirePassport[];
}): ProfileCompleteness {
  const checks = [
    {
      done: bikes.length > 0,
      action: 'Ajouter au moins un vélo',
    },
    {
      done: bikes.some((bike) => bike.isPrimary),
      action: 'Définir un vélo principal',
    },
    {
      done: bikes.some((bike) => bike.tireDiameter && bike.tireWidth),
      action: 'Renseigner les dimensions de pneu',
    },
    {
      done: bikes.some((bike) => bike.tireSealing),
      action: 'Préciser le montage pneu',
    },
    {
      done: tirePassports.some(
        (passport) =>
          passport.status === 'active' &&
          passport.tireBrand &&
          passport.tireModel,
      ),
      action: 'Ajouter le pneu actuellement monté',
    },
    {
      done: savedRaces.length > 0,
      action: 'Sauvegarder une course cible',
    },
    {
      done: savedRaces.some((race) => race.bikeId),
      action: 'Associer une course à un vélo',
    },
    {
      done: tirePassports.length > 0,
      action: 'Créer un passeport pneu',
    },
    {
      done: stravaConnected,
      action: 'Connecter Strava pour enrichir les habitudes',
    },
  ];

  const completed = checks.filter((check) => check.done).length;

  return {
    completed,
    total: checks.length,
    score: Math.round((completed / checks.length) * 100),
    actions: checks
      .filter((check) => !check.done)
      .slice(0, 4)
      .map((check) => check.action),
  };
}

export function buildProfileAlerts({
  bikes,
  savedRaces,
  tirePassports,
}: {
  bikes: Bike[];
  savedRaces: SavedRace[];
  tirePassports: TirePassport[];
}): ProfileAlert[] {
  const alerts: ProfileAlert[] = [];

  for (const bike of bikes) {
    if (!bike.tireDiameter || !bike.tireWidth) {
      alerts.push({
        id: `fitment-${bike.id}`,
        tone: 'warning',
        title: `${bike.name} manque de précision`,
        body: 'Ajoute le diamètre et la largeur pour cibler une référence exacte.',
      });
    }

    if (
      bike.distanceKm >= 8000 &&
      !hasPassportForBike(tirePassports, bike.id)
    ) {
      alerts.push({
        id: `wear-${bike.id}`,
        tone: 'info',
        title: `${bike.name} approche un gros kilométrage`,
        body: 'Un passeport pneu permet de suivre le montage et les prochains contrôles.',
      });
    }
  }

  const upcoming = splitRacesByDate(savedRaces).upcoming;
  for (const race of upcoming.slice(0, 3)) {
    const days = daysUntil(race.raceDate);
    if (days <= 14 && !race.bikeId) {
      alerts.push({
        id: `race-bike-${race.id}`,
        tone: 'warning',
        title: `${race.raceName} arrive bientôt`,
        body: 'Associe un vélo pour verrouiller la compatibilité et la pression.',
      });
    }

    const bike = bikes.find((item) => item.id === race.bikeId);
    if (bike && race.surface && bike.type !== race.surface) {
      alerts.push({
        id: `race-compat-${race.id}`,
        tone: 'info',
        title: `Compatibilité à vérifier pour ${race.raceName}`,
        body: `Course ${race.surface}, vélo ${bike.type} : confirme que ce choix correspond bien au terrain.`,
      });
    }
  }

  for (const passport of tirePassports) {
    if (passport.mountedDistanceKm >= 5000) {
      alerts.push({
        id: `passport-${passport.id}`,
        tone: 'info',
        title: `${passport.tireName} à contrôler`,
        body: 'Le kilométrage déclaré mérite une vérification visuelle avant une course.',
      });
    }
  }

  return alerts.slice(0, 5);
}

export function buildRacePreparation(
  race: SavedRace,
  bikes: Bike[],
  tirePassports: TirePassport[],
): RacePreparation {
  const bike = bikes.find((item) => item.id === race.bikeId) ?? null;
  const passport = bike
    ? (tirePassports.find(
        (item) => item.bikeId === bike.id && item.status === 'active',
      ) ?? null)
    : null;
  const tireMountStatus = buildRaceTireMountStatus(race, bike, passport);
  const recommendedMounted = tireMountStatus.status === 'aligned';

  return {
    badge: raceBadge(race.raceDate),
    daysUntil: daysUntil(race.raceDate),
    bike,
    passport,
    tireMountStatus,
    checklist: [
      { label: 'Vélo associé', done: bike !== null },
      {
        label: `Pression conseillée AV/AR : ${race.result.pressure.frontBar} / ${race.result.pressure.rearBar} bar`,
        done: recommendedMounted,
      },
      { label: 'Passeport pneu actif', done: passport !== null },
      { label: 'Pneu recommandé monté', done: recommendedMounted },
      {
        label: 'Compatibilité terrain cohérente',
        done: bike === null || bike.type === race.surface,
      },
    ],
  };
}

function buildRaceTireMountStatus(
  race: SavedRace,
  bike: Bike | null,
  passport: TirePassport | null,
): RaceTireMountStatus {
  const recommendedName = race.result.tire.name;

  if (!bike) {
    return {
      status: 'missing-bike',
      title: 'Vélo à associer',
      body: `Associe un vélo pour vérifier que ${recommendedName} est bien monté avant d'utiliser la pression conseillée.`,
    };
  }

  if (!passport) {
    return {
      status: 'missing-passport',
      title: 'Pneu actif inconnu',
      body: `Aucun passeport actif sur ${bike.name}. Crée ou active un passeport pour valider ${recommendedName}.`,
    };
  }

  const mountedName = `${passport.tireBrand} ${passport.tireModel}`.trim();
  const normalizedMounted = normalize(mountedName);
  const normalizedRecommended = normalize(recommendedName);
  const aligned =
    normalizedMounted.includes(normalizedRecommended) ||
    normalizedRecommended.includes(normalizedMounted);

  if (aligned) {
    return {
      status: 'aligned',
      title: 'Pneu recommandé monté',
      body: `${mountedName} est actif sur ${bike.name}. La pression conseillée peut servir de base de réglage.`,
    };
  }

  return {
    status: 'mismatch',
    title: 'Pneu actif différent',
    body: `${mountedName} est actif sur ${bike.name}, alors que la course recommande ${recommendedName}. Valide la compatibilité avant d'appliquer cette pression.`,
  };
}

export function buildTireComparison(
  passport: TirePassport | null,
  recommendation: ResolvedTireRecommendation,
): TireComparison {
  const current = passport
    ? `${passport.tireBrand} ${passport.tireModel}`.trim()
    : '';

  if (!current) {
    return {
      status: 'missing',
      title: 'Pneu actuel non renseigné',
      body: 'Ajoute le pneu actif pour le comparer à la référence vélo.',
    };
  }

  const recommendedName = recommendation.productName ?? recommendation.name;
  const normalizedCurrent = normalize(current);
  const normalizedRecommended = normalize(recommendedName);

  if (
    normalizedCurrent.includes(normalizedRecommended) ||
    normalizedRecommended.includes(normalizedCurrent)
  ) {
    return {
      status: 'aligned',
      title: 'Pneu actif aligné avec la référence vélo',
      body: `${current} correspond déjà au pneu de référence pour cet usage habituel.`,
    };
  }

  return {
    status: 'compare',
    title: `Référence vélo différente de ${current}`,
    body: `${recommendedName} est la référence vélo pour ${recommendation.sub.toLowerCase()}. Le pneu actif peut rester pertinent pour une course ou un contexte spécifique.`,
  };
}

function hasPassportForBike(
  passports: TirePassport[],
  bikeId: string,
): boolean {
  return passports.some((passport) => passport.bikeId === bikeId);
}

export function activePassportForBike(
  passports: TirePassport[],
  bikeId: string,
): TirePassport | null {
  return (
    passports.find(
      (passport) => passport.bikeId === bikeId && passport.status === 'active',
    ) ?? null
  );
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseDateLike(value: string): Date {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date;
  return parseDate(value);
}

function sportTypeToTerrain(sportType: string): TerrainKind {
  const normalizedSportType = normalize(sportType);
  if (
    normalizedSportType.includes('mountain') ||
    normalizedSportType.includes('mtb')
  ) {
    return 'mtb';
  }
  if (
    normalizedSportType.includes('gravel') ||
    normalizedSportType.includes('trail')
  ) {
    return 'gravel';
  }
  return 'road';
}

function surfaceToTerrain(surface: string): TerrainKind | null {
  const normalizedSurface = normalize(surface);
  if (normalizedSurface.includes('mtb')) return 'mtb';
  if (normalizedSurface.includes('gravel')) return 'gravel';
  if (normalizedSurface.includes('road')) return 'road';
  return null;
}

function defaultSurfaceForTerrain(terrain: TerrainKind): RidingSurface {
  if (terrain === 'road') return 'smooth';
  if (terrain === 'gravel') return 'mixed';
  return 'loose';
}

function highestEntry<T extends string>(
  scores: Partial<Record<T, number>>,
): [T, number] | null {
  const entries = Object.entries(scores) as Array<[T, number]>;
  const positiveEntries = entries.filter(([, score]) => score > 0);
  return positiveEntries.sort((a, b) => b[1] - a[1])[0] ?? null;
}

function dominantTerrainLabel(
  terrain: TerrainKind | null,
  surface: RidingSurface | null,
): string {
  if (!terrain) return '—';

  if (terrain === 'road') {
    if (surface === 'urban') return 'Route urbaine';
    if (surface === 'mixed') return 'Route mixte';
    return 'Route';
  }

  if (terrain === 'gravel') {
    if (surface === 'loose') return 'Gravel cassant';
    if (surface === 'mud') return 'Gravel humide';
    if (surface === 'smooth') return 'Gravel roulant';
    return 'Gravel mixte';
  }

  if (surface === 'mud') return 'VTT boue';
  if (surface === 'mixed') return 'VTT mixte';
  return 'VTT';
}

function terrainDetail(sourceCounts: Record<TerrainSource, number>): string {
  const parts = [
    countLabel(sourceCounts.activities, 'sortie Strava', 'sorties Strava'),
    countLabel(sourceCounts.bikes, 'vélo', 'vélos'),
    countLabel(sourceCounts.races, 'course', 'courses'),
    countLabel(sourceCounts.passports, 'passeport', 'passeports'),
  ].filter((part): part is string => part !== null);

  if (parts.length === 0) {
    return 'Ajoute un vélo, une course ou connecte Strava';
  }

  return `Basé sur ${joinFrenchList(parts)}`;
}

function countLabel(
  count: number,
  singular: string,
  plural: string,
): string | null {
  if (count === 0) return null;
  return `${count} ${count === 1 ? singular : plural}`;
}

function joinFrenchList(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  if (parts.length === 2) return `${parts[0]} et ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}`;
}
