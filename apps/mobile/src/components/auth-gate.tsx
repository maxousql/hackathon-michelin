import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

const TAB_BAR_HEIGHT = 68 + 16; // pill height + bottom margin

export function AuthGate({ label }: { label?: string }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 16) + TAB_BAR_HEIGHT,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name="lock-closed-outline"
          size={32}
          color={colors.brandBlue}
        />
      </View>
      <Text style={styles.title}>Connexion requise</Text>
      <Text style={styles.sub}>
        {label ??
          'Connectez-vous avec votre compte ou via Strava pour accéder à cette fonctionnalité.'}
      </Text>
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
        onPress={() => navigation.navigate('Auth')}
      >
        <Ionicons name="person-outline" size={16} color={colors.base.white} />
        <Text style={styles.btnText}>Se connecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    gap: spacing[4],
    backgroundColor: colors.surfaceCanvas,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(39,80,155,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.black,
    textAlign: 'center',
  },
  sub: {
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.brandBlue,
    borderRadius: radius.large,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    marginTop: spacing[2],
  },
  btnText: {
    color: colors.base.white,
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
  },
});
