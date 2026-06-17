import { PRODUCTS_PAGE_SIZE, type ProductFilters } from '@michelin/contracts';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import { useProductFacets } from '../hooks/use-product-facets';
import { useProducts } from '../hooks/use-products';
import { FilterModal } from './filter-modal';
import { ProductCard } from './product-card';

const INITIAL_FILTERS: ProductFilters = { sort: 'range', page: 1 };

function activeFilterCount(filters: ProductFilters): number {
  const keys = ['cycleType', 'segment', 'sealing', 'productType'] as const;
  return (
    keys.filter((k) => filters[k] != null).length + (filters.ebike ? 1 : 0)
  );
}

interface CatalogScreenProps {
  onSelect: (id: number) => void;
}

function PagerButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={[styles.pager, disabled && styles.pagerDisabled]}
    >
      <Text style={[styles.pagerText, disabled && styles.pagerTextDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function CatalogScreen({ onSelect }: CatalogScreenProps) {
  const [filters, setFilters] = useState<ProductFilters>(INITIAL_FILTERS);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const { data, error, isLoading } = useProducts(filters);
  const facets = useProductFacets();

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
  const activeCount = activeFilterCount(filters);

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Catalogue indisponible.</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={onSelect} />
        )}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>CATALOGUE VÉLO 2026</Text>
            <Text style={styles.title}>
              Trouvez les pneus adaptés à vos sorties
            </Text>

            {/* Barre recherche + bouton filtre */}
            <View style={styles.searchRow}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={() =>
                  setFilters((f) => ({
                    ...f,
                    q: search.trim() || undefined,
                    page: 1,
                  }))
                }
                placeholder="Rechercher un pneu…"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="search"
                style={styles.search}
              />

              <Pressable
                style={[
                  styles.filterBtn,
                  activeCount > 0 && styles.filterBtnActive,
                ]}
                onPress={() => setFilterOpen(true)}
                accessibilityLabel="Ouvrir les filtres"
                accessibilityRole="button"
              >
                <Ionicons
                  name="options-outline"
                  size={20}
                  color={
                    activeCount > 0 ? colors.textOnBrand : colors.textPrimary
                  }
                />
                {activeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{activeCount}</Text>
                  </View>
                )}
              </Pressable>
            </View>

            <Text style={styles.count}>
              {total} produit{total > 1 ? 's' : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? null : (
            <Text style={styles.empty}>
              Aucun pneu ne correspond à ces filtres.
            </Text>
          )
        }
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator color={colors.brandBlue} style={styles.loader} />
          ) : totalPages > 1 ? (
            <View style={styles.pagination}>
              <PagerButton
                label="← Précédent"
                disabled={filters.page <= 1}
                onPress={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              />
              <Text style={styles.pageStatus}>
                {filters.page} / {totalPages}
              </Text>
              <PagerButton
                label="Suivant →"
                disabled={filters.page >= totalPages}
                onPress={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              />
            </View>
          ) : null
        }
      />

      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        facets={facets.data}
        filters={filters}
        onApply={(next) => setFilters({ ...next, page: 1 })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceCanvas },
  content: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: 130,
    gap: spacing[3],
  },
  eyebrow: {
    marginBottom: spacing[1],
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    color: colors.brandBlue,
  },
  title: {
    marginBottom: spacing[4],
    fontSize: fontSize.h2,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  search: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceDefault,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfaceDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.brandBlue,
    borderColor: colors.brandBlue,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textOnYellow,
  },
  count: {
    marginBottom: spacing[2],
    fontSize: fontSize.bodySmall,
    color: colors.textSecondary,
  },
  empty: {
    paddingVertical: spacing[8],
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loader: { marginVertical: spacing[8] },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    gap: spacing[2],
  },
  errorTitle: {
    fontSize: fontSize.h4,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  errorDetail: {
    fontSize: fontSize.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[6],
  },
  pager: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.medium,
  },
  pagerDisabled: { borderColor: colors.borderDefault },
  pagerText: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.brandBlue,
  },
  pagerTextDisabled: { color: colors.borderStrong },
  pageStatus: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
});
