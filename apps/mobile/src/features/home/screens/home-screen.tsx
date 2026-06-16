import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/app-button';
import type { AppStackParamList } from '../../../navigation/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import { useAuth } from '../../auth/context/auth-context';
import { UserMenu } from '../../auth/components/user-menu';
import { StatusCard } from '../../status/components/status-card';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>HACKATHON MICHELIN</Text>
            <Text style={styles.welcome}>
              Bonjour, {user?.firstName ?? '—'} 👋
            </Text>
          </View>
          <UserMenu />
        </View>

        <Text style={styles.title}>Le même produit, partout.</Text>
        <Text style={styles.introduction}>
          Cette application Expo partage ses contrats et son client HTTP avec le
          frontend Next.js.
        </Text>

        <StatusCard />

        <AppButton
          title="Explorer le catalogue"
          onPress={() => navigation.navigate('Catalog')}
        />

        <AppButton
          title="Reprise MICHELIN"
          variant="outline"
          onPress={() => navigation.navigate('Reprise')}
        />

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
    paddingVertical: spacing[8],
    gap: spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    marginBottom: 4,
    color: colors.brandBlue,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
  },
  welcome: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
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
