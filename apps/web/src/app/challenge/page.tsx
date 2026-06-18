import type { Metadata } from 'next';
import Image from 'next/image';

import { ChallengeDetails } from '@/features/challenge/components/challenge-details';
import { ChallengeLeaderboard } from '@/features/challenge/components/challenge-leaderboard';
import { ChallengeSteps } from '@/features/challenge/components/challenge-steps';
import { StravaSegmentEmbed } from '@/features/challenge/components/strava-segment-embed';
import { fetchChallenges } from '@/features/challenge/services/challenges.api';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Challenge — Michelin Vélo',
  description:
    'Battez le segment Strava du challenge Michelin : le ou la plus rapide ' +
    'remporte 2 pneus MICHELIN.',
};

export default async function ChallengePage() {
  const challenges = await fetchChallenges();
  const challenge = challenges[0] ?? null;

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <Image
          alt="Cycliste à pleine vitesse sur route"
          className={styles.heroImage}
          height={720}
          priority
          sizes="100vw"
          src="/michelin-race-hero.jpg"
          width={1400}
        />
        <div className={styles.heroOverlay} />

        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Challenge Michelin</p>
          <h1 className={styles.title} id="challenge-title">
            {challenge?.name ?? 'Le challenge du segment'}
          </h1>
          {challenge?.description && (
            <p className={styles.lede}>{challenge.description}</p>
          )}
        </div>
      </header>

      {challenge ? (
        <div className={styles.content}>
          <section aria-label="Segment et lot">
            <ChallengeDetails challenge={challenge} />
          </section>

          <section
            className={styles.embedSection}
            aria-label="Aperçu du segment Strava"
          >
            <StravaSegmentEmbed segmentId={challenge.strava_segment_id} />
          </section>

          <section aria-labelledby="how-title">
            <h2 className={styles.sectionTitle} id="how-title">
              Comment participer
            </h2>
            <ChallengeSteps prizeLabel={challenge.prize_label} />
          </section>

          <section
            className={styles.leaderboardSection}
            aria-labelledby="leaderboard-title"
          >
            <h2 className={styles.sectionTitle} id="leaderboard-title">
              Classement
            </h2>
            <ChallengeLeaderboard
              entries={challenge.entries}
              prizeLabel={challenge.prize_label}
            />
          </section>
        </div>
      ) : (
        <div className={styles.content}>
          <p className={styles.empty}>
            Aucun challenge en cours pour le moment. Revenez bientôt&nbsp;!
          </p>
        </div>
      )}
    </main>
  );
}
