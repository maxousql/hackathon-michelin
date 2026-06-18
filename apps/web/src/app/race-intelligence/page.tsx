import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { RaceForm } from '@/features/race-intelligence/components/race-form';

import '@/features/race-intelligence/race-intelligence.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  description:
    'Analysez votre course et obtenez la recommandation de pneu Michelin parfaite selon le terrain, la météo et votre profil rider.',
  title: 'Race Intelligence — Michelin Vélo',
};

export default async function RaceIntelligencePage() {
  const cookieStore = await cookies();
  const isLoggedIn =
    !!cookieStore.get('auth_token')?.value ||
    !!cookieStore.get('strava_at')?.value;

  return (
    <main className="ri-page">
      <header className="ri-hero">
        <div className="ri-container">
          <p className="ri-hero-eyebrow">
            <span className="ri-hero-eyebrow-dot" />
            Race Intelligence
          </p>
          <h1>
            Le bon pneu,
            <br />
            <em>pour chaque course.</em>
          </h1>
          <p className="ri-hero-sub">
            Décrivez votre parcours ou importez un GPX — notre algorithme
            analyse le terrain, les conditions météo et votre profil pour vous
            recommander le pneu Michelin exact avec la pression optimale.
          </p>
        </div>
      </header>

      <section className="ri-content">
        <div className="ri-container">
          <RaceForm isLoggedIn={isLoggedIn} />
        </div>
      </section>
    </main>
  );
}
