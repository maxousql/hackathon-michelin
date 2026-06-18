'use client';

import type { Retailer } from '@michelin/contracts';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import type { MapPoint } from '@/features/retailers/components/retailer-map';
import {
  countryCoords,
  spreadAround,
  type LatLng,
} from '@/features/retailers/services/geo';
import {
  fetchNearbyStores,
  type PhysicalStore,
} from '@/features/retailers/services/physical-stores';

import styles from './where-to-buy.module.css';

const RetailerMap = dynamic(
  () => import('@/features/retailers/components/retailer-map'),
  { ssr: false, loading: () => <div className={styles.mapPlaceholder} /> },
);

/** Rayon de recherche des magasins physiques « autour de moi », en km. */
const RADIUS_KM = 50;

const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France',
  DE: 'Allemagne',
  UK: 'Royaume-Uni',
  ES: 'Espagne',
  NL: 'Pays-Bas',
  IT: 'Italie',
  PL: 'Pologne',
  BE: 'Belgique',
};

function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

type StoresStatus = 'idle' | 'loading' | 'done' | 'error';

/**
 * Points cartographiques des revendeurs partenaires (en ligne) : regroupés par
 * pays (un centroïde par pays) puis étalés pour rester distinguables.
 */
function retailerPoints(retailers: Retailer[]): MapPoint[] {
  const byCountry = new Map<string, Retailer[]>();
  for (const retailer of retailers) {
    const group = byCountry.get(retailer.country) ?? [];
    group.push(retailer);
    byCountry.set(retailer.country, group);
  }

  const points: MapPoint[] = [];
  for (const [code, group] of byCountry) {
    const base = countryCoords(code);
    if (!base) continue;
    group.forEach((retailer, index) => {
      points.push({
        id: retailer.id,
        name: retailer.name,
        label: countryName(retailer.country),
        website: retailer.website,
        position: spreadAround(base, index, group.length),
      });
    });
  }
  return points;
}

/** Étiquette secondaire d'un magasin physique (adresse et/ou distance). */
function storeLabel(store: PhysicalStore): string {
  const distance = `~${Math.round(store.distance)} km`;
  return store.address ? `${store.address} · ${distance}` : distance;
}

/** Normalise un nom pour comparaison : minuscules, sans accents ni ponctuation. */
function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Mots génériques ignorés : ils ne distinguent pas une enseigne partenaire. */
const GENERIC_WORDS = new Set([
  'bike',
  'bikes',
  'biking',
  'velo',
  'velos',
  'cycle',
  'cycles',
  'cycling',
  'cyclery',
  'sport',
  'sports',
  'shop',
  'store',
  'magasin',
  'boutique',
  'the',
  'and',
  'les',
  'des',
  'du',
  'de',
  'la',
  'le',
]);

/** Tokens distinctifs d'un revendeur (≥ 4 lettres, hors mots génériques). */
function distinctiveTokens(retailers: Retailer[]): string[] {
  return [
    ...new Set(
      retailers
        .flatMap((retailer) => normalizeName(retailer.name).split(' '))
        .filter((token) => token.length >= 4 && !GENERIC_WORDS.has(token)),
    ),
  ];
}

/**
 * Ne conserve que les magasins physiques rattachables à un revendeur partenaire.
 * Matching permissif : il suffit qu'un token distinctif du revendeur apparaisse
 * dans le nom du magasin (ex. « Ambassade Probikeshop » → « probikeshop »,
 * « Evans Bike Lyon » → « evans »).
 */
function filterByRetailers(
  stores: PhysicalStore[],
  retailers: Retailer[],
): PhysicalStore[] {
  const tokens = distinctiveTokens(retailers);
  return stores.filter((store) => {
    const name = normalizeName(store.name);
    return tokens.some((token) => name.includes(token));
  });
}

type GeoStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'unsupported';

interface WhereToBuyProps {
  retailers: Retailer[];
}

export function WhereToBuy({ retailers }: WhereToBuyProps) {
  const countries = useMemo(
    () =>
      [...new Set(retailers.map((r) => r.country))].sort((a, b) =>
        countryName(a).localeCompare(countryName(b), 'fr'),
      ),
    [retailers],
  );

  const [country, setCountry] = useState(() =>
    countries.includes('FR') ? 'FR' : (countries[0] ?? ''),
  );
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [position, setPosition] = useState<LatLng | null>(null);
  const [stores, setStores] = useState<PhysicalStore[]>([]);
  const [storesStatus, setStoresStatus] = useState<StoresStatus>('idle');

  const showNearby = geoStatus === 'ready';

  // Magasins physiques restreints à nos revendeurs partenaires.
  const matchedStores = useMemo(
    () => filterByRetailers(stores, retailers),
    [stores, retailers],
  );

  // Mode géoloc → points de vente partenaires proches ; sinon → revendeurs.
  const points = useMemo<MapPoint[]>(() => {
    if (showNearby) {
      return matchedStores.map((store) => ({
        id: store.id,
        name: store.name,
        label: storeLabel(store),
        website: store.website,
        position: store.position,
      }));
    }
    return retailerPoints(retailers);
  }, [showNearby, matchedStores, retailers]);

  // Interroge OpenStreetMap pour les magasins physiques autour d'un point.
  async function loadStores(center: LatLng) {
    setStoresStatus('loading');
    setStores([]);
    try {
      const result = await fetchNearbyStores(center, RADIUS_KM);
      setStores(result);
      setStoresStatus('done');
    } catch {
      setStoresStatus('error');
    }
  }

  function locate() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const center = { lat: coords.latitude, lng: coords.longitude };
        setPosition(center);
        setGeoStatus('ready');
        void loadStores(center);
      },
      () => {
        setGeoStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  if (retailers.length === 0) {
    return (
      <section className={styles.box}>
        <h2 className={styles.title}>Où l’acheter</h2>
        <p className={styles.empty}>
          Aucun revendeur partenaire disponible pour le moment.
        </p>
      </section>
    );
  }

  const countryList = retailers.filter(
    (retailer) => retailer.country === country,
  );
  const showMap = points.length > 0 || (showNearby && position !== null);

  return (
    <section className={styles.box}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>Où l’acheter</h2>
          <p className={styles.subtitle}>
            {showNearby
              ? `Revendeurs partenaires à moins de ${RADIUS_KM} km de votre position.`
              : 'Disponible chez nos revendeurs partenaires.'}
          </p>
        </div>

        {showNearby ? (
          <button
            type="button"
            className={styles.locateButton}
            onClick={() => {
              setGeoStatus('idle');
              setPosition(null);
              setStores([]);
              setStoresStatus('idle');
            }}
          >
            Choisir un pays
          </button>
        ) : (
          <div className={styles.controls}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Pays</span>
              <select
                className={styles.select}
                value={country}
                onChange={(event) => setCountry(event.target.value)}
              >
                {countries.map((code) => (
                  <option key={code} value={code}>
                    {countryName(code)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={styles.locateButton}
              onClick={locate}
              disabled={geoStatus === 'locating'}
            >
              {geoStatus === 'locating' ? 'Localisation…' : '📍 Autour de moi'}
            </button>
          </div>
        )}
      </div>

      {geoStatus === 'denied' && (
        <p className={styles.notice}>
          Géolocalisation refusée. Sélectionnez un pays ci-dessus.
        </p>
      )}
      {geoStatus === 'unsupported' && (
        <p className={styles.notice}>
          Votre navigateur ne prend pas en charge la géolocalisation.
        </p>
      )}

      {showMap && (
        <div className={styles.mapWrap}>
          <RetailerMap
            points={points}
            userPosition={showNearby ? position : null}
          />
        </div>
      )}

      {showNearby ? (
        storesStatus === 'loading' ? (
          <p className={styles.empty}>Recherche des magasins autour de vous…</p>
        ) : storesStatus === 'error' ? (
          <p className={styles.notice}>
            Impossible de récupérer les magasins pour le moment. Réessayez plus
            tard.
          </p>
        ) : matchedStores.length === 0 ? (
          <p className={styles.empty}>
            Aucun revendeur partenaire trouvé dans un rayon de {RADIUS_KM} km.
          </p>
        ) : (
          <ul className={styles.list}>
            {matchedStores.map((store) => (
              <li key={store.id}>
                <a
                  className={styles.retailer}
                  href={store.website}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span className={styles.info}>
                    <span className={styles.name}>{store.name}</span>
                    <span className={styles.meta}>{storeLabel(store)}</span>
                  </span>
                  <span className={styles.go}>Voir →</span>
                </a>
              </li>
            ))}
          </ul>
        )
      ) : (
        <ul className={styles.list}>
          {countryList.map((retailer) => (
            <li key={retailer.id}>
              <a
                className={styles.retailer}
                href={retailer.website}
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className={styles.name}>{retailer.name}</span>
                <span className={styles.go}>Visiter →</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
