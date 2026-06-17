import Image from 'next/image';

import {
  AnimatedBadge,
  BicycleCategoryCard,
  BicycleSearchPanel,
  ConfiguratorCard,
  Container,
  GradientBackground,
  MichelinButton,
  NewsCard,
  PerformanceCard,
  ProductCard,
  RaceFinderCard,
  Section,
  StoryStat,
  TerrainCard,
  TestimonialCard,
} from './landing-components';

const performanceCards = [
  {
    icon: 'G',
    metric: 'Grip humide et appuis rapides',
    text: 'Des gommes pensées pour garder une trajectoire lisible lorsque la route, la pierre ou la terre changent de rythme.',
    title: 'Grip',
  },
  {
    icon: 'R',
    metric: 'Roulage plus net',
    text: 'Une prescription qui arbitre rendement, section et carcasse pour préserver la vitesse utile sur votre pratique.',
    title: 'Rendement',
  },
  {
    icon: 'S',
    metric: 'Shield adapté au terrain',
    text: 'La protection devient un critère de choix visible, pas un détail technique noyé dans la fiche produit.',
    title: 'Résistance',
  },
  {
    icon: 'C',
    metric: 'Décision plus sûre',
    text: 'La recommandation explique les compromis et évite de promettre un pneu universel pour toutes les sorties.',
    title: 'Contrôle',
  },
];

const terrainCards = [
  {
    benefit: 'Rendement, précision et confiance quand la vitesse monte.',
    tire: 'Power Cup TLR',
    title: 'Route',
    tone: 'road' as const,
    usage: 'Longues sorties, cyclosportives, compétition',
  },
  {
    benefit:
      'Grip sur surfaces mixtes avec une carcasse prête pour les écarts.',
    tire: 'Power Gravel',
    title: 'Gravel',
    tone: 'gravel' as const,
    usage: 'Pistes roulantes, chemins cassants, aventure rapide',
  },
  {
    benefit: 'Lecture du terrain, appuis francs et protection pour attaquer.',
    tire: 'Wild XC / Wild Enduro',
    title: 'VTT',
    tone: 'mtb' as const,
    usage: 'Cross-country, trail, enduro, e-MTB',
  },
];

const bicycleCategories = [
  {
    items: ['Course', 'Endurance', 'All Road', 'Cyclocross'],
    text: 'Des pneus pensés pour la vitesse, la précision et les longues heures sur l’asphalte.',
    title: 'Pneus vélo de route',
  },
  {
    items: ['Polyvalent', 'Vitesse', 'e-Gravel'],
    text: 'Une entrée claire pour les cyclistes qui alternent pistes roulantes, chemins cassants et bitume.',
    title: 'Pneus gravel',
  },
  {
    items: ['Cross Country', 'All Mountain / Trail', 'Enduro', 'Downhill'],
    text: 'Des familles lisibles pour choisir selon le terrain, l’engagement et le niveau de contrôle attendu.',
    title: 'Pneus VTT',
  },
  {
    items: ['e-Route', 'e-Cross Country', 'e-Enduro', 'Speedelec'],
    text: 'Une lecture dédiée aux contraintes électriques : traction, stabilité et durabilité.',
    title: 'Pneus e-bike',
  },
  {
    items: ['Touring', 'Urbain', 'Trekking'],
    text: 'Des pneus pour rouler longtemps, transporter, commuter et garder une conduite fiable.',
    title: 'Ville et tourisme',
  },
  {
    items: ['Route', 'VTT', 'City'],
    text: 'Chambres à air et accessoires pour finaliser la configuration recommandée.',
    title: 'Chambres à air',
  },
];

const productCards = [
  {
    badge: 'Performance Line',
    category: 'Enduro',
    name: 'MICHELIN Wild Enduro MH',
    summary: 'Profitez pleinement de chaque sortie enduro.',
    tone: 'enduro' as const,
  },
  {
    badge: 'Competition Line',
    category: 'Gravel',
    name: 'MICHELIN Power Gravel',
    summary: 'Gardez du rendement quand la piste devient imprévisible.',
    tone: 'gravel' as const,
  },
  {
    badge: 'Racing Line',
    category: 'XC',
    name: 'MICHELIN Wild XC',
    summary: 'Attaquez les appuis avec plus de contrôle en cross-country.',
    tone: 'xc' as const,
  },
  {
    badge: 'Racing Line E-50',
    category: 'E-MTB',
    name: 'MICHELIN E-Wild Front',
    summary: 'Ajoutez de la traction et de la stabilité à votre e-MTB.',
    tone: 'enduro' as const,
  },
];

const newsCards = [
  {
    label: 'Nouveaux',
    text: 'Les pneus vélo 2026 redéfinissent la lecture performance sur route, gravel, VTT et e-bike.',
    title: 'Innovations MICHELIN pour vélos en 2026',
  },
  {
    label: 'Partenariat',
    text: 'Une présence sportive qui nourrit la crédibilité vélo et rapproche Michelin des cyclistes exigeants.',
    title: 'Michelin fait équipe avec Romain Bardet',
  },
  {
    label: 'Compétition',
    text: 'Le VTT reste un laboratoire terrain pour transformer l’exigence de course en produits utiles.',
    title: 'Partenaire principal des WHOOP UCI MTB World Series',
  },
];

const storyStats = [
  { label: 'brevet du pneu vélo démontable', value: '1891' },
  { label: 'centres de R&D dans le monde', value: '9' },
  { label: 'brevets actifs', value: '11 679+' },
];

const testimonials = [
  {
    author: 'Camille R.',
    context: 'Gravel, 8 000 km/an',
    quote:
      'La recommandation ne vend pas juste un pneu. Elle explique pourquoi ce montage colle à mes sorties rapides et aux pistes abîmées.',
  },
  {
    author: 'Nicolas D.',
    context: 'XC marathon',
    quote:
      'J’ai compris le compromis entre grip et rendement avant de commander. C’est exactement ce qui manque souvent dans un catalogue.',
  },
  {
    author: 'Léa M.',
    context: 'Route performance',
    quote:
      'Le parcours est court, visuel et rassurant. Je peux comparer sans me perdre dans vingt références.',
  },
];

const assuranceItems = [
  'Marque reconnue dans la mobilité',
  'Expertise pneu et compétition',
  'Performance testée sur le terrain',
  'Achat ou montage simple à déclencher',
];

export function LandingPage() {
  return (
    <>
      <main id="top">
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

              <RaceFinderCard />
            </Container>
          </section>
        </GradientBackground>

        <Section
          ariaLabelledby="search-title"
          className="search-section"
          id="recherche"
        >
          <Container className="search-layout">
            <div className="section-heading">
              <AnimatedBadge>Recherche Michelin Race</AnimatedBadge>
              <h2 id="search-title">
                Démarrez comme sur Michelin Bicycle, décidez comme un pilote.
              </h2>
              <p>
                Le point d’entrée prioritaire devient la recherche de pneu :
                type de vélo, pratique, priorité et configuration. Le reste de
                la page sert à rassurer et convertir.
              </p>
            </div>
            <BicycleSearchPanel />
          </Container>
        </Section>

        <Section ariaLabelledby="performance-title" id="performance">
          <Container>
            <div className="section-heading">
              <AnimatedBadge>Preuve de performance</AnimatedBadge>
              <h2 id="performance-title">
                Une recommandation claire sur ce qui compte vraiment.
              </h2>
              <p>
                Grip, rendement, résistance et contrôle deviennent des critères
                visibles, hiérarchisés et reliés à votre terrain.
              </p>
            </div>
            <div className="performance-grid">
              {performanceCards.map((card) => (
                <PerformanceCard key={card.title} {...card} />
              ))}
            </div>
          </Container>
        </Section>

        <Section ariaLabelledby="categories-title" id="categories">
          <Container>
            <div className="section-heading">
              <AnimatedBadge>Tous les pneus vélo</AnimatedBadge>
              <h2 id="categories-title">
                Une navigation par familles, fidèle au catalogue Michelin.
              </h2>
              <p>
                Les entrées Route, Gravel, VTT, e-bike, Ville et Chambres à air
                reprennent la logique de découverte du site Bicycle en la
                condensant pour une landing de campagne.
              </p>
            </div>
            <div className="bicycle-category-grid">
              {bicycleCategories.map((category) => (
                <BicycleCategoryCard key={category.title} {...category} />
              ))}
            </div>
          </Container>
        </Section>

        <Section ariaLabelledby="terrain-title" id="terrains" tone="deep">
          <Container>
            <div className="section-heading section-heading-invert">
              <AnimatedBadge tone="dark">
                Choisissez votre terrain
              </AnimatedBadge>
              <h2 id="terrain-title">
                Route, gravel ou VTT : chaque surface impose sa loi.
              </h2>
              <p>
                La landing donne immédiatement une porte d’entrée par pratique,
                puis guide vers une gamme Michelin cohérente.
              </p>
            </div>
            <div className="terrain-grid">
              {terrainCards.map((terrain) => (
                <TerrainCard key={terrain.title} {...terrain} />
              ))}
            </div>
          </Container>
        </Section>

        <Section
          ariaLabelledby="products-title"
          className="spotlight-section"
          id="produits"
        >
          <Container className="product-showcase">
            <div className="spotlight-copy">
              <p className="spotlight-kicker">À L’HONNEUR:</p>
              <h2 id="products-title">Nos derniers pneus innovants</h2>
              <p>
                Les derniers pneus MICHELIN sont conçus pour améliorer les
                performances de votre vélo et vous offrir la meilleure conduite
                possible.
              </p>
            </div>
            <div
              className="product-carousel"
              aria-label="Derniers pneus innovants"
            >
              <div className="carousel-controls" aria-hidden="true">
                <span className="carousel-arrow carousel-arrow-muted">‹</span>
                <span className="carousel-arrow">›</span>
              </div>
              <div className="product-grid">
                {productCards.map((product) => (
                  <ProductCard key={product.name} {...product} />
                ))}
              </div>
              <div className="product-progress" aria-hidden="true">
                <span />
              </div>
            </div>
          </Container>
        </Section>

        <Section
          ariaLabelledby="configurator-title"
          id="configurateur"
          tone="brand"
        >
          <Container className="split-layout">
            <div className="section-heading section-heading-invert">
              <AnimatedBadge tone="dark">Race Finder</AnimatedBadge>
              <h2 id="configurator-title">
                Trouvez le pneu adapté à votre pratique.
              </h2>
              <p>
                Une interface de configurateur pensée pour se connecter plus
                tard aux règles de recommandation, au catalogue et aux liens
                marchands.
              </p>
            </div>
            <ConfiguratorCard
              bikeTypes={['Route', 'Gravel', 'VTT', 'E-bike']}
              priorities={['Vitesse', 'Grip', 'Confort', 'Résistance']}
              terrains={['Sec', 'Mixte', 'Humide', 'Cassant']}
            />
          </Container>
        </Section>

        <Section ariaLabelledby="story-title">
          <Container className="story-layout">
            <div className="story-copy">
              <AnimatedBadge>Storytelling Michelin</AnimatedBadge>
              <h2 id="story-title">
                Testé dans l’exigence, rendu simple au moment de choisir.
              </h2>
              <p>
                Michelin développe ses pneus dans une culture d’innovation,
                d’essais et de compétition. Michelin Race traduit cet héritage
                en une expérience digitale utile : comprendre le terrain,
                expliquer la recommandation, puis faciliter l’achat.
              </p>
              <div className="story-stats">
                {storyStats.map((stat) => (
                  <StoryStat key={stat.label} {...stat} />
                ))}
              </div>
            </div>
            <div className="editorial-panel" aria-hidden="true">
              <span />
              <strong>We race for better motion</strong>
            </div>
          </Container>
        </Section>

        <Section ariaLabelledby="news-title" id="actu">
          <Container>
            <div className="section-heading">
              <AnimatedBadge>L’actu du vélo</AnimatedBadge>
              <h2 id="news-title">
                Innovations, partenariats et compétition au service du choix.
              </h2>
              <p>
                La page Bicycle donne de la profondeur avec des contenus
                éditoriaux. Michelin Race garde ces preuves proches du parcours
                d’achat.
              </p>
            </div>
            <div className="news-grid">
              {newsCards.map((news) => (
                <NewsCard key={news.title} {...news} />
              ))}
            </div>
          </Container>
        </Section>

        <Section ariaLabelledby="trust-title" tone="deep">
          <Container>
            <div className="section-heading section-heading-invert">
              <AnimatedBadge tone="dark">Confiance</AnimatedBadge>
              <h2 id="trust-title">Un choix premium doit aussi rassurer.</h2>
            </div>
            <div className="testimonial-grid">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.author} {...testimonial} />
              ))}
            </div>
            <div className="assurance-strip" aria-label="Réassurances">
              {assuranceItems.map((item) => (
                <div key={item}>
                  <span aria-hidden="true">+</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section ariaLabelledby="final-cta-title" tone="yellow">
          <Container className="final-cta">
            <div>
              <AnimatedBadge>Michelin Race</AnimatedBadge>
              <h2 id="final-cta-title">
                Prêt à rouler avec plus de confiance ?
              </h2>
              <p>
                Lancez le Race Finder, comparez vos priorités et transformez
                votre prochaine sortie en décision d’achat plus claire.
              </p>
            </div>
            <div className="final-actions">
              <MichelinButton href="#configurateur" variant="secondary">
                Trouver mon pneu Michelin
              </MichelinButton>
              <MichelinButton href="#produits" variant="outline">
                Voir toute la gamme
              </MichelinButton>
            </div>
          </Container>
        </Section>
      </main>
    </>
  );
}
