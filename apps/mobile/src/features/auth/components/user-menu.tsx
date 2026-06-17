import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppTabParamList } from '../../../navigation/types';
import { colors, radius, shadows, spacing } from '../../../theme';
import { useAuth } from '../context/auth-context';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
  const [visible, setVisible] = useState(false);

  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() ||
    '?';

  return (
    <>
      <Pressable
        accessibilityLabel="Menu utilisateur"
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed,
        ]}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.initials}>{initials}</Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          {/* stopPropagation so tapping inside the card doesn't close the modal */}
          <Pressable style={styles.card} onPress={() => {}}>
            {/* User info */}
            <View style={styles.infoRow}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoName} numberOfLines={1}>
                  {user?.firstName} {user?.lastName}
                </Text>
                {user?.isAdmin && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            {user?.isAdmin && (
              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => {
                  setVisible(false);
                  navigation.navigate('Admin');
                }}
              >
                <Text style={styles.menuItemIcon}>⚙</Text>
                <Text style={styles.menuItemText}>Back Office</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                styles.menuItemDanger,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => {
                setVisible(false);
                void logout();
              }}
            >
              <Text style={styles.menuItemIcon}>↩</Text>
              <Text style={styles.menuItemDangerText}>Se déconnecter</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.brandDarkBlue,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.low,
  },
  triggerPressed: { opacity: 0.75 },
  initials: {
    color: colors.textOnBrand,
    fontSize: 14,
    fontWeight: '800',
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,12,52,0.35)',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 56,
    paddingRight: spacing[4],
  },
  card: {
    width: 240,
    borderRadius: radius.large,
    backgroundColor: colors.surfaceDefault,
    overflow: 'hidden',
    ...shadows.medium,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
  },
  avatarLarge: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.brandDarkBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.textOnBrand, fontSize: 15, fontWeight: '800' },
  infoText: { flex: 1, gap: 4 },
  infoName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  adminBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.brandYellow,
  },
  adminBadgeText: {
    color: colors.textOnYellow,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderDefault,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  menuItemPressed: { backgroundColor: colors.surfaceCanvas },
  menuItemDanger: {},
  menuItemIcon: { fontSize: 16, color: colors.textSecondary },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  menuItemDangerText: {
    color: colors.stateError,
    fontSize: 14,
    fontWeight: '600',
  },
});
