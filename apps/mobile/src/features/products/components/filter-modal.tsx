import type { ProductFacets, ProductFilters } from '@michelin/contracts';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadows,
  spacing,
} from '../../../theme';
import { CHIP_FILTERS, type ChipFilterKey } from '../filter-config';
import { useProducts } from '../hooks/use-products';
import { Chip } from './chip';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  facets: ProductFacets | null;
  filters: ProductFilters;
  onApply: (filters: ProductFilters) => void;
}

function activeCount(filters: ProductFilters): number {
  const chipKeys: ChipFilterKey[] = [
    'cycleType',
    'segment',
    'sealing',
    'productType',
  ];
  return (
    chipKeys.filter((k) => filters[k] != null).length + (filters.ebike ? 1 : 0)
  );
}

export function FilterModal({
  visible,
  onClose,
  facets,
  filters,
  onApply,
}: FilterModalProps) {
  const [draft, setDraft] = useState<ProductFilters>(filters);
  const { data: draftData, isLoading: countLoading } = useProducts(draft);
  const liveTotal = draftData?.total ?? 0;
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set([CHIP_FILTERS[0]?.key ?? '']),
  );

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => setDraft(filters), 0);
    return () => clearTimeout(id);
  }, [visible, filters]);

  function toggleChip(key: ChipFilterKey, value: string) {
    setDraft((d) => ({
      ...d,
      [key]: d[key] === value ? undefined : value,
      page: 1,
    }));
  }

  function toggleSection(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function reset() {
    setDraft({ sort: filters.sort, page: 1 });
  }

  function apply() {
    onApply(draft);
    onClose();
  }

  const activeFilters = activeCount(draft);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <SafeAreaView style={styles.inner} edges={['bottom']}>
            {/* Drag indicator */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Filtres</Text>
              <Pressable
                onPress={onClose}
                style={styles.closeBtn}
                accessibilityLabel="Fermer"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            {/* Sections */}
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {CHIP_FILTERS.map(({ key, label }) => {
                const options = facets?.[key] ?? [];
                if (options.length === 0) return null;
                const isOpen = expanded.has(key);
                const selected = draft[key];

                return (
                  <View key={key} style={styles.section}>
                    <Pressable
                      style={styles.sectionHeader}
                      onPress={() => toggleSection(key)}
                    >
                      <Text style={styles.sectionLabel}>{label}</Text>
                      <View style={styles.sectionRight}>
                        {selected && <View style={styles.activeDot} />}
                        <Ionicons
                          name={isOpen ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={colors.textSecondary}
                        />
                      </View>
                    </Pressable>

                    {isOpen && (
                      <View style={styles.chips}>
                        {options.map((option) => (
                          <Chip
                            key={option}
                            label={option}
                            selected={draft[key] === option}
                            onPress={() => toggleChip(key, option)}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Filtre e-bike */}
              <View style={styles.section}>
                <Pressable
                  style={styles.sectionHeader}
                  onPress={() => toggleSection('ebike')}
                >
                  <Text style={styles.sectionLabel}>E-Bike</Text>
                  <View style={styles.sectionRight}>
                    {draft.ebike && <View style={styles.activeDot} />}
                    <Ionicons
                      name={
                        expanded.has('ebike') ? 'chevron-up' : 'chevron-down'
                      }
                      size={18}
                      color={colors.textSecondary}
                    />
                  </View>
                </Pressable>
                {expanded.has('ebike') && (
                  <View style={styles.chips}>
                    <Chip
                      label="Compatible vélo électrique"
                      selected={Boolean(draft.ebike)}
                      onPress={() =>
                        setDraft((d) => ({
                          ...d,
                          ebike: d.ebike ? undefined : true,
                          page: 1,
                        }))
                      }
                    />
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Pressable
                style={styles.resetBtn}
                onPress={reset}
                disabled={activeFilters === 0}
              >
                <Text
                  style={[
                    styles.resetText,
                    activeFilters === 0 && styles.resetTextDisabled,
                  ]}
                >
                  Réinitialiser
                </Text>
              </Pressable>

              <Pressable style={styles.applyBtn} onPress={apply}>
                <Text style={styles.applyText}>
                  {countLoading
                    ? 'Chargement…'
                    : `Voir les résultats (${liveTotal})`}
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    height: '78%',
    borderTopLeftRadius: radius.xlarge,
    borderTopRightRadius: radius.xlarge,
    backgroundColor: colors.surfaceDefault,
    overflow: 'hidden',
    ...shadows.medium,
  },
  inner: {
    flex: 1,
  },
  handle: {
    alignSelf: 'center',
    marginTop: spacing[3],
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderDefault,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerTitle: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceCanvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
  },
  sectionLabel: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.brandBlue,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  resetBtn: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.large,
  },
  resetText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  resetTextDisabled: {
    color: colors.borderStrong,
  },
  applyBtn: {
    flex: 2,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.brandYellow,
  },
  applyText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.black,
    color: colors.textOnYellow,
  },
});
