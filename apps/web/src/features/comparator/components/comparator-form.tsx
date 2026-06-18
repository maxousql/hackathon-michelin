'use client';

import type {
  ProductFacets,
  ProductListItem,
  RouteSource,
  SurfaceType,
  TireBenchmarkResult,
  TireComparisonResponse,
} from '@michelin/contracts';
import { PRODUCTS_PAGE_SIZE as API_PRODUCTS_PAGE_SIZE } from '@michelin/contracts';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  productImageSrc,
  productName,
  productRange,
  productSize,
  productTags,
} from '@/features/products/services/product-presenter';
import { ElevationProfile } from '@/features/race-intelligence/components/elevation-profile';
import { RouteMap } from '@/features/race-intelligence/components/route-map';
import { StravaPicker } from '@/features/race-intelligence/components/strava-picker';
import type { GpxStats } from '@/features/race-intelligence/utils/gpx-parser';
import { parseGpx } from '@/features/race-intelligence/utils/gpx-parser';

import {
  compareTiresAction,
  searchComparatorProductsAction,
} from '../actions/comparator.actions';
import styles from './comparator-form.module.css';

interface ComparatorFormProps {
  initialFacets: ProductFacets;
  initialProducts: ProductListItem[];
  initialTotal: number;
}

interface RouteSelection {
  fileName: string;
  source: RouteSource;
  stats: GpxStats;
}

const SURFACE_OPTIONS: Array<{
  description: string;
  label: string;
  value: SurfaceType;
}> = [
  { description: 'Asphalte rapide', label: 'Route', value: 'road' },
  { description: 'Mixte roulant', label: 'Gravel', value: 'gravel' },
  { description: 'Terrain technique', label: 'VTT', value: 'mtb' },
];

const SURFACE_LABEL: Record<SurfaceType, string> = {
  road: 'Route',
  gravel: 'Gravel',
  mtb: 'VTT',
};

const SCORE_LABELS: Array<{
  key: keyof TireBenchmarkResult['scores'];
  label: string;
}> = [
  { key: 'routeFit', label: 'Parcours' },
  { key: 'rollingEfficiency', label: 'Rendement' },
  { key: 'grip', label: 'Grip' },
  { key: 'punctureProtection', label: 'Protection' },
  { key: 'durability', label: 'Durabilité' },
];

const GRADIENT_LABELS = [
  { key: 'flat' as const, label: 'Plat', color: '#cbd5e1', text: '#334155' },
  {
    key: 'rolling' as const,
    label: 'Vallonné',
    color: '#16a34a',
    text: '#fff',
  },
  {
    key: 'hilly' as const,
    label: 'Montagneux',
    color: '#ffd200',
    text: '#003189',
  },
  { key: 'steep' as const, label: 'Raide', color: '#f97316', text: '#fff' },
];

const CATALOG_PAGE_SIZE = 8;

function sourceLabel(source: RouteSource): string {
  if (source === 'strava') return 'Strava';
  if (source === 'gpx') return 'GPX';
  return 'Manuel';
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 1,
  }).format(value);
}

function scoreTone(score: number): 'high' | 'medium' | 'low' | 'critical' {
  if (score >= 85) return 'high';
  if (score >= 70) return 'medium';
  if (score >= 55) return 'low';
  return 'critical';
}

function scoreColors(score: number): { bar: string; text: string } {
  const tone = scoreTone(score);
  if (tone === 'high') return { bar: '#2e7d32', text: '#2e7d32' };
  if (tone === 'medium') return { bar: '#fce500', text: '#8a6500' };
  if (tone === 'low') return { bar: '#f59e0b', text: '#a14f00' };
  return { bar: '#b3261e', text: '#b3261e' };
}

function cleanSizeValue(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

function productMatchesTireSize(
  product: ProductListItem,
  tireDiameter: string,
  tireWidth: string,
): boolean {
  const diameter = tireDiameter.trim();
  const width = tireWidth.trim();

  if (diameter && cleanSizeValue(product.web_diameter) !== diameter) {
    return false;
  }

  if (width && cleanSizeValue(product.web_width) !== width) {
    return false;
  }

  return true;
}

function ProductOption({
  disabled,
  onToggle,
  product,
  recommended,
  selected,
}: {
  disabled: boolean;
  onToggle: (product: ProductListItem) => void;
  product: ProductListItem;
  recommended: boolean;
  selected: boolean;
}) {
  const name = productName(product);
  const range = productRange(product);
  const size = productSize(product);
  const tags = productTags(product);

  return (
    <button
      type="button"
      className={styles.productOption}
      data-recommended={recommended ? '' : undefined}
      data-selected={selected ? '' : undefined}
      disabled={disabled}
      onClick={() => onToggle(product)}
    >
      <span className={styles.productMedia} aria-hidden="true">
        <Image
          src={productImageSrc(product)}
          alt=""
          fill
          sizes="88px"
          className={styles.productImage}
        />
      </span>
      <span className={styles.productCopy}>
        <span className={styles.productName}>{name}</span>
        <span className={styles.productMeta}>
          {[range, size].filter(Boolean).join(' · ')}
        </span>
        {tags.length > 0 && (
          <span className={styles.productTags}>
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </span>
        )}
      </span>
      <span className={styles.productCheck}>
        {recommended ? 'Recommandé' : selected ? 'Retirer' : 'Ajouter'}
      </span>
    </button>
  );
}

function RouteStatsPanel({ route }: { route: RouteSelection }) {
  const stats = route.stats;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hoveredLatLon = useMemo<[number, number] | null>(() => {
    if (hoveredIdx === null) return null;

    const profilePoint = stats.profile[hoveredIdx];
    if (!profilePoint) return null;

    let closest = stats.points[0];
    let minDiff = Infinity;

    for (const point of stats.points) {
      const diff = Math.abs(point.distKm - profilePoint.distKm);
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    }

    return closest ? [closest.lat, closest.lon] : null;
  }, [hoveredIdx, stats.points, stats.profile]);

  return (
    <div className={styles.routeStats}>
      <div className={styles.routeMeta}>
        <div>
          <p className={styles.routeName}>{route.fileName}</p>
          <p className={styles.routeSource}>{sourceLabel(route.source)}</p>
        </div>
        <span>Trace analysée</span>
      </div>

      <div className={styles.routeMapPreview}>
        <RouteMap
          points={stats.points}
          highlightLatLon={hoveredLatLon}
          variant="michelin"
          colorMode="terrain"
        />
      </div>

      <div className={styles.routeMetrics}>
        <span>
          <strong>{formatNumber(stats.distanceKm)}</strong>
          km
          <em>Distance</em>
        </span>
        <span>
          <strong>{Math.round(stats.elevationGainM)}</strong>m
          <em>Dénivelé +</em>
        </span>
        <span>
          <strong>{stats.points.length}</strong>
          pts
          <em>Points GPS</em>
        </span>
      </div>

      <div className={styles.terrainProfile}>
        <p className={styles.sectionTitle}>Profil de terrain</p>
        <div className={styles.terrainBar} aria-label="Profil de terrain">
          {GRADIENT_LABELS.map(({ key, label, color, text }) => {
            const pct = stats.gradientStats[key];
            if (pct === 0) return null;

            return (
              <span
                key={key}
                style={{
                  backgroundColor: color,
                  color: text,
                  width: `${pct}%`,
                }}
                title={`${label} : ${pct}%`}
              >
                {pct >= 12 ? `${pct}%` : ''}
              </span>
            );
          })}
        </div>
        <div className={styles.terrainLegend}>
          {GRADIENT_LABELS.map(({ key, label, color }) => (
            <span key={key} className={styles.terrainLegendItem}>
              <i
                className={styles.terrainLegendDot}
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              {label}
              <strong>{stats.gradientStats[key]}%</strong>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.elevationPanel}>
        <p className={styles.sectionTitle}>Profil d&apos;élévation</p>
        <ElevationProfile
          profile={stats.profile}
          hoveredIdx={hoveredIdx}
          onHover={setHoveredIdx}
        />
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: TireComparisonResponse }) {
  const best = result.results[0];
  const hasEquivalenceNotes = result.results.some(
    (item) => item.equivalenceNote,
  );
  const technicalSlots = Math.max(
    1,
    ...result.results.map((item) => item.technicalDetails.length),
  );
  const advantageSlots = Math.max(
    1,
    ...result.results.map((item) => item.advantages.length),
  );
  const tradeoffSlots = Math.max(
    1,
    ...result.results.map((item) => item.tradeoffs.length),
  );

  return (
    <section className={styles.resultsPanel} aria-labelledby="benchmark-title">
      <div className={styles.resultsHeader}>
        <div>
          <p className={styles.panelKicker}>Benchmark</p>
          <h2 id="benchmark-title">Recommandation</h2>
        </div>
        <div className={styles.routeSummary}>
          {result.routeSummary.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      {best && (
        <div className={styles.bestCallout}>
          <span className={styles.bestScore}>{best.scores.overall}/100</span>
          <div>
            <p>
              {best.equivalenceNote
                ? 'Recommandation à départager'
                : 'Meilleur pneu recommandé'}
            </p>
            <h3>{best.product.name}</h3>
            <span>{best.verdict}</span>
            {best.equivalenceNote && <span>{best.equivalenceNote}</span>}
          </div>
        </div>
      )}

      <div className={styles.resultsSubhead}>
        <h3>Classement comparatif</h3>
        <p>Les pneus sont affichés du meilleur score au moins adapté.</p>
      </div>

      <div className={styles.benchmarkGrid} data-count={result.results.length}>
        {result.results.map((item) => {
          const isRecommended = item.product.id === result.recommendedProductId;

          return (
            <article
              key={item.product.id}
              className={styles.resultCard}
              data-recommended={isRecommended ? '' : undefined}
            >
              <div className={styles.resultTop}>
                <div className={styles.resultCopy}>
                  <p className={styles.resultRange}>
                    {item.product.range ?? item.product.cycleType ?? 'Michelin'}
                  </p>
                  <h3>{item.product.name}</h3>
                  <span>
                    {[item.product.size, item.product.sealing]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  <em
                    className={styles.recommendedBadge}
                    data-empty={!isRecommended ? '' : undefined}
                    aria-hidden={!isRecommended ? true : undefined}
                  >
                    Recommandé
                  </em>
                </div>
                <strong className={styles.resultScore}>
                  {item.scores.overall}/100
                </strong>
              </div>

              <div className={styles.scoreList}>
                {SCORE_LABELS.map(({ key, label }) => {
                  const score = item.scores[key];
                  const colors = scoreColors(score);
                  return (
                    <div
                      key={key}
                      className={styles.scoreRow}
                      data-tone={scoreTone(score)}
                    >
                      <span>{label}</span>
                      <div className={styles.scoreTrack}>
                        <i
                          style={{
                            backgroundColor: colors.bar,
                            width: `${score}%`,
                          }}
                        />
                      </div>
                      <strong style={{ color: colors.text }}>
                        {score}/100
                      </strong>
                    </div>
                  );
                })}
              </div>

              {hasEquivalenceNotes && (
                <p
                  className={styles.equivalenceNote}
                  data-empty={!item.equivalenceNote ? '' : undefined}
                  aria-hidden={!item.equivalenceNote ? true : undefined}
                >
                  {item.equivalenceNote ?? 'Performance distincte'}
                </p>
              )}

              <div className={styles.technicalDetails}>
                <p>Différences techniques</p>
                <ul>
                  {Array.from({ length: technicalSlots }).map((_, index) => {
                    const detail = item.technicalDetails[index];

                    return (
                      <li
                        key={detail ?? `technical-slot-${index}`}
                        data-empty={!detail ? '' : undefined}
                        aria-hidden={!detail ? true : undefined}
                      >
                        {detail ?? 'Slot vide'}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className={styles.prosCons}>
                <div>
                  <p>Avantages</p>
                  <ul>
                    {Array.from({ length: advantageSlots }).map((_, index) => {
                      const advantage = item.advantages[index];

                      return (
                        <li
                          key={advantage ?? `advantage-slot-${index}`}
                          data-empty={!advantage ? '' : undefined}
                          aria-hidden={!advantage ? true : undefined}
                        >
                          <span className={styles.proMarker} aria-hidden="true">
                            +
                          </span>
                          <span>{advantage ?? 'Slot vide'}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <p>Compromis</p>
                  <ul>
                    {Array.from({ length: tradeoffSlots }).map((_, index) => {
                      const tradeoff = item.tradeoffs[index];

                      return (
                        <li
                          key={tradeoff ?? `tradeoff-slot-${index}`}
                          data-empty={!tradeoff ? '' : undefined}
                          aria-hidden={!tradeoff ? true : undefined}
                        >
                          <span className={styles.conMarker} aria-hidden="true">
                            -
                          </span>
                          <span>{tradeoff ?? 'Slot vide'}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ComparatorForm({
  initialFacets,
  initialProducts,
  initialTotal,
}: ComparatorFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [surface, setSurface] = useState<SurfaceType>('road');
  const [route, setRoute] = useState<RouteSelection | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tireDiameter, setTireDiameter] = useState('');
  const [tireWidth, setTireWidth] = useState('');
  const [products, setProducts] = useState(initialProducts);
  const [productTotal, setProductTotal] = useState(initialTotal);
  const [productPage, setProductPage] = useState(1);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProductListItem[]>([]);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [result, setResult] = useState<TireComparisonResponse | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [isComparing, startCompareTransition] = useTransition();

  useEffect(() => {
    const apiPage =
      Math.floor(
        ((productPage - 1) * CATALOG_PAGE_SIZE) / API_PRODUCTS_PAGE_SIZE,
      ) + 1;

    const handle = setTimeout(() => {
      startSearchTransition(async () => {
        const response = await searchComparatorProductsAction(
          search,
          surface,
          apiPage,
          {
            diameter: tireDiameter,
            width: tireWidth,
          },
        );
        setProducts(response.items);
        setProductTotal(response.total);
        setSearchError(response.error);
      });
    }, 300);

    return () => clearTimeout(handle);
  }, [search, surface, productPage, tireDiameter, tireWidth]);

  const selectedIds = useMemo(
    () => new Set(selected.map((product) => product.id)),
    [selected],
  );
  const productPageCount = Math.max(
    1,
    Math.ceil(productTotal / CATALOG_PAGE_SIZE),
  );
  const productOffset =
    ((productPage - 1) * CATALOG_PAGE_SIZE) % API_PRODUCTS_PAGE_SIZE;
  const visibleProducts = products.slice(
    productOffset,
    productOffset + CATALOG_PAGE_SIZE,
  );
  const hasTireSizeFilter = tireDiameter !== '' || tireWidth !== '';
  const productCountIsPlural = productTotal !== 1;

  function applyTireSize(nextDiameter: string, nextWidth: string) {
    setTireDiameter(nextDiameter);
    setTireWidth(nextWidth);
    setProductPage(1);
    setResult(null);
    setCompareError(null);
    setSelected((current) => {
      const next = current.filter((product) =>
        productMatchesTireSize(product, nextDiameter, nextWidth),
      );

      return next.length === current.length ? current : next;
    });
  }

  function updateTireDiameter(value: string) {
    applyTireSize(value, tireWidth);
  }

  function updateTireWidth(value: string) {
    applyTireSize(tireDiameter, value);
  }

  function resetTireSize() {
    applyTireSize('', '');
  }

  function applyRoute(nextRoute: RouteSelection, nextSurface?: SurfaceType) {
    setRoute(nextRoute);
    setRouteError(null);
    setResult(null);
    if (nextSurface) {
      setSurface(nextSurface);
      setProductPage(1);
    }
  }

  function handleGpx(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? '');
      const stats = parseGpx(content);

      if (!stats) {
        setRouteError('Fichier GPX illisible ou trace trop courte.');
        return;
      }

      applyRoute({ fileName: file.name, source: 'gpx', stats });
    };
    reader.readAsText(file);
  }

  function toggleProduct(product: ProductListItem) {
    setCompareError(null);
    setResult(null);
    setSelected((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current.filter((item) => item.id !== product.id);
      }
      if (current.length >= 3) return current;
      return [...current, product];
    });
  }

  function runBenchmark() {
    if (!route) {
      setCompareError('Importez un itinéraire GPX ou Strava.');
      return;
    }

    if (selected.length < 2) {
      setCompareError('Sélectionnez au moins 2 pneus.');
      return;
    }

    setCompareError(null);
    startCompareTransition(async () => {
      const response = await compareTiresAction({
        route: {
          source: route.source,
          surface,
          distanceKm: route.stats.distanceKm,
          elevationGainM: route.stats.elevationGainM,
          gradientStats: route.stats.gradientStats,
          pointCount: route.stats.points.length,
        },
        selectedProductIds: selected.map((product) => product.id),
      });
      setResult(response.data);
      setCompareError(response.error);
    });
  }

  const canCompare = !!route && selected.length >= 2 && selected.length <= 3;
  const recommendedProductId = result?.recommendedProductId ?? null;

  return (
    <div className={styles.shell}>
      <section className={styles.panel} aria-labelledby="route-title">
        <div className={styles.panelHeader}>
          <p className={styles.panelKicker}>01</p>
          <h2 id="route-title">Itinéraire</h2>
        </div>

        <div className={styles.surfaceSwitch} aria-label="Surface du parcours">
          {SURFACE_OPTIONS.map((option, index) => (
            <button
              key={option.value}
              type="button"
              data-active={surface === option.value ? '' : undefined}
              onClick={() => {
                setSurface(option.value);
                setProductPage(1);
              }}
            >
              <span className={styles.surfaceIndex}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={styles.surfaceLabel}>{option.label}</span>
              <span className={styles.surfaceDescription}>
                {option.description}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.importGrid}>
          <div className={styles.importBox}>
            <p>Strava</p>
            <StravaPicker
              onActivitySelected={(stats, nextSurface) =>
                applyRoute(
                  {
                    fileName: 'Itinéraire Strava chargé',
                    source: 'strava',
                    stats,
                  },
                  nextSurface,
                )
              }
            />
          </div>

          <button
            type="button"
            className={styles.gpxDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".gpx"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleGpx(file);
              }}
            />
            <span>GPX</span>
            <strong>Importer une trace</strong>
          </button>
        </div>

        {routeError && <p className={styles.error}>{routeError}</p>}
        {route && <RouteStatsPanel route={route} />}
      </section>

      <section className={styles.panel} aria-labelledby="tires-title">
        <div className={styles.panelHeader}>
          <p className={styles.panelKicker}>02</p>
          <h2 id="tires-title">Pneus</h2>
          <span className={styles.selectionCount}>{selected.length}/3</span>
        </div>

        <div className={styles.tireSizePanel}>
          <div className={styles.tireSizeHeader}>
            <div>
              <p>Taille du pneu</p>
              <span>Filtrage exact sur la dimension de votre vélo.</span>
            </div>
            {hasTireSizeFilter && (
              <button type="button" onClick={resetTireSize}>
                Réinitialiser
              </button>
            )}
          </div>

          <div className={styles.tireSizeGrid}>
            <label htmlFor="comparator-diameter">
              <span>Diamètre</span>
              <select
                id="comparator-diameter"
                value={tireDiameter}
                onChange={(event) => updateTireDiameter(event.target.value)}
              >
                <option value="">Tous</option>
                {initialFacets.diameter.map((diameter) => (
                  <option key={diameter} value={diameter}>
                    {diameter}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="comparator-width">
              <span>Largeur</span>
              <select
                id="comparator-width"
                value={tireWidth}
                onChange={(event) => updateTireWidth(event.target.value)}
              >
                <option value="">Toutes</option>
                {initialFacets.width.map((width) => (
                  <option key={width} value={width}>
                    {width}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <label className={styles.searchField} htmlFor="comparator-search">
          <span>Recherche catalogue</span>
          <input
            id="comparator-search"
            type="search"
            value={search}
            placeholder="Power, Wild, Endurance…"
            onChange={(event) => {
              setSearch(event.target.value);
              setProductPage(1);
            }}
          />
        </label>

        {selected.length > 0 && (
          <div className={styles.selectedStrip} aria-label="Pneus sélectionnés">
            {selected.map((product) => (
              <button
                key={product.id}
                type="button"
                data-recommended={
                  recommendedProductId === product.id ? '' : undefined
                }
                onClick={() => toggleProduct(product)}
              >
                {productName(product)}
                {recommendedProductId === product.id ? ' · Recommandé' : ''}
              </button>
            ))}
          </div>
        )}

        {searchError && <p className={styles.error}>{searchError}</p>}

        <div className={styles.catalogMeta}>
          <span>
            {productTotal} pneu{productCountIsPlural ? 's' : ''}
            {hasTireSizeFilter
              ? ` compatible${productCountIsPlural ? 's' : ''}`
              : ''}{' '}
            · page {productPage}/{productPageCount}
          </span>
        </div>

        <div
          className={styles.productList}
          data-loading={isSearching ? '' : undefined}
        >
          {visibleProducts.map((product) => {
            const isSelected = selectedIds.has(product.id);
            return (
              <ProductOption
                key={product.id}
                product={product}
                selected={isSelected}
                recommended={recommendedProductId === product.id}
                disabled={!isSelected && selected.length >= 3}
                onToggle={toggleProduct}
              />
            );
          })}
          {visibleProducts.length === 0 && (
            <p className={styles.empty}>
              Aucun pneu trouvé pour cette recherche.
            </p>
          )}
        </div>

        <div className={styles.catalogPagination}>
          <button
            type="button"
            onClick={() => setProductPage((page) => Math.max(1, page - 1))}
            disabled={productPage <= 1 || isSearching}
          >
            Précédent
          </button>
          <span>
            {productPage}/{productPageCount}
          </span>
          <button
            type="button"
            onClick={() =>
              setProductPage((page) => Math.min(productPageCount, page + 1))
            }
            disabled={productPage >= productPageCount || isSearching}
          >
            Suivant
          </button>
        </div>
      </section>

      <section className={styles.actionPanel} aria-label="Lancer le benchmark">
        <div>
          <p>
            {route
              ? `${SURFACE_LABEL[surface]} · ${formatNumber(route.stats.distanceKm)} km`
              : 'Aucun itinéraire'}
          </p>
          <strong>
            {selected.length >= 2
              ? `${selected.length} pneus prêts à comparer`
              : 'Sélection minimale : 2 pneus'}
          </strong>
        </div>
        <Button onClick={runBenchmark} disabled={!canCompare || isComparing}>
          {isComparing ? 'Benchmark en cours…' : 'Comparer les pneus'}
        </Button>
      </section>

      {compareError && <p className={styles.error}>{compareError}</p>}
      {result && <ResultPanel result={result} />}
    </div>
  );
}
