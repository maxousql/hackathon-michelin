import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import { apiBaseUrl } from '../../../config/api';
import { useAuth } from '../../auth/context/auth-context';
import { AuthGate } from '../../../components/auth-gate';

type ProfileNav = BottomTabNavigationProp<AppTabParamList, 'Profile'>;

// ─── Strava types ──────────────────────────────────────────────────────────────

interface StravaBike {
  id: string;
  name: string;
  distance: number; // metres
  primary: boolean;
}

interface StravaAthlete {
  firstname: string;
  lastname: string;
  city: string | null;
  country: string | null;
  profile_medium?: string;
  bikes?: StravaBike[];
}

interface StravaActivity {
  sport_type: string;
  distance: number;
  total_elevation_gain: number;
  start_date_local: string;
}

interface StravaStats {
  dominantTerrain: string;
  avgDistanceKm: number;
  avgElevationM: number;
  weeklyRides: number;
}

function getSportTerrain(sportType: string): string {
  const s = sportType.toLowerCase();
  if (s.includes('mountain') || s.includes('mtb')) return 'VTT';
  if (s.includes('gravel') || s.includes('trail')) return 'Gravel';
  return 'Route';
}

function computeStats(activities: StravaActivity[]): StravaStats {
  if (activities.length === 0) {
    return {
      dominantTerrain: '–',
      avgDistanceKm: 0,
      avgElevationM: 0,
      weeklyRides: 0,
    };
  }

  const eightWeeksAgo = Date.now() - 8 * 7 * 24 * 60 * 60 * 1000;
  const recent = activities.filter(
    (a) => new Date(a.start_date_local).getTime() > eightWeeksAgo,
  );
  const weeklyRides = Math.round((recent.length / 8) * 10) / 10;

  const counts: Record<string, number> = {};
  for (const a of activities) {
    const t = getSportTerrain(a.sport_type);
    counts[t] = (counts[t] ?? 0) + 1;
  }
  const dominant =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Route';

  const avgDist = Math.round(
    activities.reduce((s, a) => s + a.distance, 0) / activities.length / 1000,
  );
  const avgElev = Math.round(
    activities.reduce((s, a) => s + a.total_elevation_gain, 0) /
      activities.length,
  );

  return {
    dominantTerrain: dominant,
    avgDistanceKm: avgDist,
    avgElevationM: avgElev,
    weeklyRides,
  };
}

// ─── Strava section ───────────────────────────────────────────────────────────

function StravaSection({ stravaToken }: { stravaToken: string }) {
  const { updateStravaPhoto } = useAuth();
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [stats, setStats] = useState<StravaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [athleteRes, activitiesRes] = await Promise.all([
          fetch(`${apiBaseUrl}/strava/athlete`, {
            headers: { 'x-strava-token': stravaToken },
          }),
          fetch(`${apiBaseUrl}/strava/activities`, {
            headers: { 'x-strava-token': stravaToken },
          }),
        ]);

        if (!athleteRes.ok || !activitiesRes.ok) throw new Error();
        const [athleteData, activitiesData] = await Promise.all([
          athleteRes.json() as Promise<StravaAthlete>,
          activitiesRes.json() as Promise<StravaActivity[]>,
        ]);

        if (active) {
          setAthlete(athleteData);
          setStats(
            computeStats(Array.isArray(activitiesData) ? activitiesData : []),
          );
          if (athleteData.profile_medium)
            void updateStravaPhoto(athleteData.profile_medium);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [stravaToken, updateStravaPhoto]);

  if (loading) {
    return (
      <View style={stravaStyles.card}>
        <View style={stravaStyles.header}>
          <View
            style={[stravaStyles.stravaDot, { backgroundColor: '#FC4C02' }]}
          />
          <Text style={stravaStyles.title}>Strava</Text>
        </View>
        <ActivityIndicator
          size="small"
          color={colors.brandBlue}
          style={{ marginTop: spacing[4] }}
        />
      </View>
    );
  }

  if (error || !athlete) {
    return (
      <View style={stravaStyles.card}>
        <View style={stravaStyles.header}>
          <View
            style={[stravaStyles.stravaDot, { backgroundColor: '#FC4C02' }]}
          />
          <Text style={stravaStyles.title}>Strava</Text>
        </View>
        <Text style={stravaStyles.errorText}>
          Impossible de charger les données Strava.
        </Text>
      </View>
    );
  }

  return (
    <View style={stravaStyles.card}>
      {/* Header */}
      <View style={stravaStyles.header}>
        <View style={stravaStyles.headerTop}>
          {athlete.profile_medium ? (
            <Image
              source={{ uri: athlete.profile_medium }}
              style={stravaStyles.photo}
              accessibilityLabel={`${athlete.firstname} ${athlete.lastname}`}
            />
          ) : (
            <View style={stravaStyles.photoPlaceholder}>
              <Ionicons
                name="person-outline"
                size={22}
                color={colors.textSecondary}
              />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={stravaStyles.titleRow}>
              <View
                style={[stravaStyles.stravaDot, { backgroundColor: '#FC4C02' }]}
              />
              <Text style={stravaStyles.title}>Strava</Text>
            </View>
            <Text style={stravaStyles.athleteName}>
              {athlete.firstname} {athlete.lastname}
            </Text>
            {athlete.city ? (
              <View style={stravaStyles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text style={stravaStyles.location}>
                  {athlete.city}
                  {athlete.country ? `, ${athlete.country}` : ''}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Stats row */}
      {stats ? (
        <View style={stravaStyles.statsRow}>
          <View style={stravaStyles.statItem}>
            <Text style={stravaStyles.statValue}>{stats.weeklyRides}</Text>
            <Text style={stravaStyles.statLabel}>sorties/sem.</Text>
          </View>
          <View style={stravaStyles.statDivider} />
          <View style={stravaStyles.statItem}>
            <Text style={stravaStyles.statValue}>{stats.avgDistanceKm} km</Text>
            <Text style={stravaStyles.statLabel}>dist. moy.</Text>
          </View>
          <View style={stravaStyles.statDivider} />
          <View style={stravaStyles.statItem}>
            <Text style={stravaStyles.statValue}>{stats.avgElevationM} m</Text>
            <Text style={stravaStyles.statLabel}>D+ moy.</Text>
          </View>
          <View style={stravaStyles.statDivider} />
          <View style={stravaStyles.statItem}>
            <Text style={stravaStyles.statValue}>{stats.dominantTerrain}</Text>
            <Text style={stravaStyles.statLabel}>terrain</Text>
          </View>
        </View>
      ) : null}

      {/* Bikes */}
      {(athlete.bikes ?? []).length > 0 ? (
        <View style={stravaStyles.bikesList}>
          <Text style={stravaStyles.bikesTitle}>Mes vélos</Text>
          {(athlete.bikes ?? []).map((bike) => (
            <View key={bike.id} style={stravaStyles.bikeRow}>
              <Ionicons
                name="bicycle-outline"
                size={18}
                color={bike.primary ? '#FC4C02' : colors.textSecondary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    stravaStyles.bikeName,
                    bike.primary && stravaStyles.bikePrimary,
                  ]}
                >
                  {bike.name}
                  {bike.primary ? '  ★' : ''}
                </Text>
                <Text style={stravaStyles.bikeDist}>
                  {Math.round(bike.distance / 1000).toLocaleString('fr-FR')} km
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const stravaStyles = StyleSheet.create({
  card: {
    borderRadius: radius.xlarge,
    backgroundColor: colors.surfaceDefault,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.low,
  },
  header: { gap: spacing[2] },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  photo: { width: 52, height: 52, borderRadius: 26 },
  photoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceCanvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: 2,
  },
  stravaDot: { width: 8, height: 8, borderRadius: 4 },
  title: {
    color: '#FC4C02',
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  athleteName: {
    color: colors.textPrimary,
    fontSize: fontSize.bodyLarge,
    fontWeight: fontWeight.black,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  location: { color: colors.textSecondary, fontSize: fontSize.caption },
  errorText: { color: colors.textSecondary, fontSize: fontSize.bodySmall },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.large,
    padding: spacing[3],
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: {
    color: colors.textPrimary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.black,
  },
  statLabel: { color: colors.textSecondary, fontSize: 10, textAlign: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: colors.borderDefault },
  bikesTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  bikesList: { gap: spacing[2] },
  bikeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  bikeName: {
    color: colors.textPrimary,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
  },
  bikePrimary: { color: '#FC4C02' },
  bikeDist: { color: colors.textSecondary, fontSize: fontSize.caption },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const { token, user, logout, stravaToken, stravaPhotoUrl } = useAuth();
  const navigation = useNavigation<ProfileNav>();

  if (!token)
    return <AuthGate label="Connectez-vous pour accéder à votre profil." />;

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
          {stravaPhotoUrl ? (
            <Image
              source={{ uri: stravaPhotoUrl }}
              style={styles.avatarPhoto}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.isAdmin ? (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Administrateur</Text>
            </View>
          ) : null}
        </View>

        {/* Strava */}
        {stravaToken ? <StravaSection stravaToken={stravaToken} /> : null}

        {/* Actions */}
        <View style={styles.section}>
          {user?.isAdmin ? (
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
          ) : null}

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
  avatarPhoto: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
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
  email: { color: colors.textSecondary, fontSize: fontSize.body },
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
  rowDanger: { borderBottomWidth: 0 },
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
