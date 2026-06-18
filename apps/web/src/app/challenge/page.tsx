import type { Metadata } from 'next';
import Image from 'next/image';

import { ChallengeExperience } from '@/features/challenge/components/challenge-experience';
import { fetchChallenges } from '@/features/challenge/services/challenges.api';

import '@/features/race-intelligence/race-intelligence.css';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Challenge — Michelin Vélo',
  description:
    'Battez le segment Strava du challenge Michelin et préparez les étapes ' +
    'spéciales Tour de France avec trace GPX, profil et conseil pneu.',
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

      <div className={styles.content}>
        <ChallengeExperience challenge={challenge} />
      </div>
    </main>
  );
}
