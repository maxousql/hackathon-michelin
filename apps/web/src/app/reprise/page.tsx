import Image from 'next/image';
import Link from 'next/link';

import { MyRequests } from '@/features/buyback/components/my-requests';
import { RepriseForm } from '@/features/buyback/components/reprise-form';
import { fetchMyBuybackRequests } from '@/features/buyback/services/buyback.api';
import { getCurrentUser } from '@/features/auth/services/current-user';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const processSteps = [
  {
    number: '01',
    text: 'Retrouvez votre pneu dans le catalogue MICHELIN.',
    title: 'Identifiez le modèle',
  },
  {
    number: '02',
    text: 'Déclarez son état et la quantité à reprendre.',
    title: 'Obtenez une estimation',
  },
  {
    number: '03',
    text: 'Suivez vos demandes depuis votre espace reprise.',
    title: 'Gardez le suivi',
  },
];

const assuranceItems = [
  'Reprise estimée avant envoi',
  'Traçabilité de chaque demande',
  'Seconde vie ou recyclage responsable',
];

export default async function ReprisePage() {
  const [requests, user] = await Promise.all([
    fetchMyBuybackRequests(),
    getCurrentUser(),
  ]);
  const isLoggedIn = !!user;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <Image
          alt="Pneu de vélo Michelin sur terrain rapide"
          className={styles.heroImage}
          height={720}
          priority
          sizes="100vw"
          src="/michelin-race-hero.jpg"
          width={1400}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.speedLines} aria-hidden="true" />

        <div className={styles.heroInner}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Seconde vie Michelin Race</p>
            <h1 className={styles.title}>Reprise MICHELIN</h1>
            <p className={styles.lede}>
              Donnez une seconde vie à vos pneus. MICHELIN estime leur reprise,
              organise leur remise en état ou leur recyclage, et vous permet de
              suivre chaque demande simplement.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#estimation">
                Estimer ma reprise
              </a>
              <Link className={styles.secondaryAction} href="/products">
                Voir le catalogue
              </Link>
            </div>
          </div>

          <aside
            className={styles.heroPanel}
            aria-label="Aperçu du service de reprise"
          >
            <div className={styles.panelHeader}>
              <p className={styles.panelKicker}>Reprise guidée</p>
              <span>3 étapes</span>
            </div>
            <h2>Une estimation claire avant validation.</h2>
            <div className={styles.panelMetric}>
              <span>Critères lus</span>
              <strong>Modèle · État · Quantité</strong>
            </div>
            <p className={styles.panelNote}>
              Le parcours reprend les références du catalogue pour éviter les
              saisies approximatives et fiabiliser la demande.
            </p>
          </aside>
        </div>
      </header>

      <section
        aria-labelledby="estimation-title"
        className={styles.estimateSection}
        id="estimation"
      >
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Service reprise</p>
          <h2 id="estimation-title">Estimez vos pneus par usage réel.</h2>
          <p>
            Sélectionnez une référence MICHELIN existante, indiquez l’état du
            pneu et obtenez une estimation cohérente avec votre demande.
          </p>
        </div>

        <div className={styles.estimateLayout}>
          <RepriseForm isLoggedIn={isLoggedIn} />

          <aside className={styles.assurancePanel} aria-label="Étapes reprise">
            <div>
              <p className={styles.sectionKicker}>Parcours</p>
              <h3>Un flux court, aligné sur le catalogue.</h3>
            </div>
            <ol className={styles.processList}>
              {processSteps.map((step) => (
                <li key={step.number}>
                  <span>{step.number}</span>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className={styles.assuranceStrip}>
              {assuranceItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby="requests-title" className={styles.requests}>
        <div className={styles.requestsHeader}>
          <p className={styles.sectionKicker}>Suivi</p>
          <h2 className={styles.sectionTitle} id="requests-title">
            Mes demandes
          </h2>
        </div>
        <MyRequests requests={requests} isLoggedIn={isLoggedIn} />
      </section>
    </div>
  );
}
