import type { MichelinProduct, Retailer } from '@michelin/contracts';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import heroImage from '../../../../assets/michelin-race-hero.jpg';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadows,
  spacing,
} from '../../../theme';
import { apiBaseUrl } from '../../../config/api';
import { useProduct } from '../hooks/use-product';
import {
  isEbike,
  productCycleType,
  productName,
  productRange,
  productSize,
  productTags,
} from '../presenter';
import { Chip } from './chip';

const COUNTRY_LABELS: Record<string, string> = {
  FR: 'France',
  DE: 'Allemagne',
  GB: 'Royaume-Uni',
  ES: 'Espagne',
  IT: 'Italie',
  NL: 'Pays-Bas',
  BE: 'Belgique',
  PL: 'Pologne',
};

interface ProductDetailScreenProps {
  id: number;
  onBack: () => void;
  onNavigateToComparator?: () => void;
}

interface SpecRow {
  label: string;
  value: string | null;
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function joinValues(values: Array<string | null | undefined>): string | null {
  const visible = values.map((v) => v?.trim()).filter(Boolean);
  return visible.length > 0 ? visible.join(' · ') : null;
}

function display(value: string | null | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function pressure(
  min: string | null,
  max: string | null,
  unit: string,
): string | null {
  const lo = clean(min);
  const hi = clean(max);
  if (lo && hi) return `${lo} – ${hi} ${unit}`;
  if (lo) return `min. ${lo} ${unit}`;
  if (hi) return `max. ${hi} ${unit}`;
  return null;
}

function SpecGroup({ title, rows }: { title: string; rows: SpecRow[] }) {
  const visible = rows.filter((row) => row.value !== null);
  if (visible.length === 0) return null;

  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {visible.map((row) => (
        <View key={row.label} style={styles.specRow}>
          <Text style={styles.specLabel}>{row.label}</Text>
          <Text style={styles.specValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

function RetailersSection() {
  const [allRetailers, setAllRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('FR');

  useEffect(() => {
    fetch(`${apiBaseUrl}/retailers`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Retailer[]) => {
        setAllRetailers(data);
        const countries = [...new Set(data.map((r: Retailer) => r.country))];
        const defaultCountry = countries.includes('FR')
          ? 'FR'
          : (countries[0] ?? 'FR');
        setSelectedCountry(defaultCountry);
      })
      .catch(() => setAllRetailers([]))
      .finally(() => setLoading(false));
  }, []);

  const countries = [...new Set(allRetailers.map((r) => r.country))].sort();
  const visible = allRetailers.filter((r) => r.country === selectedCountry);

  if (loading)
    return (
      <ActivityIndicator
        size="small"
        color={colors.brandBlue}
        style={{ marginTop: spacing[4] }}
      />
    );
  if (allRetailers.length === 0) return null;

  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>Où acheter</Text>

      {/* Country picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.countryPicker}
      >
        {countries.map((code) => (
          <Chip
            key={code}
            label={COUNTRY_LABELS[code] ?? code}
            selected={selectedCountry === code}
            onPress={() => setSelectedCountry(code)}
          />
        ))}
      </ScrollView>

      {/* Retailer list */}
      {visible.map((r) => (
        <Pressable
          key={r.id}
          style={styles.retailerRow}
          onPress={() => void Linking.openURL(r.website)}
          accessibilityRole="link"
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.retailerName}>{r.name}</Text>
            {r.region ? (
              <Text style={styles.retailerRegion}>{r.region}</Text>
            ) : null}
          </View>
          <Ionicons name="open-outline" size={16} color={colors.brandBlue} />
        </Pressable>
      ))}
    </View>
  );
}

interface ProductBodyProps {
  product: MichelinProduct;
  onScrollToRetailers?: () => void;
  onNavigateToComparator?: () => void;
}

function ProductBody({
  product,
  onScrollToRetailers,
  onNavigateToComparator,
}: ProductBodyProps) {
  const name = productName(product);
  const range = productRange(product);
  const cycleType = productCycleType(product);
  const size = productSize(product);
  const tags = productTags(product);

  const heroTitle = range ?? name;
  const heroSubtitle =
    heroTitle === name ? (clean(product.designation) ?? size) : name;
  const pressionLabel =
    pressure(product.minimum_pressure, product.maximum_pressure, 'bar') ??
    pressure(product.conversion_psi_mini, product.conversion_psi_maxi, 'psi');
  const heroFacts = [
    { label: 'Dimension', value: display(size, 'À confirmer') },
    {
      label: 'Montage',
      value: display(
        joinValues([product.sealing, product.fitting]),
        'À vérifier',
      ),
    },
    { label: 'Pression', value: pressionLabel ?? 'Voir fiche' },
  ];

  const featureTiles = [
    {
      icon: 'map-outline' as const,
      title: 'Usage',
      text: display(
        joinValues([product.use, product.terrain_types]),
        'Usage à vérifier',
      ),
    },
    {
      icon: 'resize-outline' as const,
      title: 'Format',
      text: display(joinValues([size, product.rim_type]), 'À confirmer'),
    },
    {
      icon: 'construct-outline' as const,
      title: 'Compatibilité',
      text: display(
        joinValues([product.sealing, product.fitting, product.bead]),
        'À vérifier',
      ),
    },
    {
      icon: 'flash-outline' as const,
      title: 'Construction',
      text: display(
        joinValues([product.rubber_technologies, product.casing_technologies]),
        'Voir fiche technique',
      ),
    },
  ];

  const dimensions: SpecRow[] = [
    { label: 'Diamètre', value: clean(product.web_diameter) },
    { label: 'Largeur', value: clean(product.web_width) },
    { label: 'Diamètre ETRTO', value: clean(product.diameter_etrto) },
    { label: 'Largeur ETRTO', value: clean(product.width_etrto) },
    { label: 'Type de jante', value: clean(product.rim_type) },
  ];

  const mounting: SpecRow[] = [
    { label: 'Tringle', value: clean(product.bead) },
    { label: 'Étanchéité', value: clean(product.sealing) },
    { label: 'Montage', value: clean(product.fitting) },
    {
      label: 'Chambre à air conseillée',
      value: clean(product.recommended_inner_tube),
    },
    { label: 'Valve', value: clean(product.valve) },
  ];

  const pressures: SpecRow[] = [
    {
      label: 'Pression conseillée',
      value: pressure(
        product.minimum_pressure,
        product.maximum_pressure,
        'bar',
      ),
    },
    {
      label: 'Pression (psi)',
      value: pressure(
        product.conversion_psi_mini,
        product.conversion_psi_maxi,
        'psi',
      ),
    },
  ];

  const construction: SpecRow[] = [
    { label: 'Ligne', value: clean(product.segment) },
    { label: 'Type de produit', value: clean(product.product_type) },
    { label: 'Usage', value: clean(product.use) },
    { label: 'Terrains', value: clean(product.terrain_types) },
    { label: 'TPI (densité de carcasse)', value: clean(product.tpi) },
    { label: 'Carcasse', value: clean(product.casing_technologies) },
    { label: 'Gomme', value: clean(product.rubber_technologies) },
    { label: 'Technologies e-bike', value: clean(product.e_bike_technologies) },
    { label: 'Poids', value: clean(product.weight) },
  ];

  const references: SpecRow[] = [
    { label: 'Code EAN', value: clean(product.ean_code) },
    { label: 'Code MSPN', value: clean(product.mspn_code) },
    { label: 'Conditionnement', value: clean(product.conditioning) },
  ];

  return (
    <View>
      {/* Hero */}
      <ImageBackground
        source={heroImage}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          {cycleType ? (
            <Text style={styles.heroEyebrow}>{cycleType}</Text>
          ) : null}
          <Text style={styles.heroTitle}>{heroTitle}</Text>
          {heroSubtitle && heroSubtitle !== heroTitle ? (
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
          ) : null}
          <View style={styles.heroFacts}>
            {heroFacts.map((fact) => (
              <View key={fact.label} style={styles.heroFact}>
                <Text style={styles.heroFactLabel}>{fact.label}</Text>
                <Text style={styles.heroFactValue}>{fact.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.heroActions}>
            {onScrollToRetailers ? (
              <Pressable
                style={styles.heroPrimaryBtn}
                onPress={onScrollToRetailers}
              >
                <Text style={styles.heroPrimaryBtnText}>Où l'acheter</Text>
              </Pressable>
            ) : null}
            {onNavigateToComparator ? (
              <Pressable
                style={styles.heroSecondaryBtn}
                onPress={onNavigateToComparator}
              >
                <Text style={styles.heroSecondaryBtnText}>Comparer</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ImageBackground>

      {/* Feature tiles */}
      <View style={styles.featureGrid}>
        {featureTiles.map((tile) => (
          <View key={tile.title} style={styles.featureTile}>
            <Ionicons name={tile.icon} size={20} color={colors.brandBlue} />
            <Text style={styles.featureTileTitle}>{tile.title}</Text>
            <Text style={styles.featureTileText} numberOfLines={3}>
              {tile.text}
            </Text>
          </View>
        ))}
      </View>

      {tags.length > 0 || isEbike(product) ? (
        <View style={styles.tags}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <SpecGroup title="Dimensions" rows={dimensions} />
      <SpecGroup title="Montage et étanchéité" rows={mounting} />
      <SpecGroup title="Pression" rows={pressures} />
      <SpecGroup title="Construction et technologies" rows={construction} />
      <SpecGroup title="Références et conditionnement" rows={references} />
      <RetailersSection />
    </View>
  );
}

export function ProductDetailScreen({
  id,
  onBack,
  onNavigateToComparator,
}: ProductDetailScreenProps) {
  const { data, error, isLoading, notFound } = useProduct(id);
  const scrollRef = useRef<ScrollView>(null);
  const scrollToRetailers = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          style={styles.back}
        >
          <Text style={styles.backText}>← Retour au catalogue</Text>
        </Pressable>

        {isLoading ? (
          <ActivityIndicator color={colors.brandBlue} style={styles.loader} />
        ) : notFound ? (
          <Text style={styles.message}>Ce pneu est introuvable.</Text>
        ) : error ? (
          <Text style={styles.message}>Produit indisponible. {error}</Text>
        ) : data ? (
          <ProductBody
            product={data}
            onScrollToRetailers={scrollToRetailers}
            onNavigateToComparator={onNavigateToComparator}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceCanvas },
  content: {
    padding: spacing[6],
    paddingBottom: 130,
  },
  back: {
    marginBottom: spacing[6],
  },
  backText: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.brandBlue,
  },
  loader: {
    marginVertical: spacing[16],
  },
  message: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },

  hero: {
    marginHorizontal: -spacing[6],
    height: 280,
    marginBottom: spacing[6],
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,20,60,0.58)',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
    justifyContent: 'flex-end',
  },
  heroEyebrow: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    color: colors.brandYellow,
    textTransform: 'uppercase',
    marginBottom: spacing[2],
  },
  heroTitle: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.black,
    color: '#fff',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: fontSize.bodyLarge,
    color: 'rgba(255,255,255,0.72)',
    marginTop: spacing[1],
  },
  heroFacts: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  heroFact: { flex: 1 },
  heroActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  heroPrimaryBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRadius: radius.large,
    backgroundColor: colors.brandYellow,
  },
  heroPrimaryBtnText: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.black,
    color: colors.textOnYellow,
  },
  heroSecondaryBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  heroSecondaryBtnText: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  heroFactLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  heroFactValue: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    color: '#fff',
  },

  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  featureTile: {
    width: '47%',
    padding: spacing[4],
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfaceDefault,
    gap: spacing[2],
    ...shadows.low,
  },
  featureTileTitle: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  featureTileText: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  tag: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHighlight,
  },
  tagText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    color: colors.textOnYellow,
  },
  group: {
    marginTop: spacing[8],
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.large,
    backgroundColor: colors.surfaceDefault,
  },
  groupTitle: {
    marginBottom: spacing[4],
    fontSize: fontSize.h4,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  countryPicker: {
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  retailerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  retailerName: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  retailerRegion: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  specLabel: {
    flex: 1,
    fontSize: fontSize.bodySmall,
    color: colors.textSecondary,
  },
  specValue: {
    flex: 1,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'right',
  },
});
