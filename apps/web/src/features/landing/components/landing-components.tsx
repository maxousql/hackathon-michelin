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

interface PerformanceCardProps {
  icon: string;
  title: string;
  text: string;
  metric: string;
}

interface TerrainCardProps {
  title: string;
  usage: string;
  benefit: string;
  tire: string;
  tone: 'road' | 'gravel' | 'mtb';
}

interface ProductCardProps {
  name: string;
  category: string;
  badge: string;
  summary: string;
  tone: 'road' | 'gravel' | 'xc' | 'enduro';
}

interface BicycleCategoryCardProps {
  title: string;
  text: string;
  items: string[];
}

interface NewsCardProps {
  label: string;
  title: string;
  text: string;
}

interface ConfiguratorCardProps {
  bikeTypes: string[];
  terrains: string[];
  priorities: string[];
}

interface StoryStatProps {
  value: string;
  label: string;
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  context: string;
}

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

export function PerformanceCard({
  icon,
  metric,
  text,
  title,
}: PerformanceCardProps) {
  return (
    <article className="performance-card reveal">
      <span aria-hidden="true" className="card-icon">
        {icon}
      </span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <strong>{metric}</strong>
    </article>
  );
}

export function TerrainCard({
  benefit,
  tire,
  title,
  tone,
  usage,
}: TerrainCardProps) {
  return (
    <article className={`terrain-card terrain-${tone} reveal`}>
      <div className="terrain-card-overlay" aria-hidden="true" />
      <div className="terrain-card-content">
        <span className="terrain-tag">{usage}</span>
        <h3>{title}</h3>
        <p>{benefit}</p>
        <dl>
          <div>
            <dt>Pneu recommandé</dt>
            <dd>{tire}</dd>
          </div>
        </dl>
        <MichelinButton href="#produits" variant="ghost">
          Voir les pneus
        </MichelinButton>
      </div>
    </article>
  );
}

export function ProductCard({
  badge,
  category,
  name,
  summary,
  tone,
}: ProductCardProps) {
  return (
    <article className="product-card reveal">
      <div className={`product-visual product-${tone}`} aria-hidden="true">
        <div className="product-tire">
          <span />
        </div>
        <div className="product-visual-label">
          <span>MICHELIN</span>
          <strong>{name.replace('MICHELIN ', '')}</strong>
        </div>
      </div>
      <div className="product-card-body">
        <p className="product-card-meta">
          {category} · {badge}
        </p>
        <h3>{summary}</h3>
        <a href="#configurateur">Afficher les détails</a>
      </div>
    </article>
  );
}

export function BicycleSearchPanel() {
  return (
    <form className="bicycle-search-panel" aria-label="Recherche de pneu vélo">
      <div
        className="search-tabs"
        role="tablist"
        aria-label="Mode de recherche"
      >
        <button aria-selected="true" role="tab" type="button">
          Recherche d’un pneu
        </button>
        <button aria-selected="false" role="tab" type="button">
          Votre configuration
        </button>
        <button aria-selected="false" role="tab" type="button">
          Par dimension
        </button>
      </div>
      <div className="search-fields">
        <label>
          <span>Type de vélo</span>
          <select defaultValue="Gravel">
            <option>Route</option>
            <option>Gravel</option>
            <option>VTT</option>
            <option>e-Bike</option>
          </select>
        </label>
        <label>
          <span>Pratique</span>
          <select defaultValue="Polyvalent">
            <option>Course</option>
            <option>Endurance</option>
            <option>Polyvalent</option>
            <option>All Mountain / Trail</option>
          </select>
        </label>
        <label>
          <span>Priorité</span>
          <select defaultValue="Grip">
            <option>Vitesse</option>
            <option>Grip</option>
            <option>Résistance</option>
            <option>Confort</option>
          </select>
        </label>
        <MichelinButton className="search-submit" href="#configurateur">
          Voir la recommandation
        </MichelinButton>
      </div>
    </form>
  );
}

export function BicycleCategoryCard({
  items,
  text,
  title,
}: BicycleCategoryCardProps) {
  return (
    <article className="bicycle-category-card reveal">
      <h3>{title}</h3>
      <p>{text}</p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a href="#produits">Explorer</a>
    </article>
  );
}

export function NewsCard({ label, text, title }: NewsCardProps) {
  return (
    <article className="news-card reveal">
      <span>{label}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <a href="#produits">Lire</a>
    </article>
  );
}

export function ConfiguratorCard({
  bikeTypes,
  priorities,
  terrains,
}: ConfiguratorCardProps) {
  return (
    <form
      className="configurator-card"
      aria-label="Mini configurateur Michelin Race"
    >
      <ConfiguratorGroup
        legend="Type de vélo"
        name="bike"
        options={bikeTypes}
        selected="Gravel"
      />
      <ConfiguratorGroup
        legend="Terrain dominant"
        name="terrain"
        options={terrains}
        selected="Mixte"
      />
      <ConfiguratorGroup
        legend="Priorité"
        name="priority"
        options={priorities}
        selected="Grip"
      />
      <aside className="recommendation-card">
        <span>Recommandation instantanée</span>
        <h3>Power Gravel Competition Line</h3>
        <p>
          Profil polyvalent, Gum-X et carcasse adaptée aux sorties rapides sur
          surfaces changeantes.
        </p>
        <dl>
          <div>
            <dt>Confiance</dt>
            <dd>Élevée</dd>
          </div>
          <div>
            <dt>Compromis</dt>
            <dd>Plus robuste qu’un pur pneu route</dd>
          </div>
        </dl>
      </aside>
    </form>
  );
}

function ConfiguratorGroup({
  legend,
  name,
  options,
  selected,
}: {
  legend: string;
  name: string;
  options: string[];
  selected: string;
}) {
  return (
    <fieldset className="configurator-group">
      <legend>{legend}</legend>
      <div className="option-grid">
        {options.map((option) => (
          <label className="option-pill" key={option}>
            <input
              defaultChecked={option === selected}
              name={name}
              type="radio"
              value={option}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function StoryStat({ label, value }: StoryStatProps) {
  return (
    <div className="story-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function TestimonialCard({
  author,
  context,
  quote,
}: TestimonialCardProps) {
  return (
    <article className="testimonial-card reveal">
      <p>“{quote}”</p>
      <footer>
        <strong>{author}</strong>
        <span>{context}</span>
      </footer>
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
