import type { Challenge } from '@michelin/contracts';

import { formatDate } from '../utils/format';
import styles from './challenge-details.module.css';

interface ChallengeDetailsProps {
  challenge: Challenge;
}

export function ChallengeDetails({ challenge }: ChallengeDetailsProps) {
  return (
    <div className={styles.grid}>
      <article className={styles.segmentCard}>
        <p className={styles.eyebrow}>Segment Strava</p>
        <h2 className={styles.cardTitle}>
          {challenge.location ?? 'Segment du challenge'}
        </h2>

        <dl className={styles.stats}>
          {challenge.distance_km != null && (
            <div className={styles.stat}>
              <dt>Distance</dt>
              <dd>{challenge.distance_km} km</dd>
            </div>
          )}
          {challenge.elevation_m != null && (
            <div className={styles.stat}>
              <dt>Dénivelé</dt>
              <dd>{challenge.elevation_m} m</dd>
            </div>
          )}
          <div className={styles.stat}>
            <dt>Clôture</dt>
            <dd>{formatDate(challenge.ends_at)}</dd>
          </div>
        </dl>

        <a
          className={styles.stravaButton}
          href={challenge.strava_segment_url}
          target="_blank"
          rel="noreferrer noopener"
        >
          Voir le segment sur Strava
          <span aria-hidden="true">↗</span>
        </a>
      </article>

      <article className={styles.prizeCard}>
        <p className={styles.eyebrow}>À gagner</p>
        <p className={styles.prizeLabel}>{challenge.prize_label}</p>
        {challenge.prize_description && (
          <p className={styles.prizeDescription}>
            {challenge.prize_description}
          </p>
        )}
        <p className={styles.prizeFootnote}>
          Pour le ou la plus rapide sur le segment à la clôture.
        </p>
      </article>
    </div>
  );
}
