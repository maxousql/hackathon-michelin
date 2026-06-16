import type { ProductListItem } from '@michelin/contracts';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import {
  productCycleType,
  productName,
  productRange,
  productSize,
  productTags,
} from '../presenter';

interface ProductCardProps {
  product: ProductListItem;
  onPress: (id: number) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const cycleType = productCycleType(product);
  const name = productName(product);
  const range = productRange(product);
  const size = productSize(product);
  const tags = productTags(product);

  return (
    <Pressable
      onPress={() => onPress(product.id)}
      accessibilityRole="button"
      style={styles.card}
    >
      {cycleType ? <Text style={styles.cycleType}>{cycleType}</Text> : null}
      <Text style={styles.name}>{name}</Text>
      {range && range !== name ? (
        <Text style={styles.range}>{range}</Text>
      ) : null}
      {size ? <Text style={styles.size}>{size}</Text> : null}

      {tags.length > 0 ? (
        <View style={styles.tags}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[6],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.large,
    backgroundColor: colors.surfaceDefault,
  },
  cycleType: {
    marginBottom: spacing[1],
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
    color: colors.brandBlue,
  },
  name: {
    fontSize: fontSize.h4,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  range: {
    marginTop: spacing[1],
    fontSize: fontSize.bodySmall,
    color: colors.textSecondary,
  },
  size: {
    marginTop: spacing[1],
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  tag: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  tagText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
});
