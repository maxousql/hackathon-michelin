import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Bike, SavedRace } from '@michelin/contracts';
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
import { toast } from '../../../utils/toast';
import { profileClient } from '../api';

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

// ─── Tire recommendation helper ──────────────────────────────────────────────

function getTireRec(
  type: string,
  distanceKm: number,
): { name: string; sub: string } {
  if (type === 'mtb')
    return {
      name: 'Michelin Wild Enduro',
      sub: 'Accroche maximale · Terrain technique',
    };
  if (type === 'gravel')
    return {
      name: 'Michelin Power Gravel',
      sub: 'Polyvalence · Confort sur mixte',
    };
  if (distanceKm > 10000)
    return {
      name: 'Michelin Pro4 Endurance V2',
      sub: 'Longévité maximale · Anti-crevaison',
    };
  return {
    name: 'Michelin Power Cup 2',
    sub: 'Performance · Adhérence en compétition',
  };
}

const BIKE_TYPE_LABELS: Record<string, string> = {
  road: 'Route',
  mtb: 'VTT',
  gravel: 'Gravel',
};

const BIKE_TYPES = [
  {
    value: 'road' as const,
    label: 'Route',
    icon: 'navigate-outline' as const,
    desc: 'Asphalte & bitume',
  },
  {
    value: 'gravel' as const,
    label: 'Gravel',
    icon: 'earth-outline' as const,
    desc: 'Mixte & chemins',
  },
  {
    value: 'mtb' as const,
    label: 'VTT',
    icon: 'leaf-outline' as const,
    desc: 'Terrain & sentiers',
  },
];

// ─── Manual bikes section ────────────────────────────────────────────────────

function ManualBikesSection() {
  const { token } = useAuth();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [addName, setAddName] = useState('');
  const [addType, setAddType] = useState<'road' | 'mtb' | 'gravel'>('road');
  const [addKm, setAddKm] = useState('');
  const [addPrimary, setAddPrimary] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    profileClient
      .getBikes(token)
      .then((data) => {
        if (active) setBikes(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  function openAdd() {
    setAddName('');
    setAddType('road');
    setAddKm('');
    setAddPrimary(false);
    setModalStep(1);
    setShowAdd(true);
  }

  async function handleAdd() {
    if (!token || !addName.trim() || adding) return;
    setAdding(true);
    try {
      const created = await profileClient.createBike(token, {
        name: addName.trim(),
        type: addType,
        distanceKm: parseInt(addKm, 10) || 0,
        isPrimary: addPrimary,
      });
      setBikes((prev) =>
        addPrimary
          ? [created, ...prev.map((b) => ({ ...b, isPrimary: false }))]
          : [...prev, created],
      );
      setShowAdd(false);
      toast.success(`${addName.trim()} ajouté !`, 'Vélo enregistré');
    } catch {
      toast.error("Impossible d'ajouter ce vélo.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    await profileClient.deleteBike(token, id).catch(() => {});
    setBikes((prev) => prev.filter((b) => b.id !== id));
  }

  if (loading) return null;

  return (
    <View style={bikeStyles.section}>
      <View style={bikeStyles.header}>
        <Text style={bikeStyles.title}>Mes vélos</Text>
        <Pressable onPress={openAdd} style={bikeStyles.addBtn}>
          <Ionicons name="add" size={16} color={colors.brandBlue} />
          <Text style={bikeStyles.addBtnText}>Ajouter</Text>
        </Pressable>
      </View>

      {bikes.length === 0 ? (
        <Text style={bikeStyles.empty}>
          Aucun vélo enregistré. Ajoute ton premier vélo !
        </Text>
      ) : (
        bikes.map((bike) => {
          const rec = getTireRec(bike.type, bike.distanceKm);
          return (
            <View
              key={bike.id}
              style={[
                bikeStyles.card,
                bike.isPrimary && bikeStyles.cardPrimary,
              ]}
            >
              <Ionicons
                name="bicycle-outline"
                size={22}
                color={bike.isPrimary ? colors.brandBlue : colors.textSecondary}
              />
              <View style={{ flex: 1 }}>
                <View style={bikeStyles.nameRow}>
                  <Text style={bikeStyles.bikeName}>{bike.name}</Text>
                  {bike.isPrimary && (
                    <View style={bikeStyles.primaryBadge}>
                      <Text style={bikeStyles.primaryBadgeText}>Principal</Text>
                    </View>
                  )}
                  <View style={bikeStyles.typeBadge}>
                    <Text style={bikeStyles.typeBadgeText}>
                      {BIKE_TYPE_LABELS[bike.type] ?? bike.type}
                    </Text>
                  </View>
                </View>
                <Text style={bikeStyles.bikeDist}>
                  {bike.distanceKm.toLocaleString('fr-FR')} km parcourus
                </Text>
                <Text style={bikeStyles.recName}>{rec.name}</Text>
                <Text style={bikeStyles.recSub}>{rec.sub}</Text>
              </View>
              <Pressable onPress={() => void handleDelete(bike.id)} hitSlop={8}>
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          );
        })
      )}

      <Modal
        visible={showAdd}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAdd(false)}
      >
        <SafeAreaView style={bikeModalStyles.safe}>
          {/* Step header */}
          <View style={bikeModalStyles.stepHeader}>
            <Pressable
              onPress={
                modalStep === 1
                  ? () => setShowAdd(false)
                  : () => setModalStep(1)
              }
              style={bikeModalStyles.backBtn}
              hitSlop={8}
            >
              <Ionicons
                name={modalStep === 1 ? 'close' : 'arrow-back'}
                size={22}
                color={colors.textPrimary}
              />
            </Pressable>
            <View style={bikeModalStyles.progressBar}>
              {[0, 1].map((i) => (
                <View
                  key={i}
                  style={[
                    bikeModalStyles.progressDot,
                    i < modalStep && bikeModalStyles.progressDotActive,
                  ]}
                />
              ))}
            </View>
            <Text style={bikeModalStyles.stepCount}>{modalStep}/2</Text>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={bikeModalStyles.content}
              keyboardShouldPersistTaps="handled"
            >
              {modalStep === 1 ? (
                <View style={bikeModalStyles.stepBody}>
                  <Text style={bikeModalStyles.eyebrow}>ÉTAPE 1</Text>
                  <Text style={bikeModalStyles.stepTitle}>
                    Quel est ton vélo ?
                  </Text>
                  <View style={bikeModalStyles.choiceGrid}>
                    {BIKE_TYPES.map((bt) => (
                      <Pressable
                        key={bt.value}
                        style={[
                          bikeModalStyles.choiceCard,
                          addType === bt.value &&
                            bikeModalStyles.choiceCardActive,
                        ]}
                        onPress={() => {
                          setAddType(bt.value);
                          setModalStep(2);
                        }}
                      >
                        <Ionicons
                          name={bt.icon}
                          size={28}
                          color={
                            addType === bt.value
                              ? colors.brandBlue
                              : colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            bikeModalStyles.choiceLabel,
                            addType === bt.value &&
                              bikeModalStyles.choiceLabelActive,
                          ]}
                          adjustsFontSizeToFit
                          numberOfLines={1}
                        >
                          {bt.label}
                        </Text>
                        <Text style={bikeModalStyles.choiceDesc}>
                          {bt.desc}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={bikeModalStyles.stepBody}>
                  <Text style={bikeModalStyles.eyebrow}>ÉTAPE 2</Text>
                  <Text style={bikeModalStyles.stepTitle}>Les détails</Text>

                  <View style={bikeModalStyles.field}>
                    <Text style={bikeModalStyles.fieldLabel}>Nom du vélo</Text>
                    <View style={bikeModalStyles.inputRow}>
                      <Ionicons
                        name="bicycle-outline"
                        size={18}
                        color={colors.textSecondary}
                        style={bikeModalStyles.inputIcon}
                      />
                      <TextInput
                        style={bikeModalStyles.inputWithIcon}
                        value={addName}
                        onChangeText={setAddName}
                        placeholder="ex. Trek Domane SL6"
                        placeholderTextColor={colors.borderStrong}
                        autoFocus
                        returnKeyType="next"
                        maxLength={100}
                      />
                    </View>
                  </View>

                  <View style={bikeModalStyles.field}>
                    <Text style={bikeModalStyles.fieldLabel}>
                      Kilométrage actuel
                    </Text>
                    <View style={bikeModalStyles.inputRow}>
                      <Ionicons
                        name="speedometer-outline"
                        size={18}
                        color={colors.textSecondary}
                        style={bikeModalStyles.inputIcon}
                      />
                      <TextInput
                        style={bikeModalStyles.inputWithIcon}
                        value={addKm}
                        onChangeText={setAddKm}
                        placeholder="0"
                        placeholderTextColor={colors.borderStrong}
                        keyboardType="number-pad"
                        returnKeyType="done"
                      />
                      <Text style={bikeModalStyles.inputUnit}>km</Text>
                    </View>
                  </View>

                  <Pressable
                    style={bikeModalStyles.primaryToggle}
                    onPress={() => setAddPrimary((p) => !p)}
                  >
                    <View
                      style={[
                        bikeModalStyles.checkbox,
                        addPrimary && bikeModalStyles.checkboxActive,
                      ]}
                    >
                      {addPrimary && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </View>
                    <Text style={bikeModalStyles.toggleText}>
                      Définir comme vélo principal
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      bikeModalStyles.nextBtn,
                      (!addName.trim() || adding) &&
                        bikeModalStyles.nextBtnDisabled,
                    ]}
                    onPress={() => void handleAdd()}
                    disabled={!addName.trim() || adding}
                  >
                    <Text style={bikeModalStyles.nextBtnText}>
                      {adding ? 'Ajout…' : 'Ajouter mon vélo'}
                    </Text>
                    {!adding && (
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={colors.textOnBrand}
                      />
                    )}
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const bikeStyles = StyleSheet.create({
  section: {
    borderRadius: radius.xlarge,
    backgroundColor: colors.surfaceDefault,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.low,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.brandBlue,
  },
  addBtnText: {
    color: colors.brandBlue,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfaceCanvas,
  },
  cardPrimary: {
    borderColor: colors.brandBlue,
    backgroundColor: 'rgba(39,80,155,0.05)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    flexWrap: 'wrap',
  },
  bikeName: {
    color: colors.textPrimary,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.black,
  },
  primaryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
    backgroundColor: colors.brandBlue,
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceDefault,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  typeBadgeText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  bikeDist: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    marginTop: 2,
  },
  recName: {
    color: colors.brandBlue,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    marginTop: spacing[1],
  },
  recSub: {
    color: colors.textSecondary,
    fontSize: 10,
  },
});

const bikeModalStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceDefault },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: { flex: 1, flexDirection: 'row', gap: spacing[2] },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderDefault,
  },
  progressDotActive: { backgroundColor: colors.brandBlue },
  stepCount: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    minWidth: 28,
    textAlign: 'right',
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingBottom: 48,
  },
  stepBody: { gap: spacing[6] },
  eyebrow: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    color: colors.brandBlue,
  },
  stepTitle: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  choiceGrid: { flexDirection: 'row', gap: spacing[3] },
  choiceCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[2],
    borderRadius: radius.xlarge,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfaceCanvas,
    gap: spacing[2],
    ...shadows.low,
  },
  choiceCardActive: {
    borderColor: colors.brandBlue,
    backgroundColor: 'rgba(39,80,155,0.06)',
  },
  choiceLabel: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  choiceLabelActive: { color: colors.brandBlue },
  choiceDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  field: { gap: spacing[2] },
  fieldLabel: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceCanvas,
    paddingHorizontal: spacing[3],
    minHeight: 52,
  },
  inputIcon: { marginRight: spacing[2] },
  inputWithIcon: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    paddingVertical: spacing[3],
  },
  inputUnit: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  primaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.brandBlue,
    borderColor: colors.brandBlue,
  },
  toggleText: {
    color: colors.textPrimary,
    fontSize: fontSize.bodySmall,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.large,
    backgroundColor: colors.brandBlue,
    marginTop: spacing[2],
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.textOnBrand,
  },
});

// ─── Saved races section ──────────────────────────────────────────────────────

function SavedRacesSection() {
  const { token } = useAuth();
  const [races, setRaces] = useState<SavedRace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let active = true;
    profileClient
      .getSavedRaces(token)
      .then((data) => {
        if (active) setRaces(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function handleDelete(id: string) {
    if (!token) return;
    await profileClient.deleteSavedRace(token, id).catch(() => {});
    setRaces((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading || races.length === 0) return null;

  return (
    <View style={raceStyles.section}>
      <Text style={raceStyles.title}>Mes prochaines courses</Text>
      {races.map((race) => (
        <View key={race.id} style={raceStyles.card}>
          <View style={raceStyles.cardLeft}>
            <Ionicons
              name="flag-outline"
              size={20}
              color={colors.brandBlue}
              style={{ marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={raceStyles.raceName}>{race.raceName}</Text>
              <Text style={raceStyles.raceMeta}>
                {new Date(race.raceDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {'  ·  '}
                {race.locationName}
              </Text>
              <Text style={raceStyles.raceMeta}>
                {race.distanceKm} km · ↑ {race.elevationGainM} m
              </Text>
              <Text style={raceStyles.tireName}>{race.result.tire.name}</Text>
              <Text style={raceStyles.pressure}>
                {race.result.pressure.frontBar} / {race.result.pressure.rearBar}{' '}
                bar
              </Text>
            </View>
          </View>
          <Pressable onPress={() => void handleDelete(race.id)} hitSlop={8}>
            <Ionicons
              name="trash-outline"
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const raceStyles = StyleSheet.create({
  section: {
    borderRadius: radius.xlarge,
    backgroundColor: colors.surfaceDefault,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.low,
  },
  title: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfaceCanvas,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'flex-start',
  },
  raceName: {
    color: colors.textPrimary,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.black,
  },
  raceMeta: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    marginTop: 2,
  },
  tireName: {
    color: colors.brandBlue,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    marginTop: spacing[1],
  },
  pressure: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
  },
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
          <Text style={styles.eyebrow}>Profil cycliste</Text>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          {user?.isAdmin ? (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Administrateur</Text>
            </View>
          ) : null}
        </View>

        {/* Strava */}
        {stravaToken ? <StravaSection stravaToken={stravaToken} /> : null}

        {/* Vélos manuels */}
        <ManualBikesSection />

        {/* Courses sauvegardées */}
        <SavedRacesSection />

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
  eyebrow: {
    color: colors.brandBlue,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  name: {
    color: colors.textPrimary,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.black,
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
