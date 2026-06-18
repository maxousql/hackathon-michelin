import { useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../../../theme';
import { UserMenu } from '../../auth/components/user-menu';
import heroImage from '../assets/michelin-race-hero.jpg';

const performanceCards = [
  {
    icon: 'G',
    metric: 'Grip humide et appuis rapides',
    text: 'Une gomme et une carcasse choisies pour garder une trajectoire lisible.',
    title: 'Grip',
  },
  {
    icon: 'R',
    metric: 'Vitesse utile',
    text: 'Une recommandation qui arbitre rendement, section et pression cible.',
    title: 'Rendement',
  },
  {
    icon: 'S',
    metric: 'Shield adapté',
    text: 'La protection devient visible au moment du choix, pas après la crevaison.',
    title: 'Résistance',
  },
  {
    icon: 'C',
    metric: 'Compromis clair',
    text: 'Chaque résultat explique ce que vous gagnez et ce que vous acceptez.',
    title: 'Contrôle',
  },
];

const terrainCards = [
  {
    benefit: 'Rendement, précision et confiance quand la vitesse monte.',
    tire: 'Power Cup TLR',
    title: 'Route',
    usage: 'Cyclosportives, longues sorties, entraînement',
  },
  {
    benefit:
      'Grip sur surfaces mixtes avec une carcasse prête pour les écarts.',
    tire: 'Power Gravel',
    title: 'Gravel',
    usage: 'Pistes roulantes, chemins cassants, aventure rapide',
  },
  {
    benefit: 'Lecture du terrain, appuis francs et protection pour attaquer.',
    tire: 'Wild XC / Wild Enduro',
    title: 'VTT',
    usage: 'XC, trail, enduro, e-MTB',
  },
];

const categoryCards = [
  {
    items: 'Course · Endurance · All Road',
    text: 'Vitesse, précision et longues heures sur l’asphalte.',
    title: 'Route',
  },
  {
    items: 'Polyvalent · Vitesse · e-Gravel',
    text: 'Grip et rendement quand le terrain change.',
    title: 'Gravel',
  },
  {
    items: 'XC · Trail · Enduro · Downhill',
    text: 'Contrôle, appuis et protection pour attaquer.',
    title: 'VTT',
  },
  {
    items: 'e-Route · e-Enduro · Speedelec',
    text: 'Traction, stabilité et durabilité pour l’assistance.',
    title: 'e-Bike',
  },
];

const productCards = [
  {
    badge: 'Competition Line',
    category: 'Route',
    name: 'Power Cup TLR',
    price: 'À partir de 69,99 €',
    summary: 'Profitez pleinement de chaque sortie route.',
    strengths: ['Tubeless Ready', 'Rendement élevé', 'Grip de compétition'],
  },
  {
    badge: 'Competition Line',
    category: 'Gravel',
    name: 'Power Gravel',
    price: 'À partir de 54,99 €',
    summary: 'Gardez du rendement quand la piste devient imprévisible.',
    strengths: ['Grip mixte', 'Protection renforcée', 'Polyvalence rapide'],
  },
  {
    badge: 'Racing Line',
    category: 'XC',
    name: 'Wild XC',
    price: 'À partir de 64,99 €',
    summary: 'Attaquez les appuis avec plus de contrôle.',
    strengths: ['Contrôle', 'Crampons agressifs', 'Inspiration compétition'],
  },
];

const newsCards = [
  {
    label: 'Nouveaux',
    text: 'Les pneus vélo 2026 redéfinissent la performance sur tous les terrains.',
    title: 'Innovations vélo 2026',
  },
  {
    label: 'Compétition',
    text: 'Le VTT reste un laboratoire terrain pour transformer l’exigence de course en produits utiles.',
    title: 'WHOOP UCI MTB World Series',
  },
];

const testimonials = [
  {
    author: 'Camille R.',
    context: 'Gravel, 8 000 km/an',
    quote:
      'La recommandation explique pourquoi ce montage colle à mes sorties rapides.',
  },
  {
    author: 'Nicolas D.',
    context: 'XC marathon',
    quote:
      'J’ai compris le compromis entre grip et rendement avant de commander.',
  },
];

const assurances = [
  'Marque reconnue',
  'Expertise pneu',
  'Performance testée',
  'Achat simple',
];

function ActionButton({
  label,
  onPress,
  variant,
}: {
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'outline';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : null,
        variant === 'secondary' ? styles.buttonSecondary : null,
        variant === 'outline' ? styles.buttonOutline : null,
        pressed ? styles.buttonPressed : null,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'primary' ? styles.buttonPrimaryText : null,
          variant === 'secondary' ? styles.buttonSecondaryText : null,
          variant === 'outline' ? styles.buttonOutlineText : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Badge({
  children,
  inverse = false,
}: {
  children: string;
  inverse?: boolean;
}) {
  return (
    <View style={[styles.badge, inverse ? styles.badgeInverse : null]}>
      <View style={styles.badgeDot} />
      <Text
        style={[styles.badgeText, inverse ? styles.badgeTextInverse : null]}
      >
        {children}
      </Text>
    </View>
  );
}

function ChoiceGroup({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: string[];
  selected: string;
}) {
  return (
    <View style={styles.choiceGroup}>
      <Text style={styles.choiceLabel}>{label}</Text>
      <View style={styles.choiceGrid}>
        {options.map((option) => {
          const isSelected = option === selected;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [
                styles.choice,
                isSelected ? styles.choiceSelected : null,
                pressed ? styles.choicePressed : null,
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  isSelected ? styles.choiceTextSelected : null,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function LandingScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [finderOffset, setFinderOffset] = useState(0);
  const [productsOffset, setProductsOffset] = useState(0);
  const [bikeType, setBikeType] = useState('Gravel');
  const [terrain, setTerrain] = useState('Mixte');
  const [priority, setPriority] = useState('Grip');
  const { width } = useWindowDimensions();
  const isTablet = width >= 720;

  const scrollTo = (offset: number) => {
    scrollViewRef.current?.scrollTo({
      animated: true,
      y: Math.max(offset - spacing.s4, 0),
    });
  };

  const rememberFinderOffset = (event: LayoutChangeEvent) => {
    setFinderOffset(event.nativeEvent.layout.y);
  };

  const rememberProductsOffset = (event: LayoutChangeEvent) => {
    setProductsOffset(event.nativeEvent.layout.y);
  };

  const recommendation =
    priority === 'Vitesse'
      ? 'Power Cup TLR'
      : priority === 'Résistance'
        ? 'Power Gravel'
        : priority === 'Confort'
          ? 'Power Adventure'
          : 'Power Gravel';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>MICHELIN</Text>
          </View>
          <Text style={styles.brandProduct}>Race</Text>
          <View style={styles.headerSpacer} />
          <UserMenu />
        </View>

        <ImageBackground
          accessibilityLabel="Pneu de vélo sur un terrain gravel, prêt pour une sortie rapide."
          imageStyle={styles.heroImage}
          resizeMode="cover"
          source={heroImage}
          style={styles.hero}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>
              Trouvez le meilleur pneu MICHELIN pour votre vélo.
            </Text>
            <Text style={styles.heroCopy}>
              Route, gravel, VTT ou e-bike : Michelin Race reprend la logique
              catalogue Michelin et la transforme en expérience de
              recommandation rapide, visuelle et prête à acheter.
            </Text>
            <View style={styles.scorePanel}>
              <View>
                <Text style={styles.scoreLabel}>RaceFinder · 2 min</Text>
                <Text style={styles.scoreText}>Gravel · Mixte · Grip</Text>
              </View>
              <Text style={styles.scoreValue}>→</Text>
            </View>
            <View style={styles.heroActions}>
              <ActionButton
                label="Trouver mon pneu"
                onPress={() => scrollTo(finderOffset)}
                variant="primary"
              />
              <ActionButton
                label="Découvrir la gamme"
                onPress={() => scrollTo(productsOffset)}
                variant="secondary"
              />
            </View>
          </View>
        </ImageBackground>

        <View style={styles.searchSection} onLayout={rememberFinderOffset}>
          <Badge>Recherche Michelin Race</Badge>
          <Text style={styles.sectionTitle}>
            Démarrez comme sur Michelin Bicycle, décidez comme un pilote.
          </Text>
          <View style={styles.searchTabs}>
            <Text style={[styles.searchTab, styles.searchTabActive]}>
              Recherche d’un pneu
            </Text>
            <Text style={styles.searchTab}>Votre configuration</Text>
            <Text style={styles.searchTab}>Par dimension</Text>
          </View>
          <View style={styles.searchFieldGrid}>
            <View style={styles.searchField}>
              <Text style={styles.searchFieldLabel}>Type de vélo</Text>
              <Text style={styles.searchFieldValue}>{bikeType}</Text>
            </View>
            <View style={styles.searchField}>
              <Text style={styles.searchFieldLabel}>Terrain</Text>
              <Text style={styles.searchFieldValue}>{terrain}</Text>
            </View>
            <View style={styles.searchField}>
              <Text style={styles.searchFieldLabel}>Priorité</Text>
              <Text style={styles.searchFieldValue}>{priority}</Text>
            </View>
          </View>
          <ActionButton
            label="Voir la recommandation"
            onPress={() => scrollTo(finderOffset)}
            variant="primary"
          />
        </View>

        <View style={styles.section}>
          <Badge>Preuve de performance</Badge>
          <Text style={styles.sectionTitle}>
            Une recommandation claire sur ce qui compte vraiment.
          </Text>
          <Text style={styles.sectionCopy}>
            Grip, rendement, résistance et contrôle deviennent des critères
            visibles, hiérarchisés et reliés à votre terrain.
          </Text>
          <View style={[styles.grid, isTablet ? styles.gridWrap : null]}>
            {performanceCards.map((card) => (
              <View
                key={card.title}
                style={[
                  styles.performanceCard,
                  isTablet ? styles.tabletHalfCard : null,
                ]}
              >
                <Text style={styles.cardIcon}>{card.icon}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardText}>{card.text}</Text>
                <Text style={styles.cardMetric}>{card.metric}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Badge>Tous les pneus vélo</Badge>
          <Text style={styles.sectionTitle}>
            Une navigation par familles, fidèle au catalogue Michelin.
          </Text>
          <View style={[styles.grid, isTablet ? styles.gridWrap : null]}>
            {categoryCards.map((category) => (
              <View
                key={category.title}
                style={[
                  styles.categoryCard,
                  isTablet ? styles.tabletHalfCard : null,
                ]}
              >
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryText}>{category.text}</Text>
                <Text style={styles.categoryItems}>{category.items}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.deepSection]}>
          <Badge inverse>Choisissez votre terrain</Badge>
          <Text style={[styles.sectionTitle, styles.invertText]}>
            Route, gravel ou VTT : chaque surface impose sa loi.
          </Text>
          <View style={[styles.grid, isTablet ? styles.gridWrap : null]}>
            {terrainCards.map((card) => (
              <View
                key={card.title}
                style={[
                  styles.terrainCard,
                  isTablet ? styles.tabletHalfCard : null,
                ]}
              >
                <Text style={styles.terrainUsage}>{card.usage}</Text>
                <Text style={styles.terrainTitle}>{card.title}</Text>
                <Text style={styles.terrainText}>{card.benefit}</Text>
                <Text style={styles.terrainLabel}>Pneu recommandé</Text>
                <Text style={styles.terrainTire}>{card.tire}</Text>
                <ActionButton
                  label="Voir les pneus"
                  onPress={() => scrollTo(productsOffset)}
                  variant="secondary"
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section} onLayout={rememberProductsOffset}>
          <Text style={styles.spotlightKicker}>À L’HONNEUR:</Text>
          <Text style={styles.spotlightTitle}>
            Nos derniers pneus innovants
          </Text>
          <Text style={styles.spotlightCopy}>
            Les derniers pneus MICHELIN sont conçus pour améliorer les
            performances de votre vélo et vous offrir la meilleure conduite
            possible.
          </Text>
          <View style={styles.mobileCarouselControls}>
            <Text style={[styles.mobileArrow, styles.mobileArrowMuted]}>‹</Text>
            <Text style={styles.mobileArrow}>›</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
          >
            {productCards.map((product) => (
              <View key={product.name} style={styles.productCard}>
                <View style={styles.productVisual}>
                  <View style={styles.productSpeedLine} />
                  <View style={styles.productRing} />
                  <View style={styles.productVisualLabel}>
                    <Text style={styles.productMichelin}>MICHELIN</Text>
                    <Text style={styles.productVisualName}>{product.name}</Text>
                  </View>
                </View>
                <View style={styles.productBody}>
                  <Text style={styles.productMeta}>
                    {product.category} · {product.badge}
                  </Text>
                  <Text style={styles.productSummary}>{product.summary}</Text>
                  <ActionButton
                    label="Afficher les détails"
                    onPress={() => scrollTo(finderOffset)}
                    variant="outline"
                  />
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.productProgress}>
            <View style={styles.productProgressFill} />
          </View>
        </View>

        <View style={[styles.section, styles.brandSection]}>
          <Badge inverse>Race Finder</Badge>
          <Text style={[styles.sectionTitle, styles.invertText]}>
            Trouvez le pneu adapté à votre pratique.
          </Text>
          <Text style={styles.invertCopy}>
            Une interface tactile prête à connecter plus tard au catalogue, aux
            règles de recommandation et aux liens marchands.
          </Text>
          <View style={styles.configuratorCard}>
            <ChoiceGroup
              label="Type de vélo"
              onSelect={setBikeType}
              options={['Route', 'Gravel', 'VTT', 'E-bike']}
              selected={bikeType}
            />
            <ChoiceGroup
              label="Terrain"
              onSelect={setTerrain}
              options={['Sec', 'Mixte', 'Humide', 'Cassant']}
              selected={terrain}
            />
            <ChoiceGroup
              label="Priorité"
              onSelect={setPriority}
              options={['Vitesse', 'Grip', 'Confort', 'Résistance']}
              selected={priority}
            />
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationLabel}>
                Recommandation instantanée
              </Text>
              <Text style={styles.recommendationTitle}>
                MICHELIN {recommendation}
              </Text>
              <Text style={styles.recommendationText}>
                {bikeType} · terrain {terrain.toLowerCase()} · priorité{' '}
                {priority.toLowerCase()}. Confiance élevée, compromis explicite.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Badge>Storytelling Michelin</Badge>
          <Text style={styles.sectionTitle}>
            Testé dans l’exigence, rendu simple au moment de choisir.
          </Text>
          <Text style={styles.sectionCopy}>
            Michelin développe ses pneus dans une culture d’innovation, d’essais
            et de compétition. Michelin Race traduit cet héritage en une
            expérience utile : comprendre le terrain, expliquer la
            recommandation, puis faciliter l’achat.
          </Text>
          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>1891</Text>
              <Text style={styles.statLabel}>brevet du pneu démontable</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>9</Text>
              <Text style={styles.statLabel}>centres de R&D</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>11 679+</Text>
              <Text style={styles.statLabel}>brevets actifs</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Badge>L’actu du vélo</Badge>
          <Text style={styles.sectionTitle}>
            Innovations, partenariats et compétition au service du choix.
          </Text>
          <View style={[styles.grid, isTablet ? styles.gridWrap : null]}>
            {newsCards.map((news) => (
              <View
                key={news.title}
                style={[
                  styles.newsCard,
                  isTablet ? styles.tabletHalfCard : null,
                ]}
              >
                <Text style={styles.newsLabel}>{news.label}</Text>
                <Text style={styles.newsTitle}>{news.title}</Text>
                <Text style={styles.newsText}>{news.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.deepSection]}>
          <Badge inverse>Confiance</Badge>
          <Text style={[styles.sectionTitle, styles.invertText]}>
            Un choix premium doit aussi rassurer.
          </Text>
          <View style={[styles.grid, isTablet ? styles.gridWrap : null]}>
            {testimonials.map((testimonial) => (
              <View
                key={testimonial.author}
                style={[
                  styles.testimonialCard,
                  isTablet ? styles.tabletHalfCard : null,
                ]}
              >
                <Text style={styles.testimonialQuote}>
                  “{testimonial.quote}”
                </Text>
                <Text style={styles.testimonialAuthor}>
                  {testimonial.author}
                </Text>
                <Text style={styles.testimonialContext}>
                  {testimonial.context}
                </Text>
              </View>
            ))}
          </View>
          <View
            style={[styles.assuranceGrid, isTablet ? styles.gridWrap : null]}
          >
            {assurances.map((assurance) => (
              <View
                key={assurance}
                style={[
                  styles.assuranceItem,
                  isTablet ? styles.tabletHalfCard : null,
                ]}
              >
                <Text style={styles.assurancePlus}>+</Text>
                <Text style={styles.assuranceText}>{assurance}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.finalCta}>
          <Badge>Michelin Race</Badge>
          <Text style={styles.finalTitle}>
            Prêt à rouler avec plus de confiance ?
          </Text>
          <Text style={styles.finalText}>
            Lancez le Race Finder, comparez vos priorités et transformez votre
            prochaine sortie en décision d’achat plus claire.
          </Text>
          <ActionButton
            label="Trouver mon pneu Michelin"
            onPress={() => scrollTo(finderOffset)}
            variant="secondary"
          />
          <ActionButton
            label="Voir toute la gamme"
            onPress={() => scrollTo(productsOffset)}
            variant="outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface.canvas,
  },
  content: {
    paddingBottom: spacing.s12,
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s4,
    borderBottomWidth: 3,
    borderBottomColor: colors.brand.yellow,
    backgroundColor: colors.surface.default,
    ...shadows.low,
  },
  headerSpacer: { flex: 1 },
  brandBadge: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.s3,
    borderWidth: 1,
    borderColor: colors.brand.blue,
    borderRadius: radius.medium,
    backgroundColor: colors.brand.blue,
  },
  brandBadgeText: {
    color: colors.base.white,
    fontFamily: typography.family.body,
    fontSize: typography.size.label,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.label,
  },
  brandProduct: {
    marginLeft: spacing.s2,
    color: colors.brand.midnight,
    fontFamily: typography.family.body,
    fontSize: typography.size.bodySmall,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.bodySmall,
  },
  hero: {
    minHeight: 680,
    justifyContent: 'flex-end',
    backgroundColor: colors.brand.midnight,
  },
  heroImage: {
    opacity: 0.52,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.s4,
    paddingBottom: spacing.s12,
    backgroundColor: 'rgba(0, 12, 52, 0.76)',
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s4,
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s2,
    borderWidth: 1,
    borderColor: 'rgba(39, 80, 155, 0.18)',
    borderRadius: radius.full,
    backgroundColor: 'rgba(39, 80, 155, 0.08)',
  },
  badgeInverse: {
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeDot: {
    width: 8,
    height: 8,
    marginRight: spacing.s2,
    borderRadius: radius.full,
    backgroundColor: colors.brand.yellow,
  },
  badgeText: {
    color: colors.brand.blue,
    fontFamily: typography.family.body,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.caption,
  },
  badgeTextInverse: {
    color: colors.text.onBrand,
  },
  heroTitle: {
    maxWidth: 430,
    marginBottom: spacing.s6,
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: 42,
    fontStyle: 'italic',
    fontWeight: typography.weight.black,
    letterSpacing: 1.2,
    lineHeight: 48,
    textTransform: 'uppercase',
  },
  heroCopy: {
    maxWidth: 430,
    marginBottom: spacing.s6,
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.bodyLarge,
    lineHeight: typography.lineHeight.bodyLarge,
    opacity: 0.88,
  },
  scorePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s6,
    padding: spacing.s4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: radius.large,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  scoreLabel: {
    marginBottom: spacing.s1,
    color: colors.brand.blue,
    fontFamily: typography.family.body,
    fontSize: typography.size.label,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.label,
  },
  scoreText: {
    maxWidth: 190,
    color: colors.brand.midnight,
    fontFamily: typography.family.body,
    fontSize: typography.size.bodySmall,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.bodySmall,
  },
  scoreValue: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.brand.yellow,
    color: colors.text.onYellow,
    fontFamily: typography.family.body,
    fontSize: 28,
    fontWeight: typography.weight.black,
    lineHeight: 40,
    textAlign: 'center',
  },
  heroActions: {
    gap: spacing.s3,
  },
  searchSection: {
    gap: spacing.s4,
    marginHorizontal: spacing.s4,
    marginTop: -spacing.s10,
    padding: spacing.s6,
    borderWidth: 1,
    borderColor: 'rgba(0, 32, 91, 0.1)',
    borderRadius: radius.xlarge,
    backgroundColor: colors.surface.default,
    ...shadows.medium,
  },
  searchTabs: {
    gap: spacing.s2,
    padding: spacing.s2,
    borderRadius: radius.large,
    backgroundColor: colors.surface.canvas,
  },
  searchTab: {
    minHeight: 44,
    paddingHorizontal: spacing.s3,
    borderRadius: radius.medium,
    color: colors.text.secondary,
    fontFamily: typography.family.body,
    fontSize: typography.size.label,
    fontWeight: typography.weight.black,
    lineHeight: 44,
    textAlign: 'center',
  },
  searchTabActive: {
    backgroundColor: colors.brand.blue,
    color: colors.text.onBrand,
  },
  searchFieldGrid: {
    gap: spacing.s3,
  },
  searchField: {
    gap: spacing.s1,
    padding: spacing.s4,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.medium,
    backgroundColor: colors.surface.default,
  },
  searchFieldLabel: {
    color: colors.text.secondary,
    fontFamily: typography.family.body,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.caption,
  },
  searchFieldValue: {
    color: colors.brand.midnight,
    fontFamily: typography.family.body,
    fontSize: typography.size.body,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.body,
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.s6,
    borderRadius: radius.medium,
  },
  buttonPrimary: {
    backgroundColor: colors.brand.yellow,
    ...shadows.medium,
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.38)',
    backgroundColor: colors.brand.blue,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: colors.brand.blue,
    backgroundColor: colors.surface.default,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  buttonText: {
    fontFamily: typography.family.body,
    fontSize: typography.size.label,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.label,
  },
  buttonPrimaryText: {
    color: colors.text.onYellow,
  },
  buttonSecondaryText: {
    color: colors.text.onBrand,
  },
  buttonOutlineText: {
    color: colors.brand.blue,
  },
  section: {
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s12,
  },
  sectionTitle: {
    marginBottom: spacing.s4,
    color: colors.text.primary,
    fontFamily: typography.family.body,
    fontSize: typography.size.h2,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.h2,
  },
  sectionCopy: {
    marginBottom: spacing.s6,
    color: colors.text.secondary,
    fontFamily: typography.family.body,
    fontSize: typography.size.bodyLarge,
    lineHeight: typography.lineHeight.bodyLarge,
  },
  grid: {
    gap: spacing.s4,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tabletHalfCard: {
    width: '48%',
  },
  performanceCard: {
    padding: spacing.s6,
    borderWidth: 1,
    borderColor: 'rgba(0, 32, 91, 0.1)',
    borderRadius: radius.large,
    backgroundColor: colors.surface.default,
    ...shadows.low,
  },
  cardIcon: {
    width: 48,
    height: 48,
    marginBottom: spacing.s6,
    borderRadius: radius.medium,
    backgroundColor: colors.brand.blue,
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.h4,
    fontWeight: typography.weight.black,
    lineHeight: 48,
    textAlign: 'center',
  },
  cardTitle: {
    marginBottom: spacing.s2,
    color: colors.brand.midnight,
    fontFamily: typography.family.body,
    fontSize: typography.size.h4,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.h4,
  },
  cardText: {
    marginBottom: spacing.s4,
    color: colors.text.secondary,
    fontFamily: typography.family.body,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  cardMetric: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s2,
    borderRadius: radius.full,
    backgroundColor: colors.surface.highlight,
    color: colors.brand.darkBlue,
    fontFamily: typography.family.body,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.caption,
  },
  categoryCard: {
    padding: spacing.s6,
    borderWidth: 1,
    borderColor: 'rgba(0, 32, 91, 0.1)',
    borderRadius: radius.large,
    backgroundColor: colors.surface.default,
    ...shadows.low,
  },
  categoryTitle: {
    marginBottom: spacing.s2,
    color: colors.brand.midnight,
    fontFamily: typography.family.body,
    fontSize: typography.size.h4,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.h4,
  },
  categoryText: {
    marginBottom: spacing.s4,
    color: colors.text.secondary,
    fontFamily: typography.family.body,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  categoryItems: {
    color: colors.brand.blue,
    fontFamily: typography.family.body,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.caption,
  },
  deepSection: {
    backgroundColor: colors.brand.midnight,
  },
  brandSection: {
    backgroundColor: colors.brand.darkBlue,
  },
  invertText: {
    color: colors.text.onBrand,
  },
  invertCopy: {
    marginBottom: spacing.s6,
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.bodyLarge,
    lineHeight: typography.lineHeight.bodyLarge,
    opacity: 0.78,
  },
  terrainCard: {
    overflow: 'hidden',
    padding: spacing.s6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: radius.xlarge,
    backgroundColor: colors.brand.darkBlue,
  },
  terrainUsage: {
    marginBottom: spacing.s4,
    color: colors.brand.yellow,
    fontFamily: typography.family.body,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.caption,
  },
  terrainTitle: {
    marginBottom: spacing.s2,
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.h3,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.h3,
  },
  terrainText: {
    marginBottom: spacing.s4,
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    opacity: 0.78,
  },
  terrainLabel: {
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    opacity: 0.7,
  },
  terrainTire: {
    marginBottom: spacing.s4,
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.bodyLarge,
  },
  spotlightKicker: {
    marginBottom: spacing.s2,
    color: colors.brand.blue,
    fontFamily: typography.family.body,
    fontSize: typography.size.h3,
    fontStyle: 'italic',
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.h3,
    textTransform: 'uppercase',
  },
  spotlightTitle: {
    maxWidth: 310,
    marginBottom: spacing.s6,
    color: colors.brand.blue,
    fontFamily: typography.family.body,
    fontSize: typography.size.h2,
    fontStyle: 'italic',
    fontWeight: typography.weight.black,
    lineHeight: 38,
    textTransform: 'uppercase',
  },
  spotlightCopy: {
    marginBottom: spacing.s6,
    color: '#2F3136',
    fontFamily: typography.family.body,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.bodyLarge,
  },
  mobileCarouselControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.s2,
    marginBottom: spacing.s4,
  },
  mobileArrow: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: colors.brand.blue,
    borderRadius: radius.full,
    color: colors.brand.blue,
    fontFamily: typography.family.body,
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
  },
  mobileArrowMuted: {
    borderColor: 'transparent',
    backgroundColor: '#E5E5E5',
    color: colors.border.strong,
  },
  productCard: {
    width: 320,
    marginRight: spacing.s6,
  },
  productVisual: {
    minHeight: 270,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.large,
    backgroundColor: colors.brand.midnight,
  },
  productRing: {
    alignSelf: 'center',
    width: 116,
    height: 184,
    marginTop: -spacing.s8,
    borderWidth: 16,
    borderColor: '#17191D',
    borderRadius: 999,
    shadowColor: colors.base.black,
    shadowOffset: { height: 22, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    transform: [{ rotate: '8deg' }],
  },
  productSpeedLine: {
    position: 'absolute',
    right: -46,
    top: 0,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(66, 105, 176, 0.52)',
  },
  productVisualLabel: {
    position: 'absolute',
    left: spacing.s6,
    right: spacing.s6,
    bottom: spacing.s6,
  },
  productMichelin: {
    marginBottom: spacing.s2,
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.h4,
    fontStyle: 'italic',
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.h4,
  },
  productVisualName: {
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.bodyLarge,
    textTransform: 'uppercase',
  },
  productBody: {
    paddingTop: spacing.s6,
  },
  productMeta: {
    marginBottom: spacing.s2,
    color: colors.brand.blue,
    fontFamily: typography.family.body,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.caption,
  },
  productSummary: {
    marginBottom: spacing.s4,
    color: '#24262B',
    fontFamily: typography.family.body,
    fontSize: typography.size.h4,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.h4,
  },
  productProgress: {
    height: 8,
    marginTop: spacing.s10,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: '#E5E5E5',
  },
  productProgressFill: {
    width: '24%',
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.brand.blue,
  },
  configuratorCard: {
    gap: spacing.s4,
    padding: spacing.s4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.xlarge,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  choiceGroup: {
    gap: spacing.s3,
  },
  choiceLabel: {
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.label,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.label,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s2,
  },
  choice: {
    minHeight: 48,
    minWidth: '47%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.s3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  choiceSelected: {
    borderColor: colors.brand.yellow,
    backgroundColor: colors.brand.yellow,
  },
  choicePressed: {
    opacity: 0.84,
  },
  choiceText: {
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.bodySmall,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.bodySmall,
    textAlign: 'center',
  },
  choiceTextSelected: {
    color: colors.text.onYellow,
  },
  recommendationCard: {
    padding: spacing.s4,
    borderRadius: radius.large,
    backgroundColor: colors.surface.default,
  },
  recommendationLabel: {
    marginBottom: spacing.s2,
    color: colors.brand.blue,
    fontFamily: typography.family.body,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.caption,
  },
  recommendationTitle: {
    marginBottom: spacing.s2,
    color: colors.brand.midnight,
    fontFamily: typography.family.body,
    fontSize: typography.size.h4,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.h4,
  },
  recommendationText: {
    color: colors.text.secondary,
    fontFamily: typography.family.body,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  statGrid: {
    gap: spacing.s3,
  },
  statCard: {
    paddingVertical: spacing.s4,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  statValue: {
    color: colors.brand.blue,
    fontFamily: typography.family.body,
    fontSize: typography.size.h2,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.h2,
  },
  statLabel: {
    color: colors.text.secondary,
    fontFamily: typography.family.body,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
  },
  testimonialCard: {
    padding: spacing.s6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: radius.large,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  testimonialQuote: {
    marginBottom: spacing.s4,
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.bodyLarge,
    lineHeight: typography.lineHeight.bodyLarge,
  },
  testimonialAuthor: {
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.body,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.body,
  },
  testimonialContext: {
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    opacity: 0.64,
  },
  newsCard: {
    padding: spacing.s6,
    borderWidth: 1,
    borderColor: 'rgba(0, 32, 91, 0.1)',
    borderRadius: radius.large,
    backgroundColor: colors.surface.default,
    ...shadows.low,
  },
  newsLabel: {
    marginBottom: spacing.s3,
    color: colors.brand.blue,
    fontFamily: typography.family.body,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.caption,
  },
  newsTitle: {
    marginBottom: spacing.s2,
    color: colors.brand.midnight,
    fontFamily: typography.family.body,
    fontSize: typography.size.h4,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.h4,
  },
  newsText: {
    color: colors.text.secondary,
    fontFamily: typography.family.body,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  assuranceGrid: {
    gap: spacing.s3,
    marginTop: spacing.s6,
  },
  assuranceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: radius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  assurancePlus: {
    width: 32,
    height: 32,
    marginRight: spacing.s3,
    borderRadius: radius.full,
    backgroundColor: colors.brand.yellow,
    color: colors.text.onYellow,
    fontFamily: typography.family.body,
    fontSize: typography.size.body,
    fontWeight: typography.weight.black,
    lineHeight: 32,
    textAlign: 'center',
  },
  assuranceText: {
    flex: 1,
    color: colors.text.onBrand,
    fontFamily: typography.family.body,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  finalCta: {
    gap: spacing.s4,
    marginHorizontal: spacing.s4,
    padding: spacing.s6,
    borderRadius: radius.xlarge,
    backgroundColor: colors.brand.yellow,
  },
  finalTitle: {
    color: colors.brand.midnight,
    fontFamily: typography.family.body,
    fontSize: typography.size.h2,
    fontWeight: typography.weight.black,
    lineHeight: typography.lineHeight.h2,
  },
  finalText: {
    color: colors.brand.midnight,
    fontFamily: typography.family.body,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
});
