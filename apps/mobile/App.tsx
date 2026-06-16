import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CatalogScreen } from './src/features/products/components/catalog-screen';
import { ProductDetailScreen } from './src/features/products/components/product-detail-screen';
import { StatusCard } from './src/features/status/components/status-card';
import { colors, fontSize, fontWeight, radius, spacing } from './src/theme';

type Route =
  | { name: 'home' }
  | { name: 'catalog' }
  | { name: 'detail'; id: number };

function HomeScreen({ onOpenCatalog }: { onOpenCatalog: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.homeContent}>
      <Text style={styles.eyebrow}>HACKATHON MICHELIN</Text>
      <Text style={styles.title}>Le même produit, partout.</Text>
      <Text style={styles.intro}>
        Cette application Expo partage ses contrats et son client HTTP avec le
        frontend Next.js.
      </Text>

      <StatusCard />

      <Pressable
        onPress={onOpenCatalog}
        accessibilityRole="button"
        style={styles.cta}
      >
        <Text style={styles.ctaText}>Explorer le catalogue</Text>
      </Pressable>
    </ScrollView>
  );
}

export default function App() {
  // Navigation minimale par état, sans librairie de routing.
  const [route, setRoute] = useState<Route>({ name: 'home' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.wordmark}>MICHELIN</Text>
        <Text style={styles.product}>Ride ID</Text>
      </View>

      {route.name === 'home' ? (
        <HomeScreen onOpenCatalog={() => setRoute({ name: 'catalog' })} />
      ) : route.name === 'catalog' ? (
        <CatalogScreen onSelect={(id) => setRoute({ name: 'detail', id })} />
      ) : (
        <ProductDetailScreen
          id={route.id}
          onBack={() => setRoute({ name: 'catalog' })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceCanvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[2],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    backgroundColor: colors.surfaceDefault,
  },
  wordmark: {
    fontSize: fontSize.h4,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
    color: colors.brandDarkBlue,
  },
  product: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.brandBlue,
  },
  homeContent: {
    padding: spacing[6],
    gap: spacing[6],
  },
  eyebrow: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    color: colors.brandBlue,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.black,
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  intro: {
    fontSize: fontSize.bodyLarge,
    lineHeight: 28,
    color: colors.textSecondary,
  },
  cta: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    borderRadius: radius.medium,
    backgroundColor: colors.brandBlue,
  },
  ctaText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.textOnBrand,
  },
});
