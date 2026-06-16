import type { ProductFacets, ProductFilters } from '@michelin/contracts';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import { CHIP_FILTERS, type ChipFilterKey } from '../filter-config';
import { Chip } from './chip';

interface FilterBarProps {
  facets: ProductFacets | null;
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
}

export function FilterBar({ facets, filters, onChange }: FilterBarProps) {
  const [search, setSearch] = useState(filters.q ?? '');

  // Tout changement de filtre repart à la première page.
  function toggleFacet(key: ChipFilterKey, value: string) {
    const next = filters[key] === value ? undefined : value;
    onChange({ ...filters, [key]: next, page: 1 });
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() =>
          onChange({ ...filters, q: search.trim() || undefined, page: 1 })
        }
        placeholder="Rechercher un pneu…"
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        style={styles.search}
      />

      {CHIP_FILTERS.map(({ key, label }) => {
        const options = facets?.[key] ?? [];
        if (options.length === 0) return null;
        return (
          <View key={key} style={styles.group}>
            <Text style={styles.label}>{label}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              {options.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={filters[key] === option}
                  onPress={() => toggleFacet(key, option)}
                />
              ))}
            </ScrollView>
          </View>
        );
      })}

      <View style={styles.group}>
        <Chip
          label="Compatible vélo électrique"
          selected={Boolean(filters.ebike)}
          onPress={() =>
            onChange({
              ...filters,
              ebike: filters.ebike ? undefined : true,
              page: 1,
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  search: {
    minHeight: 48,
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceDefault,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  group: {
    gap: spacing[2],
  },
  label: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  row: {
    paddingVertical: spacing[1],
  },
});
