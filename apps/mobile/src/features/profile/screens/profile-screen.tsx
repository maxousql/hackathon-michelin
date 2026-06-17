import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AppTabParamList } from '../../../navigation/types';
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadows,
  spacing,
} from '../../../theme';
import { useAuth } from '../../auth/context/auth-context';

type ProfileNav = BottomTabNavigationProp<AppTabParamList, 'Profile'>;

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<ProfileNav>();

  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() ||
    '?';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Mon profil</Text>

        {/* Avatar + identité */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Administrateur</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          {user?.isAdmin && (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
              onPress={() => navigation.navigate('Admin')}
            >
              <View style={[styles.rowIcon, styles.rowIconBlue]}>
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={colors.brandBlue}
                />
              </View>
              <Text style={styles.rowLabel}>Back Office</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.borderStrong}
              />
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.row,
              styles.rowDanger,
              pressed && styles.rowPressed,
            ]}
            onPress={() => void logout()}
          >
            <View style={[styles.rowIcon, styles.rowIconRed]}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.stateError}
              />
            </View>
            <Text style={styles.rowLabelDanger}>Se déconnecter</Text>
          </Pressable>
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
  pageTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.h2,
    fontWeight: fontWeight.black,
    letterSpacing: -1,
  },

  card: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
    borderRadius: radius.xlarge,
    backgroundColor: colors.surfaceDefault,
    gap: spacing[2],
    ...shadows.low,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.brandDarkBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    color: colors.textOnBrand,
    fontSize: 26,
    fontWeight: fontWeight.black,
  },
  name: {
    color: colors.textPrimary,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.black,
  },
  email: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
  },
  adminBadge: {
    marginTop: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.brandYellow,
  },
  adminBadgeText: {
    color: colors.textOnYellow,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },

  section: {
    borderRadius: radius.xlarge,
    backgroundColor: colors.surfaceDefault,
    overflow: 'hidden',
    ...shadows.low,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  rowDanger: {
    borderBottomWidth: 0,
  },
  rowPressed: { backgroundColor: colors.surfaceCanvas },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconBlue: { backgroundColor: 'rgba(39,80,155,0.10)' },
  rowIconRed: { backgroundColor: 'rgba(179,38,30,0.10)' },
  rowLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
  },
  rowLabelDanger: {
    flex: 1,
    color: colors.stateError,
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
  },
});
