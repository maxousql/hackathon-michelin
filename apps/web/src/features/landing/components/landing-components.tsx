import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

interface SectionProps extends ContainerProps {
  id?: string;
  ariaLabelledby?: string;
  tone?: 'light' | 'brand' | 'deep' | 'yellow';
}

interface MichelinButtonProps {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  className?: string;
}

interface AnimatedBadgeProps {
  children: ReactNode;
  tone?: 'light' | 'dark';
}

interface Metric {
  label: string;
  value: string;
}

interface Signal {
  caption: string;
  label: string;
  value: string;
}

interface SignalPanelProps {
  signals: Signal[];
}

interface FeatureStepCardProps {
  index: number;
  label: string;
  text: string;
  title: string;
}

interface ProofCardProps {
  code: string;
  text: string;
  title: string;
}

interface ConversionCardProps {
  action: string;
  href: string;
  text: string;
  title: string;
}

const scrubNarrative =
  'Michelin Race part de la sortie, lit le terrain et transforme ces signaux en recommandation claire, argumentée et immédiatement actionnable.';

const bentoCards = [
  {
    className: 'bento-card-large bento-card-media',
    eyebrow: 'Michelin Race',
    image: 'https://picsum.photos/seed/michelin-gravel-trace/1200/900',
    text: 'Profil vélo, surfaces, météo et priorités deviennent un point de départ lisible.',
    title: 'Le contexte avant le catalogue.',
  },
  {
    className: 'bento-card-compact bento-card-blue',
    eyebrow: 'Race Intelligence',
    text: 'GPX, Strava et terrain sont lus comme un diagnostic, pas comme un gadget.',
    title: 'Analyse exploitable.',
  },
  {
    className: 'bento-card-compact bento-card-yellow',
    eyebrow: 'Prescription',
    text: 'Une monte principale, une alternative et les limites d’usage restent visibles.',
    title: 'Décision sans boîte noire.',
  },
  {
    className: 'bento-card-wide bento-card-dark',
    eyebrow: 'Challenge mon pneu',
    image: 'https://picsum.photos/seed/michelin-bike-benchmark/1400/900',
    text: 'Le comparateur rassure avant de demander au cycliste de changer.',
    title: 'Comparer sur le même parcours.',
  },
  {
    className: 'bento-card-medium bento-card-light',
    eyebrow: 'Seconde vie',
    text: 'La reprise garde Michelin présent après le montage : estimation, demande, suivi.',
    title: 'Le service continue.',
  },
];

const accordionItems = [
  {
    image: 'https://picsum.photos/seed/michelin-road-speed/1100/900',
    text: 'La vitesse ne suffit pas : la recommandation expose le compromis entre rendement, pression et tenue.',
    title: 'Route',
  },
  {
    image: 'https://picsum.photos/seed/michelin-gravel-control/1100/900',
    text: 'Le gravel demande une lecture fine des surfaces mixtes et des transitions rapides.',
    title: 'Gravel',
  },
  {
    image: 'https://picsum.photos/seed/michelin-mtb-control/1100/900',
    text: 'Le VTT rend les limites visibles : grip, protection et contrôle passent avant la promesse universelle.',
    title: 'VTT',
  },
  {
    image: 'https://picsum.photos/seed/michelin-ebike-torque/1100/900',
    text: 'L’e-bike ajoute couple, charge et usure : la compatibilité doit être traitée avant l’achat.',
    title: 'E-bike',
  },
];

const marqueeItems = [
  'Michelin Race',
  'Race Intelligence',
  'Power Gravel',
  'GUM-X',
  'Tubeless Ready',
  'Challenge mon pneu',
  'Reprise Michelin',
  'ETRTO',
];

export function Container({ children, className = '' }: ContainerProps) {
  return <div className={`container ${className}`.trim()}>{children}</div>;
}

export function Section({
  children,
  className = '',
  id,
  ariaLabelledby,
  tone = 'light',
}: SectionProps) {
  return (
    <section
      aria-labelledby={ariaLabelledby}
      className={`section section-${tone} ${className}`.trim()}
      id={id}
    >
      {children}
    </section>
  );
}

export function MichelinButton({
  children,
  href,
  variant = 'primary',
  className = '',
}: MichelinButtonProps) {
  return (
    <a
      className={`michelin-button button-${variant} ${className}`.trim()}
      href={href}
    >
      {children}
    </a>
  );
}

export function AnimatedBadge({
  children,
  tone = 'light',
}: AnimatedBadgeProps) {
  return <span className={`animated-badge badge-${tone}`}>{children}</span>;
}

export function GradientBackground({
  children,
  className = '',
}: ContainerProps) {
  return (
    <div className={`gradient-background ${className}`.trim()}>{children}</div>
  );
}

export function ScrubNarrative() {
  return (
    <div className="scrub-narrative">
      <h2>
        La sortie
        <span
          className="inline-heading-image inline-heading-image-terrain"
          aria-hidden="true"
        />
        avant le pneu.
      </h2>
      <p className="scrub-copy">
        {scrubNarrative.split(' ').map((word, index) => (
          <span className="scrub-word" key={`${word}-${index}`}>
            {word}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}

export function RaceFinderCard() {
  return (
    <aside className="race-dashboard reveal" aria-label="Aperçu Michelin Race">
      <div className="dashboard-header">
        <p className="dashboard-kicker">RaceFinder</p>
        <span>2 min</span>
      </div>
      <h2>Votre recommandation commence ici.</h2>
      <div className="dashboard-select">
        <span>Profil actuel</span>
        <strong>Gravel · Mixte · Grip</strong>
      </div>
      <MetricRail
        metrics={[
          { label: 'Vélo', value: 'Gravel' },
          { label: 'Terrain', value: 'Mixte' },
          { label: 'Priorité', value: 'Grip' },
        ]}
      />
      <p className="dashboard-note">
        Répondez à trois choix simples et obtenez une monte Michelin adaptée à
        votre pratique.
      </p>
      <MichelinButton
        className="dashboard-action"
        href="#recherche"
        variant="primary"
      >
        Lancer le RaceFinder
      </MichelinButton>
    </aside>
  );
}

export function MichelinBento() {
  return (
    <div className="michelin-bento" aria-label="Fonctionnalités Michelin Race">
      {bentoCards.map((card) => (
        <article
          className={`bento-card gsap-fade-scale ${card.className}`.trim()}
          key={card.title}
        >
          {card.image ? (
            <span
              className="bento-media"
              aria-hidden="true"
              style={{ backgroundImage: `url(${card.image})` }}
            />
          ) : null}
          <div className="bento-content">
            <span>{card.eyebrow}</span>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ExperienceAccordion() {
  return (
    <div className="experience-accordion" aria-label="Pratiques vélo Michelin">
      {accordionItems.map((item) => (
        <article className="accordion-slice group" key={item.title}>
          <span
            className="accordion-image"
            aria-hidden="true"
            style={{ backgroundImage: `url(${item.image})` }}
          />
          <div className="accordion-content">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function DesireStack() {
  return (
    <div className="desire-stack" aria-label="Parcours de conversion Michelin">
      <article className="stack-card">
        <div className="stack-copy">
          <span>Comprendre</span>
          <h3>Le parcours devient une preuve exploitable.</h3>
          <p>
            La donnée est rendue lisible avant l’affichage produit, pour éviter
            une recommandation perçue comme arbitraire.
          </p>
          <ul className="stack-proof-list">
            <li>Surfaces classées avant le catalogue</li>
            <li>Relief, météo et priorité rapprochés</li>
            <li>Score lisible par le conseiller</li>
          </ul>
          <div className="stack-outcome">
            <span>Preuve terrain</span>
            <strong>Le bon pneu part du contexte réel.</strong>
            <p>
              Le parcours devient un argument de choix, pas une simple étape.
            </p>
          </div>
        </div>
        <IntelligencePanel />
      </article>
      <article className="stack-card">
        <div className="stack-copy">
          <span>Prescrire</span>
          <h3>La décision montre ses compromis.</h3>
          <p>
            La monte principale, l’alternative et la limite d’usage cohabitent
            dans la même lecture.
          </p>
          <ul className="stack-proof-list">
            <li>Monte avant et arrière justifiées</li>
            <li>Alternative disponible sans changer d’écran</li>
            <li>Limite d’usage visible avant l’achat</li>
          </ul>
          <div className="stack-outcome">
            <span>Décision affichée</span>
            <strong>La recommandation assume ses arbitrages.</strong>
            <p>
              La monte principale, l’alternative et la limite restent lisibles
              au même endroit.
            </p>
          </div>
        </div>
        <PrescriptionPanel />
      </article>
      <article className="stack-card">
        <div className="stack-copy">
          <span>Rassurer</span>
          <h3>Le pneu actuel devient un point de comparaison.</h3>
          <p>
            Le cycliste comprend pourquoi changer, sans discours opaque ni
            promesse trop large.
          </p>
          <ul className="stack-proof-list">
            <li>Pneu actuel gardé comme référence</li>
            <li>Écart mesuré sur le même itinéraire</li>
            <li>Compromis grip, protection, rendement</li>
          </ul>
          <div className="stack-outcome">
            <span>Écart expliqué</span>
            <strong>Changer devient plus facile à accepter.</strong>
            <p>
              Le comparateur relie le pneu actuel au gain attendu sur la sortie.
            </p>
          </div>
        </div>
        <ComparisonPanel />
      </article>
      <article className="stack-card">
        <div className="stack-copy">
          <span>Prolonger</span>
          <h3>La fin d’usage devient un service Michelin.</h3>
          <p>
            La reprise transforme l’après-achat en parcours suivi, estimé et
            traçable.
          </p>
          <ul className="stack-proof-list">
            <li>Modèle reconnu depuis le catalogue</li>
            <li>Estimation claire avant demande</li>
            <li>Suivi visible après l’envoi</li>
          </ul>
          <div className="stack-outcome">
            <span>Service continu</span>
            <strong>La relation ne s’arrête pas à l’achat.</strong>
            <p>
              La reprise garde Michelin présent dans le cycle d’usage complet.
            </p>
          </div>
        </div>
        <BuybackPreview />
      </article>
    </div>
  );
}

export function BrandMarquee() {
  const repeated = [...marqueeItems, ...marqueeItems];

  return (
    <div className="brand-marquee" aria-label="Univers Michelin Race">
      <div className="marquee-track">
        {repeated.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export function SignalPanel({ signals }: SignalPanelProps) {
  return (
    <aside className="signal-panel reveal" aria-label="Exemple Michelin Race">
      <div className="signal-panel-header">
        <div>
          <p>Diagnostic express</p>
          <h3>Gravel rapide, terrain mixte</h3>
        </div>
        <span>Michelin Race</span>
      </div>
      <div className="signal-visual" aria-hidden="true">
        <span className="signal-tire" />
        <span className="signal-line signal-line-one" />
        <span className="signal-line signal-line-two" />
      </div>
      <div className="signal-grid">
        {signals.map((signal) => (
          <div key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            <p>{signal.caption}</p>
          </div>
        ))}
      </div>
      <p className="signal-note">
        Ces signaux alimentent une prescription expliquée avant de pousser vers
        le catalogue.
      </p>
    </aside>
  );
}

export function FeatureStepCard({
  index,
  label,
  text,
  title,
}: FeatureStepCardProps) {
  return (
    <article className="feature-step-item reveal">
      <span className="feature-step-index">
        {String(index).padStart(2, '0')}
      </span>
      <p>{label}</p>
      <h3>{title}</h3>
      <span className="feature-step-rule" aria-hidden="true" />
      <p>{text}</p>
    </article>
  );
}

export function IntelligencePanel() {
  return (
    <aside
      className="intelligence-panel reveal"
      aria-label="Aperçu Race Intelligence"
    >
      <div className="intelligence-header">
        <div>
          <p>Trace analysée</p>
          <h3>Sortie gravel · 68 km</h3>
        </div>
        <span>GPX + météo</span>
      </div>

      <div className="surface-stack" aria-label="Répartition du parcours">
        <div className="surface-row">
          <span>Compact</span>
          <strong>47 %</strong>
          <div className="surface-track">
            <span className="surface-fill surface-fill-compact" />
          </div>
        </div>
        <div className="surface-row">
          <span>Mixte</span>
          <strong>31 %</strong>
          <div className="surface-track">
            <span className="surface-fill surface-fill-mixed" />
          </div>
        </div>
        <div className="surface-row">
          <span>Route</span>
          <strong>22 %</strong>
          <div className="surface-track">
            <span className="surface-fill surface-fill-road" />
          </div>
        </div>
      </div>

      <div className="route-summary">
        <span>Lecture Michelin Race</span>
        <strong>Gravel compact, météo variable</strong>
        <p>
          La trace est découpée par surfaces, relief et zones à risque avant la
          recommandation.
        </p>
      </div>

      <div className="intelligence-map" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="intelligence-metrics">
        <div>
          <span>Dénivelé</span>
          <strong>820 m</strong>
        </div>
        <div>
          <span>Humidité</span>
          <strong>Variable</strong>
        </div>
        <div>
          <span>Priorité</span>
          <strong>Contrôle</strong>
        </div>
      </div>
    </aside>
  );
}

export function PrescriptionPanel() {
  return (
    <aside
      className="prescription-panel reveal"
      aria-label="Exemple de prescription Michelin"
    >
      <div className="prescription-header">
        <div>
          <p>Recommandation principale</p>
          <h3>MICHELIN Power Gravel Competition Line</h3>
        </div>
        <span>Confiance 92 %</span>
      </div>

      <div className="prescription-fit">
        <div>
          <span>Avant</span>
          <strong>700 x 40C</strong>
          <p>Grip et direction sur surfaces changeantes.</p>
        </div>
        <div>
          <span>Arrière</span>
          <strong>700 x 40C</strong>
          <p>Rendement conservé avec une carcasse plus robuste.</p>
        </div>
      </div>

      <ul className="prescription-benefits">
        <li>Compatible tubeless ready</li>
        <li>Priorité contrôle et résistance</li>
        <li>Alternative orientée vitesse disponible</li>
      </ul>

      <div className="prescription-warning">
        <span>Limite d’usage</span>
        <p>
          Si le parcours devient majoritairement boueux ou très cassant, la
          recommandation bascule vers une monte VTT plus agressive.
        </p>
      </div>
    </aside>
  );
}

export function ProofCard({ code, text, title }: ProofCardProps) {
  return (
    <article className="proof-row reveal">
      <span>{code}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export function ComparisonPanel() {
  return (
    <aside
      className="comparison-panel reveal"
      aria-label="Aperçu du comparateur Michelin"
    >
      <div className="comparison-header">
        <p>Benchmark itinéraire</p>
        <span>3 pneus</span>
      </div>

      <div className="comparison-route" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="comparison-grid">
        <div className="comparison-card comparison-muted">
          <span>Pneu actuel</span>
          <strong>Profil rapide</strong>
          <p>
            Très bon rendement, protection plus limitée sur pistes cassantes.
          </p>
        </div>
        <div className="comparison-card comparison-highlight">
          <span>Prescription Michelin</span>
          <strong>Power Gravel</strong>
          <p>Meilleur équilibre contrôle, résistance et rendement utile.</p>
        </div>
      </div>

      <dl className="comparison-scores">
        <div>
          <dt>Grip</dt>
          <dd>+18 %</dd>
        </div>
        <div>
          <dt>Protection</dt>
          <dd>+24 %</dd>
        </div>
        <div>
          <dt>Rendement</dt>
          <dd>Stable</dd>
        </div>
      </dl>
    </aside>
  );
}

export function BuybackPreview() {
  return (
    <aside
      className="buyback-preview reveal"
      aria-label="Aperçu du service Reprise Michelin"
    >
      <div className="buyback-device" aria-label="Écran Reprise Michelin">
        <div className="buyback-device-bar" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <header className="buyback-screen-header">
          <p className="buyback-eyebrow">Seconde vie</p>
          <h3>Reprise MICHELIN</h3>
          <p>
            Donnez une seconde vie à vos pneus et obtenez une récompense claire
            avant l’envoi.
          </p>
        </header>

        <div className="buyback-selected">
          <div>
            <span>Votre modèle de pneu</span>
            <strong>MICHELIN Power Gravel</strong>
            <p>700 x 40C · Competition Line</p>
          </div>
          <a href="/reprise">Changer</a>
        </div>

        <div className="buyback-field">
          <span className="buyback-field-label">État du pneu</span>
          <div className="buyback-chips" aria-label="État sélectionné">
            <span className="buyback-chip-active">Bon</span>
            <span>Usé</span>
            <span>À contrôler</span>
          </div>
          <p>
            Usure régulière, carcasse intacte, crampons encore exploitables.
          </p>
        </div>

        <div className="buyback-form-row">
          <div>
            <span className="buyback-field-label">Quantité</span>
            <strong>2 pneus</strong>
          </div>
          <div>
            <span className="buyback-field-label">Traitement</span>
            <strong>Reconditionnement</strong>
          </div>
        </div>

        <div className="buyback-estimate">
          <span>Reprise estimée</span>
          <strong>24 €</strong>
        </div>

        <a className="buyback-action" href="/reprise">
          Demander la reprise
        </a>

        <div className="buyback-request">
          <div>
            <span>Mes demandes</span>
            <strong>Power Gravel</strong>
            <p>Bon · ×2 · En cours</p>
          </div>
          <strong>24 €</strong>
        </div>
      </div>

      <div className="buyback-flow-rail" aria-label="Étapes du service">
        <div className="buyback-step">
          <span>01</span>
          <div>
            <strong>Identifier</strong>
            <p>Le pneu est recherché dans le catalogue Michelin.</p>
          </div>
        </div>
        <div className="buyback-step">
          <span>02</span>
          <div>
            <strong>Qualifier</strong>
            <p>L’état et la quantité donnent une estimation transparente.</p>
          </div>
        </div>
        <div className="buyback-step">
          <span>03</span>
          <div>
            <strong>Suivre</strong>
            <p>La demande reste visible après l’envoi.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function ConversionCard({
  action,
  href,
  text,
  title,
}: ConversionCardProps) {
  return (
    <article className="conversion-row reveal">
      <h3>{title}</h3>
      <p>{text}</p>
      <a href={href}>{action}</a>
    </article>
  );
}

export function MetricRail({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="metric-rail" aria-label="Indicateurs Michelin Race">
      {metrics.map((metric) => (
        <div key={metric.label}>
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
        </div>
      ))}
    </div>
  );
}
