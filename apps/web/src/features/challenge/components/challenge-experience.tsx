'use client';

import type { Challenge } from '@michelin/contracts';
import Image from 'next/image';
import Link from 'next/link';
import { useId, useState } from 'react';

import roueRoadImage from '../../../../public/roue/roue-road2.webp';
import { formatDate } from '../utils/format';
import { ChallengeLeaderboard } from './challenge-leaderboard';
import { ChallengeSteps } from './challenge-steps';
import { StravaSegmentEmbed } from './strava-segment-embed';
import { TourDeFranceChallenges } from './tour-de-france-challenges';
import styles from './challenge-experience.module.css';

interface ChallengeExperienceProps {
  challenge: Challenge | null;
}

type ChallengeTab = 'segment' | 'tour';

function formatMetric(value: number | null | undefined): string {
  if (value == null) return 'Non renseigné';
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function ChallengeExperience({ challenge }: ChallengeExperienceProps) {
  const [activeTab, setActiveTab] = useState<ChallengeTab>('segment');
  const baseId = useId();
  const segmentTabId = `${baseId}-segment-tab`;
  const tourTabId = `${baseId}-tour-tab`;
  const segmentPanelId = `${baseId}-segment-panel`;
  const tourPanelId = `${baseId}-tour-panel`;

  return (
    <section className={styles.experience} aria-labelledby="challenge-tabs">
      <div className={styles.switchHeader}>
        <div>
          <p className={styles.kicker}>Challenges Michelin</p>
          <h2 id="challenge-tabs">Choisir son terrain de jeu.</h2>
          <p>
            Le segment du mois reste le défi principal. Les étapes du Tour de
            France sont disponibles comme challenges spéciaux, avec trace et
            recommandation pneu.
          </p>
        </div>

        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Type de challenge"
        >
          <button
            id={segmentTabId}
            type="button"
            role="tab"
            aria-selected={activeTab === 'segment'}
            aria-controls={segmentPanelId}
            data-active={activeTab === 'segment' ? '' : undefined}
            onClick={() => setActiveTab('segment')}
          >
            Segment du mois
          </button>
          <button
            id={tourTabId}
            type="button"
            role="tab"
            aria-selected={activeTab === 'tour'}
            aria-controls={tourPanelId}
            data-active={activeTab === 'tour' ? '' : undefined}
            onClick={() => setActiveTab('tour')}
          >
            Tour de France
          </button>
        </div>
      </div>

      <div
        id={segmentPanelId}
        role="tabpanel"
        aria-labelledby={segmentTabId}
        hidden={activeTab !== 'segment'}
      >
        <MichelinPowerSegment challenge={challenge} />
      </div>

      <div
        id={tourPanelId}
        role="tabpanel"
        aria-labelledby={tourTabId}
        hidden={activeTab !== 'tour'}
      >
        <TourDeFranceChallenges />
      </div>
    </section>
  );
}

function MichelinPowerSegment({ challenge }: ChallengeExperienceProps) {
  if (!challenge) {
    return (
      <article className={styles.emptyPanel}>
        <p className={styles.kicker}>Segment du mois</p>
        <h3>Aucun segment Michelin Power n’est ouvert pour le moment.</h3>
        <p>
          Les challenges Tour de France restent disponibles pour préparer un
          effort long format avec trace GPX, profil et conseil pneumatique.
        </p>
      </article>
    );
  }

  return (
    <section className={styles.segmentSection} aria-labelledby="segment-title">
      <div className={styles.segmentHeading}>
        <p className={styles.kicker}>Michelin Power</p>
        <h2 id="segment-title">
          Le segment du mois
          <span className={styles.inlineImage} aria-hidden="true" />
          en mode terrain réel.
        </h2>
        {challenge.description && <p>{challenge.description}</p>}
      </div>

      <div className={styles.segmentGrid}>
        <article className={styles.routeCard}>
          <div className={styles.cardHeader}>
            <div>
              <p>Segment Strava</p>
              <h3>{challenge.name}</h3>
            </div>
            <span>{challenge.location ?? 'Segment officiel'}</span>
          </div>

          <div className={styles.embedFrame}>
            <StravaSegmentEmbed segmentId={challenge.strava_segment_id} />
          </div>

          <div className={styles.metricsGrid}>
            <span>
              <strong>{formatMetric(challenge.distance_km)}</strong>
              km
              <em>Distance</em>
            </span>
            <span>
              <strong>{formatMetric(challenge.elevation_m)}</strong>m
              <em>Dénivelé</em>
            </span>
            <span>
              <strong>{formatDate(challenge.ends_at)}</strong>
              <em>Clôture</em>
            </span>
          </div>
        </article>

        <aside className={styles.prizeCard}>
          <div className={styles.tireVisual}>
            <Image
              src={roueRoadImage}
              alt=""
              fill
              sizes="(max-width: 900px) 80vw, 320px"
              className={styles.tireImage}
            />
          </div>
          <div className={styles.prizeCopy}>
            <p>À gagner</p>
            <h3>{challenge.prize_label}</h3>
            {challenge.prize_description && (
              <span>{challenge.prize_description}</span>
            )}
          </div>
          <div className={styles.tireScore}>
            <strong>Power Cup</strong>
            <span>Pneu recommandé</span>
          </div>
          <p className={styles.prizeReason}>
            Le format segment court privilégie le rendement, la relance et un
            grip précis. La gamme Power Cup colle au défi: aller chercher le
            meilleur temps sans perdre de vitesse dans les transitions.
          </p>
          <div className={styles.cardActions}>
            <a
              className={styles.primaryAction}
              href={challenge.strava_segment_url}
              target="_blank"
              rel="noreferrer noopener"
            >
              Ouvrir le segment Strava
            </a>
            <Link
              className={styles.secondaryAction}
              href={{
                pathname: '/products',
                query: { productType: 'TYRE', q: 'Power Cup' },
              }}
            >
              Voir le pneu recommandé
            </Link>
          </div>
        </aside>

        <article className={styles.stepsCard}>
          <div className={styles.cardTitleRow}>
            <p className={styles.kicker}>Participation</p>
            <h3>Rouler, valider, classer.</h3>
          </div>
          <ChallengeSteps prizeLabel={challenge.prize_label} />
        </article>

        <article className={styles.leaderboardCard}>
          <div className={styles.cardTitleRow}>
            <p className={styles.kicker}>Classement</p>
            <h3>La référence du mois.</h3>
          </div>
          <ChallengeLeaderboard
            entries={challenge.entries}
            prizeLabel={challenge.prize_label}
          />
        </article>
      </div>
    </section>
  );
}
