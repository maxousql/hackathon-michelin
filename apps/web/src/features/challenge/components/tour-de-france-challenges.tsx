'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image, { type StaticImageData } from 'next/image';
import { useMemo, useRef, useState } from 'react';

import roueRoadImage from '../../../../public/roue/roue-road1.webp';
import roueRoadAltImage from '../../../../public/roue/roue-road2.webp';
import { ElevationProfile } from '@/features/race-intelligence/components/elevation-profile';
import { RouteMap } from '@/features/race-intelligence/components/route-map';
import type { GpxPoint } from '@/features/race-intelligence/utils/gpx-parser';

import {
  TOUR_DE_FRANCE_SOURCE_URL,
  TOUR_DE_FRANCE_STAGES,
  TOUR_DE_FRANCE_TOTALS,
  type TourDeFranceStage,
  type TourDeFranceStageCategory,
} from '../data/tour-de-france-stages';
import { formatDate } from '../utils/format';
import styles from './tour-de-france-challenges.module.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface TireRecommendation {
  name: string;
  line: string;
  image: StaticImageData;
  fit: string;
  score: number;
  href: string;
  highlights: string[];
}

type TireRecommendationKey = 'allSeason' | 'cup' | 'endurance';

const TIRE_RECOMMENDATIONS: Record<TireRecommendationKey, TireRecommendation> =
  {
    allSeason: {
      fit: 'Confiance sur chaussées changeantes',
      highlights: ['Grip mouillé', 'Protection renforcée', 'Régularité'],
      href: '/products?productType=TYRE&q=Power%20All%20Season',
      image: roueRoadImage,
      line: 'Power',
      name: 'MICHELIN Power All Season',
      score: 88,
    },
    cup: {
      fit: 'Rendement maximal sur route rapide',
      highlights: ['Faible résistance', 'Grip compétition', 'Réponse vive'],
      href: '/products?productType=TYRE&q=Power%20Cup',
      image: roueRoadAltImage,
      line: 'Power',
      name: 'MICHELIN Power Cup',
      score: 94,
    },
    endurance: {
      fit: 'Fiabilité pour les longues journées',
      highlights: [
        'Durabilité',
        'Protection anti-crevaison',
        'Confort longue distance',
      ],
      href: '/products?productType=TYRE&q=Power%20Endurance',
      image: roueRoadImage,
      line: 'Power',
      name: 'MICHELIN Power Endurance',
      score: 91,
    },
  };

const CATEGORY_COPY: Record<TourDeFranceStageCategory, string> = {
  flat: 'Étape roulante, relances rapides et priorité au rendement. Le pneu doit garder de la vitesse sans rendre la fin d’étape nerveuse.',
  hilly:
    'Terrain irrégulier, changements de rythme et routes secondaires. Le pneu doit conserver du grip quand la fatigue commence à brouiller les trajectoires.',
  mountain:
    'Journée de grimpe et de descente. Le meilleur compromis cherche la tenue, la protection et une carcasse qui encaisse les longues ascensions.',
  'individual-time-trial':
    'Effort court, trajectoire propre et vitesse constante. Chaque watt compte, la priorité va au rendement pur.',
  'team-time-trial':
    'Effort collectif très rapide. La monte idéale doit rester vive, stable et lisible dans les relais.',
};

const MARQUEE_ITEMS = [
  'Barcelone',
  'Pyrénées',
  'Massif central',
  'Vosges',
  'Alpes',
  'Alpe d’Huez',
  'Champs-Élysées',
];

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

function stagePoints(stage: TourDeFranceStage): GpxPoint[] {
  return stage.points.map(([lat, lon, ele, distKm]) => ({
    distKm,
    ele,
    lat,
    lon,
  }));
}

function tireForStage(stage: TourDeFranceStage): TireRecommendation {
  if (
    stage.category === 'individual-time-trial' ||
    stage.category === 'team-time-trial' ||
    stage.distanceKm < 60
  ) {
    return TIRE_RECOMMENDATIONS.cup;
  }

  if (stage.category === 'mountain' || stage.distanceKm >= 190) {
    return TIRE_RECOMMENDATIONS.endurance;
  }

  if (stage.category === 'hilly') return TIRE_RECOMMENDATIONS.allSeason;

  return TIRE_RECOMMENDATIONS.cup;
}

function recommendationReason(
  stage: TourDeFranceStage,
  tire: TireRecommendation,
): string {
  if (tire === TIRE_RECOMMENDATIONS.endurance) {
    return `Sur ${stage.distanceKm} km et ${formatNumber(stage.elevationGainM)} m de dénivelé positif, la priorité est de finir vite sans sacrifier la protection.`;
  }

  if (tire === TIRE_RECOMMENDATIONS.allSeason) {
    return `Le profil vallonné demande un grip constant et une carcasse rassurante quand le revêtement change plusieurs fois dans la journée.`;
  }

  return `Le format ${stage.categoryLabel.toLowerCase()} favorise le rendement et une direction très précise sur route rapide.`;
}

export function TourDeFranceChallenges() {
  const rootRef = useRef<HTMLElement>(null);
  const [selectedStageId, setSelectedStageId] = useState(
    TOUR_DE_FRANCE_STAGES[19]?.id ?? TOUR_DE_FRANCE_STAGES[0]!.id,
  );
  const [hoveredProfileIdx, setHoveredProfileIdx] = useState<number | null>(
    null,
  );

  const selectedStage =
    TOUR_DE_FRANCE_STAGES.find((stage) => stage.id === selectedStageId) ??
    TOUR_DE_FRANCE_STAGES[0]!;
  const selectedPoints = useMemo(
    () => stagePoints(selectedStage),
    [selectedStage],
  );
  const tire = tireForStage(selectedStage);

  const highlightedLatLon = useMemo<[number, number] | null>(() => {
    if (hoveredProfileIdx === null) return null;

    const profilePoint = selectedStage.profile[hoveredProfileIdx];
    if (!profilePoint) return null;

    let closest = selectedPoints[0];
    let minDiff = Infinity;

    for (const point of selectedPoints) {
      const diff = Math.abs(point.distKm - profilePoint.distKm);
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    }

    return closest ? [closest.lat, closest.lon] : null;
  }, [hoveredProfileIdx, selectedPoints, selectedStage.profile]);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const scaleTargets = gsap.utils.toArray<HTMLElement>(
        `.${styles.motionScale}`,
      );
      scaleTargets.forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0.38, scale: 0.88, y: 46 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              end: 'top 36%',
              scrub: true,
              start: 'top 88%',
              trigger: element,
            },
          },
        );
      });

      const stackCards = gsap.utils.toArray<HTMLElement>(
        `.${styles.stackCard}`,
      );
      stackCards.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            opacity: index === 0 ? 0.95 : 0.7,
            scale: 0.94,
            y: 54 + index * 16,
          },
          {
            opacity: 1,
            scale: 1,
            y: index * -8,
            ease: 'none',
            scrollTrigger: {
              end: 'top 34%',
              scrub: true,
              start: 'top 88%',
              trigger: card,
            },
          },
        );
      });

      gsap.to(`.${styles.marqueeTrack}`, {
        duration: 24,
        ease: 'none',
        repeat: -1,
        xPercent: -50,
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className={styles.section}
      id="tour-de-france"
      aria-labelledby="tour-de-france-title"
    >
      <div className={styles.heading}>
        <p className={styles.kicker}>Challenges spéciaux Tour de France</p>
        <h2 id="tour-de-france-title">
          21 étapes, un itinéraire
          <span className={styles.inlineImage} aria-hidden="true" />à choisir
          avant les pneus.
        </h2>
        <p>
          Les traces GPX du Tour de France 2026 ont été récupérées depuis
          VisuGPX, découpées par étape puis compactées pour afficher la carte,
          le profil et les signaux utiles sans alourdir la page.
        </p>
      </div>

      <div className={styles.bentoGrid} aria-label="Résumé Tour de France">
        <article className={`${styles.bentoCard} ${styles.bentoLarge}`}>
          <span className={styles.bentoMedia} aria-hidden="true" />
          <div>
            <p>Parcours complet</p>
            <h3>{formatNumber(TOUR_DE_FRANCE_TOTALS.distanceKm)} km</h3>
            <span>
              {formatNumber(TOUR_DE_FRANCE_TOTALS.elevationGainM)} m de dénivelé
              positif après lissage de la trace.
            </span>
          </div>
        </article>
        <article className={styles.bentoCard}>
          <p>Étapes</p>
          <h3>{TOUR_DE_FRANCE_TOTALS.stageCount}</h3>
          <span>Chronos, plaines, vallons et hautes journées alpines.</span>
        </article>
        <article className={styles.bentoCard}>
          <p>Précision GPX</p>
          <h3>{formatNumber(TOUR_DE_FRANCE_TOTALS.sourcePointCount)}</h3>
          <span>Points source analysés, puis simplifiés pour la carte.</span>
        </article>
        <article className={`${styles.bentoCard} ${styles.bentoWide}`}>
          <p>Conseil pneu</p>
          <h3>Route Michelin</h3>
          <span>
            Chaque étape reçoit une recommandation selon longueur, relief et
            type d’effort.
          </span>
        </article>
      </div>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <div className={styles.workspace}>
        <aside className={styles.selectorPanel} aria-label="Étapes du Tour">
          <div className={styles.selectorHeader}>
            <h3>Choisir une étape</h3>
            <span>{selectedStage.categoryLabel}</span>
          </div>
          <div className={styles.stageAccordion}>
            {TOUR_DE_FRANCE_STAGES.map((stage) => (
              <button
                key={stage.id}
                type="button"
                className={styles.stageButton}
                data-active={stage.id === selectedStage.id ? '' : undefined}
                onClick={() => {
                  setSelectedStageId(stage.id);
                  setHoveredProfileIdx(null);
                }}
              >
                <span>{String(stage.number).padStart(2, '0')}</span>
                <strong>{stage.route}</strong>
                <em>
                  {stage.distanceKm} km · {formatNumber(stage.elevationGainM)} m
                </em>
              </button>
            ))}
          </div>
        </aside>

        <div className={styles.stageLayout}>
          <article className={`${styles.routePanel} ${styles.motionScale}`}>
            <div className={styles.stageHeader}>
              <div>
                <p>{formatDate(selectedStage.date)}</p>
                <h3>
                  {selectedStage.name} · {selectedStage.route}
                </h3>
              </div>
              <span>{selectedStage.categoryLabel}</span>
            </div>

            <div className={styles.mapFrame}>
              <RouteMap
                points={selectedPoints}
                highlightLatLon={highlightedLatLon}
                variant="michelin"
                colorMode="terrain"
              />
            </div>

            <div className={styles.metricsGrid}>
              <span>
                <strong>{selectedStage.distanceKm}</strong>
                km
                <em>Distance</em>
              </span>
              <span>
                <strong>{formatNumber(selectedStage.elevationGainM)}</strong>m
                <em>Dénivelé positif</em>
              </span>
              <span>
                <strong>{formatNumber(selectedStage.sourcePointCount)}</strong>
                pts
                <em>Trace GPX</em>
              </span>
            </div>

            <div className={styles.profileBlock}>
              <div>
                <h4>Profil d’élévation</h4>
                <p>{CATEGORY_COPY[selectedStage.category]}</p>
              </div>
              <ElevationProfile
                profile={selectedStage.profile}
                hoveredIdx={hoveredProfileIdx}
                onHover={setHoveredProfileIdx}
              />
            </div>
          </article>

          <aside className={`${styles.tirePanel} ${styles.motionScale}`}>
            <div className={styles.tireVisual}>
              <Image
                src={tire.image}
                alt=""
                fill
                sizes="(max-width: 900px) 80vw, 320px"
                className={styles.tireImage}
              />
            </div>
            <div className={styles.tireCopy}>
              <p>{tire.line}</p>
              <h3>{tire.name}</h3>
              <span>{tire.fit}</span>
            </div>
            <div className={styles.tireScore}>
              <strong>{tire.score}/100</strong>
              <span>Fit étape</span>
            </div>
            <p className={styles.tireReason}>
              {recommendationReason(selectedStage, tire)}
            </p>
            <ul className={styles.highlightList}>
              {tire.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <a className={styles.primaryAction} href={tire.href}>
              Voir les pneus compatibles
            </a>
          </aside>
        </div>
      </div>

      <div className={styles.stackGrid} aria-label="Lecture de l’épreuve">
        <article className={`${styles.stackCard} ${styles.stackDark}`}>
          <span>Lecture terrain</span>
          <h3>La carte sert à comprendre l’étape avant de parler produit.</h3>
          <p>
            Relief, densité de points et profil sont visibles au même endroit
            pour éviter une recommandation trop générique.
          </p>
        </article>
        <article className={styles.stackCard}>
          <span>Usage réel</span>
          <h3>
            Le même pneu ne raconte pas la même histoire sur 19 ou 178 km.
          </h3>
          <p>
            Un chrono demande du rendement pur. Une journée alpine demande plus
            de tolérance, de protection et de constance.
          </p>
        </article>
        <article className={styles.stackCard}>
          <span>Source GPX</span>
          <h3>Les traces sont récupérables automatiquement depuis VisuGPX.</h3>
          <p>
            La source renvoie un GPX multi-traces complet. Pour la production,
            on pourra automatiser un refresh ou stocker les traces dans un
            bucket maîtrisé.
          </p>
        </article>
      </div>

      <div className={styles.actionBand}>
        <div>
          <h3>Préparer une étape comme un challenge personnel.</h3>
          <p>
            Sélectionnez l’étape, vérifiez le profil, puis ouvrez la gamme pour
            confirmer la dimension et le montage adaptés à votre vélo.
          </p>
        </div>
        <div className={styles.actionLinks}>
          <a className={styles.primaryAction} href="#tour-de-france">
            Explorer les étapes
          </a>
          <a
            className={styles.secondaryAction}
            href={TOUR_DE_FRANCE_SOURCE_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            Voir la source GPX
          </a>
        </div>
      </div>
    </section>
  );
}
