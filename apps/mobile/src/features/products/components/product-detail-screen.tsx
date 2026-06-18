import type { MichelinProduct, Retailer } from '@michelin/contracts';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
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

interface ProductDetailScreenProps {
  id: number;
  onBack: () => void;
}

interface SpecRow {
  label: string;
  value: string | null;
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
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
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBaseUrl}/retailers?country=FR`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Retailer[]) => setRetailers(data))
      .catch(() => setRetailers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <ActivityIndicator
        size="small"
        color={colors.brandBlue}
        style={{ marginTop: spacing[4] }}
      />
    );
  if (retailers.length === 0) return null;

  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>Où acheter</Text>
      {retailers.map((r) => (
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

function ProductBody({ product }: { product: MichelinProduct }) {
  const name = productName(product);
  const range = productRange(product);
  const cycleType = productCycleType(product);
  const size = productSize(product);
  const tags = productTags(product);

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
      {cycleType ? <Text style={styles.eyebrow}>{cycleType}</Text> : null}
      <Text style={styles.name}>{name}</Text>
      {range && range !== name ? (
        <Text style={styles.range}>{range}</Text>
      ) : null}
      {size ? <Text style={styles.size}>{size}</Text> : null}

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

export function ProductDetailScreen({ id, onBack }: ProductDetailScreenProps) {
  const { data, error, isLoading, notFound } = useProduct(id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
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
          <ProductBody product={data} />
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
  eyebrow: {
    marginBottom: spacing[1],
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
    color: colors.brandBlue,
  },
  name: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  range: {
    marginTop: spacing[1],
    fontSize: fontSize.bodyLarge,
    color: colors.textSecondary,
  },
  size: {
    marginTop: spacing[2],
    fontSize: fontSize.h4,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
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
