import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '../../../theme';

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthScreenShell({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branded header */}
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>MICHELIN RACE</Text>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSubtitle}>{subtitle}</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.brandMidnight },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  hero: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[10],
    paddingBottom: spacing[8],
    backgroundColor: colors.brandMidnight,
  },
  eyebrow: {
    marginBottom: spacing[3],
    color: colors.brandYellow,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  heroTitle: {
    marginBottom: spacing[2],
    color: colors.textOnBrand,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 44,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 16,
    lineHeight: 24,
  },

  card: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[12],
    borderTopLeftRadius: radius.xlarge,
    borderTopRightRadius: radius.xlarge,
    backgroundColor: colors.surfaceDefault,
    gap: spacing[4],
  },
});
