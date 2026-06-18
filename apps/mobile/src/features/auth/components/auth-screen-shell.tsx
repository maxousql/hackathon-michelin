import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import logo from '../../../../assets/logo-michelin-race.png';

import { colors, radius, spacing } from '../../../theme';

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
}

export function AuthScreenShell({
  title,
  subtitle,
  children,
  footer,
  onBack,
}: Props) {
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
            {onBack ? (
              <Pressable
                style={styles.backBtn}
                onPress={onBack}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Retour"
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color="rgba(255,255,255,0.8)"
                />
              </Pressable>
            ) : null}
            <View style={styles.logoBadge}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSubtitle}>{subtitle}</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>{children}</View>
        </ScrollView>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceDefault },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  hero: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[10],
    paddingBottom: spacing[8],
    backgroundColor: colors.brandMidnight,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: spacing[4],
    left: spacing[4],
    zIndex: 1,
    padding: spacing[2],
  },
  logoBadge: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.xlarge,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  logo: {
    width: 140,
    height: 140,
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
    paddingBottom: spacing[6],
    borderTopLeftRadius: radius.xlarge,
    borderTopRightRadius: radius.xlarge,
    backgroundColor: colors.surfaceDefault,
    gap: spacing[4],
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    backgroundColor: colors.surfaceDefault,
    alignItems: 'center',
  },
});
