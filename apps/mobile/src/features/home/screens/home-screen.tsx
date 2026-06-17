import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import logo from '../../../../assets/logo-michelin-race.png';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import { useAuth } from '../../auth/context/auth-context';
import { StatusCard } from '../../status/components/status-card';

export function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.welcome}>
            Bonjour, {user?.firstName ?? '—'} 👋
          </Text>
        </View>

        <Text style={styles.title}>Le même produit, partout.</Text>
        <Text style={styles.introduction}>
          Cette application Expo partage ses contrats et son client HTTP avec le
          frontend Next.js.
        </Text>

        <StatusCard />

        <View style={styles.feature}>
          <Text style={styles.featureIndex}>01</Text>
          <Text style={styles.featureTitle}>iOS et Android</Text>
          <Text style={styles.featureCopy}>
            Une base React Native commune, prête à être distribuée avec EAS.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceCanvas },
  content: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: 100,
    gap: spacing[6],
  },
  header: { gap: spacing[2] },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
  welcome: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  title: {
    maxWidth: 330,
    color: colors.textPrimary,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -3,
    lineHeight: 55,
  },
  introduction: {
    maxWidth: 340,
    color: colors.textSecondary,
    fontSize: fontSize.bodyLarge,
    lineHeight: 28,
  },
  feature: {
    minHeight: 210,
    padding: spacing[6],
    borderRadius: radius.xlarge,
    backgroundColor: colors.surfaceBrand,
  },
  featureIndex: {
    marginBottom: 56,
    color: colors.brandYellow,
    fontFamily: 'monospace',
    fontSize: fontSize.bodySmall,
  },
  featureTitle: {
    marginBottom: 10,
    color: colors.textOnBrand,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.black,
  },
  featureCopy: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: fontSize.body,
    lineHeight: 24,
  },
});
