import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';

import { RaceForm } from '@/features/race-intelligence/components/race-form';
import { RaceIntelligenceMarquee } from '@/features/race-intelligence/components/race-intelligence-marquee';
import { RaceIntelligenceMotion } from '@/features/race-intelligence/components/race-intelligence-motion';

import '@/features/race-intelligence/race-intelligence.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  description:
    'Analysez votre course et obtenez la recommandation de pneu Michelin parfaite selon le terrain, la météo et votre profil rider.',
  title: 'Race Intelligence — Michelin Vélo',
};

export default async function RaceIntelligencePage() {
  const cookieStore = await cookies();
  const stravaConnected = !!cookieStore.get('strava_at')?.value;
  const hasAuthSession = !!cookieStore.get('auth_token')?.value;
  const isLoggedIn = hasAuthSession || stravaConnected;

  return (
    <main className="ri-page" id="top">
      <RaceIntelligenceMotion />

      <header className="ri-hero" aria-labelledby="race-intelligence-title">
        <div className="ri-hero-bg" aria-hidden="true" />
        <div className="ri-speed-lines" aria-hidden="true" />
        <div className="ri-container ri-hero-grid">
          <p className="ri-hero-kicker">Race Intelligence Michelin</p>
          <h1 className="ri-hero-title" id="race-intelligence-title">
            La course dicte le pneu Michelin.
          </h1>
          <p className="ri-hero-sub">
            Importez une trace, renseignez votre profil et laissez Michelin lire
            le relief, la surface et la météo pour proposer une monte claire,
            expliquée et prête à rouler.
          </p>
          <div className="ri-hero-actions" aria-label="Actions principales">
            <a className="ri-cta ri-cta-primary" href="#race-diagnostic">
              Analyser mon parcours
            </a>
            <Link className="ri-cta ri-cta-ghost" href="/products">
              Voir la gamme
            </Link>
          </div>
        </div>
      </header>

      <section
        className="ri-interest"
        id="diagnostic"
        aria-labelledby="diagnostic-title"
      >
        <div className="ri-container ri-interest-layout">
          <div className="ri-section-heading">
            <p>Diagnostic Michelin</p>
            <h2 id="diagnostic-title">
              Une recommandation plus lisible qu&apos;un catalogue.
            </h2>
          </div>

          <div
            className="ri-intel-bento grid-flow-dense"
            aria-label="Capacités du diagnostic"
          >
            <article className="ri-bento-card ri-bento-card-route">
              <span
                className="ri-bento-media ri-bento-media-route"
                aria-hidden="true"
              />
              <div>
                <span>Trace</span>
                <h3>Le parcours devient le point de départ.</h3>
                <p>
                  GPX, Strava ou saisie manuelle convergent vers une lecture
                  terrain utile au choix de gomme et de carcasse.
                </p>
              </div>
            </article>
            <article className="ri-bento-card ri-bento-card-weather">
              <div>
                <span>Météo</span>
                <h3>Les conditions changent la pression.</h3>
                <p>
                  La date et le lieu affinent la recommandation sans alourdir le
                  formulaire.
                </p>
              </div>
            </article>
            <article className="ri-bento-card ri-bento-card-pressure">
              <div>
                <span>Pression</span>
                <h3>Avant et arrière restent séparés.</h3>
              </div>
            </article>
            <article className="ri-bento-card ri-bento-card-shop">
              <div>
                <span>Achat</span>
                <h3>La décision mène au bon produit.</h3>
              </div>
            </article>
          </div>
        </div>
      </section>

      <RaceIntelligenceMarquee />

      <section
        className="ri-content"
        id="race-diagnostic"
        aria-labelledby="race-diagnostic-title"
      >
        <div className="ri-container ri-content-grid">
          <div className="ri-form-intro">
            <p>Configurer</p>
            <h2 id="race-diagnostic-title">
              Décrivez la course, Michelin assemble le reste.
            </h2>
            <p>
              Le flux conserve vos données localement pendant la saisie et
              affiche ensuite la recommandation, la pression et
              l&apos;explication.
            </p>
          </div>
          <RaceForm
            canSelectBikes={hasAuthSession}
            isLoggedIn={isLoggedIn}
            stravaConnected={stravaConnected}
          />
        </div>
      </section>

      <section
        className="ri-desire"
        id="terrain"
        aria-labelledby="terrain-title"
      >
        <div className="ri-container ri-desire-layout">
          <div className="ri-desire-copy">
            <p>Lecture terrain</p>
            <h2 id="terrain-title">Chaque surface déplace le compromis.</h2>
          </div>

          <div className="ri-desire-gallery" aria-label="Pratiques analysées">
            {[
              {
                image: 'road',
                text: 'Rendement, pression fine et endurance sur asphalte rapide.',
                title: 'Route',
              },
              {
                image: 'gravel',
                text: 'Transitions mixtes, grip latéral et résistance aux pistes cassantes.',
                title: 'Gravel',
              },
              {
                image: 'mtb',
                text: 'Contrôle, carcasse et confiance quand le relief devient technique.',
                title: 'VTT',
              },
            ].map((item) => (
              <article className="ri-terrain-card" key={item.title}>
                <span
                  className={`ri-terrain-image ri-terrain-image-${item.image}`}
                  aria-hidden="true"
                />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="ri-desire-action">
            <a className="ri-cta ri-cta-primary" href="#race-diagnostic">
              Faire le diagnostic
            </a>
          </div>
        </div>
      </section>

      <section
        className="ri-accordion-section"
        aria-labelledby="decision-title"
      >
        <div className="ri-container">
          <div className="ri-section-heading ri-section-heading-wide">
            <p>Expérience rider</p>
            <h2 id="decision-title">
              Le diagnostic garde le contrôle visible jusqu&apos;à l&apos;achat.
            </h2>
          </div>
          <div className="ri-horizontal-accordion">
            {[
              {
                image: 'input',
                text: 'La saisie reste courte, avec GPX et Strava quand le rider a déjà ses données.',
                title: 'Importer',
              },
              {
                image: 'analyse',
                text: 'Le terrain, la météo et le profil construisent une justification exploitable.',
                title: 'Analyser',
              },
              {
                image: 'prescribe',
                text: 'La pression et le pneu recommandé apparaissent avec les raisons du choix.',
                title: 'Prescrire',
              },
              {
                image: 'buy',
                text: 'Le parcours se termine sur une action claire vers le produit Michelin.',
                title: 'Acheter',
              },
            ].map((item) => (
              <article className="ri-accordion-slice" key={item.title}>
                <span
                  className={`ri-accordion-image ri-accordion-image-${item.image}`}
                  aria-hidden="true"
                />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ri-final" id="decision" aria-labelledby="final-title">
        <div className="ri-container ri-final-grid">
          <div>
            <p>Décision Michelin</p>
            <h2 id="final-title">
              Votre prochaine sortie peut choisir vos pneus.
            </h2>
          </div>
          <div className="ri-final-actions">
            <a className="ri-cta ri-cta-primary" href="#race-diagnostic">
              Lancer Race Intelligence
            </a>
            <Link className="ri-cta ri-cta-outline" href="/comparateur">
              Comparer deux pneus
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
