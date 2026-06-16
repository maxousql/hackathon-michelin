import { createApiClient } from '@michelin/api-client';
import type { AdminUser } from '@michelin/contracts';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiBaseUrl } from '../../../config/api';
import type { AppStackParamList } from '../../../navigation/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import { useAuth } from '../../auth/context/auth-context';

type Props = NativeStackScreenProps<AppStackParamList, 'AdminUsers'>;

const adminClient = createApiClient({ baseUrl: apiBaseUrl });

export function AdminUsersScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);
  const loadUsers = () => setRetryCount((c) => c + 1);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    adminClient
      .getAdminUsers(token)
      .then((data) => {
        if (!cancelled) {
          setUsers(data);
          setLoading(false);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Impossible de charger les utilisateurs.');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, retryCount]);

  const handleToggleAdmin = async (user: AdminUser) => {
    if (!token || actionPending) return;
    setActionPending(user.id);
    try {
      await adminClient.updateAdminUser(token, user.id, !user.isAdmin);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isAdmin: !user.isAdmin } : u,
        ),
      );
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier les droits.');
    } finally {
      setActionPending(null);
    }
  };

  const handleDelete = (user: AdminUser) => {
    Alert.alert(
      "Supprimer l'utilisateur",
      `Supprimer ${user.firstName} ${user.lastName} ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!token || actionPending) return;
            setActionPending(user.id);
            try {
              await adminClient.deleteAdminUser(token, user.id);
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
            } catch {
              Alert.alert('Erreur', "Impossible de supprimer l'utilisateur.");
            } finally {
              setActionPending(null);
            }
          },
        },
      ],
    );
  };

  const getInitials = (u: AdminUser) =>
    `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.eyebrow}>BACK OFFICE</Text>
          <Text style={styles.headerTitle}>Utilisateurs</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandBlue} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadUsers} style={styles.retryButton}>
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item: user }) => {
            const busy = actionPending === user.id;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(user)}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>
                        {user.firstName} {user.lastName}
                      </Text>
                      {user.isAdmin && (
                        <View style={styles.adminBadge}>
                          <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.email} numberOfLines={1}>
                      {user.email}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.actionBtnOutline,
                      (pressed || busy) && styles.actionBtnPressed,
                    ]}
                    disabled={busy}
                    onPress={() => handleToggleAdmin(user)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.actionBtnOutlineText}>
                      {user.isAdmin ? 'Retirer admin' : 'Passer admin'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.actionBtnDanger,
                      (pressed || busy) && styles.actionBtnPressed,
                    ]}
                    disabled={busy}
                    onPress={() => handleDelete(user)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.actionBtnDangerText}>Supprimer</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceCanvas },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    backgroundColor: colors.surfaceDefault,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceCanvas,
  },
  backIcon: { fontSize: 20, color: colors.textPrimary },
  eyebrow: {
    color: colors.brandBlue,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.black,
    letterSpacing: -0.5,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  errorText: { color: colors.stateError, fontSize: fontSize.body },
  retryButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: radius.medium,
    backgroundColor: colors.brandBlue,
  },
  retryText: { color: colors.textOnBrand, fontWeight: '700' },

  list: { padding: spacing[4], gap: spacing[3] },
  separator: { height: 0 },

  card: {
    padding: spacing[4],
    borderRadius: radius.large,
    backgroundColor: colors.surfaceDefault,
    gap: spacing[3],
    shadowColor: colors.brandMidnight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.brandDarkBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.textOnBrand, fontSize: 15, fontWeight: '700' },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  name: {
    color: colors.textPrimary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
  },
  adminBadge: {
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
  email: {
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
    marginTop: 2,
  },

  actions: { flexDirection: 'row', gap: spacing[2] },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing[2],
    borderRadius: radius.medium,
    alignItems: 'center',
  },
  actionBtnOutline: {
    borderWidth: 1.5,
    borderColor: colors.brandBlue,
  },
  actionBtnOutlineText: {
    color: colors.brandBlue,
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnDanger: {
    borderWidth: 1.5,
    borderColor: colors.stateError,
  },
  actionBtnDangerText: {
    color: colors.stateError,
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnPressed: { opacity: 0.5 },
});
