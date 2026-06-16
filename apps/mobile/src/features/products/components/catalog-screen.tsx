import { PRODUCTS_PAGE_SIZE, type ProductFilters } from '@michelin/contracts';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import { useProductFacets } from '../hooks/use-product-facets';
import { useProducts } from '../hooks/use-products';
import { FilterBar } from './filter-bar';
import { ProductCard } from './product-card';

const INITIAL_FILTERS: ProductFilters = { sort: 'range', page: 1 };

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
  const { data, error, isLoading } = useProducts(filters);
  const facets = useProductFacets();

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Catalogue indisponible.</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  return (
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
          <FilterBar
            facets={facets.data}
            filters={filters}
            onChange={setFilters}
          />
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
              Page {filters.page} / {totalPages}
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
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[6],
    paddingBottom: spacing[16],
  },
  eyebrow: {
    marginBottom: spacing[2],
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    color: colors.brandBlue,
  },
  title: {
    marginBottom: spacing[6],
    fontSize: fontSize.h2,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  count: {
    marginBottom: spacing[4],
    fontSize: fontSize.bodySmall,
    color: colors.textSecondary,
  },
  empty: {
    padding: spacing[6],
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  loader: {
    marginVertical: spacing[8],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    gap: spacing[2],
  },
  error: {
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
    marginTop: spacing[8],
  },
  pager: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.medium,
  },
  pagerDisabled: {
    borderColor: colors.borderDefault,
  },
  pagerText: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.brandBlue,
  },
  pagerTextDisabled: {
    color: colors.borderStrong,
  },
  pageStatus: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
});
