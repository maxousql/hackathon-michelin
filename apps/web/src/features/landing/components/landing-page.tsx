import Image from 'next/image';
import Link from 'next/link';

import { RaceIntelligenceMarquee } from '@/features/race-intelligence/components/race-intelligence-marquee';

import {
  AnimatedBadge,
  Container,
  DesireStack,
  ExperienceAccordion,
  GradientBackground,
  MichelinBento,
  MichelinButton,
  Section,
  ScrubNarrative,
} from './landing-components';
import { LandingMotion } from './landing-motion';

export function LandingPage() {
  return (
    <>
      <main className="landing-modern" id="top">
        <LandingMotion />
        <GradientBackground className="hero-shell">
          <section className="hero-section" aria-labelledby="hero-title">
            <Image
              className="hero-image"
              src="/michelin-race-hero.jpg"
              alt="Pneu de vélo sur un terrain gravel, prêt pour une sortie rapide."
              width={1400}
              height={720}
              priority
              sizes="100vw"
            />
            <div className="hero-overlay" />
            <div className="speed-lines" aria-hidden="true" />

            <Container className="hero-grid">
              <div className="hero-content reveal">
                <h1 id="hero-title">
                  Trouvez le meilleur pneu MICHELIN pour votre vélo.
                </h1>
                <p className="hero-copy">
                  Route, gravel, VTT ou e-bike : Michelin Race reprend la
                  logique catalogue Michelin et la transforme en expérience de
                  recommandation plus rapide, plus visuelle et orientée achat.
                </p>
                <div className="hero-actions" aria-label="Actions principales">
                  <MichelinButton href="#configurateur">
                    Trouver mon pneu
                  </MichelinButton>
                  <MichelinButton href="#produits" variant="ghost">
                    Découvrir la gamme
                  </MichelinButton>
                </div>
              </div>
            </Container>
          </section>
        </GradientBackground>

        <Section className="modern-intro-section" id="recherche">
          <Container className="modern-intro-layout">
            <div className="modern-intro-copy">
              <AnimatedBadge>Michelin Race</AnimatedBadge>
              <ScrubNarrative />
              <div className="modern-intro-actions">
                <MichelinButton href="/race-intelligence">
                  Importer un parcours
                </MichelinButton>
                <MichelinButton href="/products" variant="outline">
                  Voir le catalogue
                </MichelinButton>
              </div>
            </div>
            <MichelinBento />
          </Container>
        </Section>

        <RaceIntelligenceMarquee />

        <Section
          ariaLabelledby="practices-title"
          className="accordion-section"
          id="produits"
        >
          <Container>
            <div className="section-heading section-heading-wide">
              <AnimatedBadge>Pratiques Michelin</AnimatedBadge>
              <h2 id="practices-title">
                Route, gravel, VTT, e-bike : chaque pratique change la lecture.
              </h2>
              <p>
                La page ne déroule plus une liste de produits. Elle fait sentir
                que le bon pneu dépend d’un usage précis, d’un niveau
                d’engagement et d’un terrain réellement rencontré.
              </p>
            </div>
            <ExperienceAccordion />
          </Container>
        </Section>

        <Section
          ariaLabelledby="desire-title"
          className="desire-section"
          id="configurateur"
          tone="deep"
        >
          <Container className="desire-layout">
            <div className="desire-copy-rail">
              <div className="section-heading section-heading-invert desire-copy">
                <AnimatedBadge tone="dark">Expérience complète</AnimatedBadge>
                <h2 id="desire-title">
                  Comprendre, prescrire, comparer, prolonger.
                </h2>
                <p>
                  La conversion devient plus naturelle quand chaque étape répond
                  à une hésitation réelle : pourquoi ce pneu, pourquoi
                  maintenant, et que devient-il après usage.
                </p>
                <MichelinButton href="/race-intelligence" variant="ghost">
                  Lancer Race Intelligence
                </MichelinButton>
              </div>
            </div>
            <DesireStack />
          </Container>
        </Section>

        <section
          className="ri-final"
          id="decision"
          aria-labelledby="final-cta-title"
        >
          <div className="ri-container ri-final-grid">
            <div>
              <p>Décision Michelin</p>
              <h2 id="final-cta-title">
                Votre prochaine sortie peut choisir vos pneus.
              </h2>
            </div>
            <div className="ri-final-actions">
              <a
                className="ri-cta ri-cta-primary"
                href="/race-intelligence#race-diagnostic"
              >
                Lancer Race Intelligence
              </a>
              <Link className="ri-cta ri-cta-outline" href="/comparateur">
                Comparer deux pneus
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
