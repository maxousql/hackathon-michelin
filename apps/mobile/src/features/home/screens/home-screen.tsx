import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/app-button';
import { colors, spacing } from '../../../theme';
import { useAuth } from '../../auth/context/auth-context';
import { StatusCard } from '../../status/components/status-card';

export function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>HACKATHON MICHELIN</Text>
            <Text style={styles.welcome}>
              Bonjour, {user?.firstName ?? '—'} 👋
            </Text>
          </View>
          <AppButton title="Déconnexion" onPress={logout} variant="outline" />
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  eyebrow: {
    marginBottom: 4,
    color: colors.blue,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  welcome: { color: colors.dark, fontSize: 16, fontWeight: '600' },
  title: {
    maxWidth: 330,
    marginBottom: 20,
    color: colors.dark,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -3,
    lineHeight: 55,
  },
  introduction: {
    maxWidth: 340,
    marginBottom: 36,
    color: colors.muted,
    fontSize: 18,
    lineHeight: 28,
  },
  feature: {
    minHeight: 210,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 22,
    backgroundColor: colors.darkCardBg,
  },
  featureIndex: {
    marginBottom: 56,
    color: colors.yellow,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  featureTitle: {
    marginBottom: 10,
    color: colors.darkCardText,
    fontSize: 24,
    fontWeight: '800',
  },
  featureCopy: {
    color: colors.darkCardSubtext,
    fontSize: 16,
    lineHeight: 24,
  },
});
