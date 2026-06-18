import type {
  TireBenchmarkResult,
  TireComparisonResponse,
  ProductListItem,
} from '@michelin/contracts';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthGate } from '../../../components/auth-gate';
import { useAuth } from '../../auth/context/auth-context';
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadows,
  spacing,
} from '../../../theme';
import { toast } from '../../../utils/toast';
import {
  parseGpxMobile,
  type GradientStats,
} from '../../race-intelligence/utils/gpx-parser';
import { comparatorClient } from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Surface = 'road' | 'gravel' | 'mtb';
type RouteSource = 'manual' | 'gpx';
type Step = 1 | 2 | 3;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SURFACES: {
  value: Surface;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    value: 'road',
    label: 'Route',
    icon: 'navigate-outline',
    desc: 'Asphalte, bitume',
  },
  {
    value: 'gravel',
    label: 'Gravel',
    icon: 'earth-outline',
    desc: 'Chemin mixte',
  },
  {
    value: 'mtb',
    label: 'VTT',
    icon: 'leaf-outline',
    desc: 'Sentier, tout-terrain',
  },
];

const SCORE_LABELS: Record<string, string> = {
  routeFit: 'Adéquation',
  rollingEfficiency: 'Roulement',
  grip: 'Grip',
  punctureProtection: 'Protection',
  durability: 'Durabilité',
};

function scoreColor(v: number): string {
  if (v >= 80) return '#2E7D32';
  if (v >= 60) return '#F5A623';
  if (v >= 40) return '#E65100';
  return '#B3261E';
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{label}</Text>
      <View style={barStyles.track}>
        <View
          style={[
            barStyles.fill,
            { width: `${value}%`, backgroundColor: scoreColor(value) },
          ]}
        />
      </View>
      <Text style={[barStyles.value, { color: scoreColor(value) }]}>
        {value}
      </Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  label: { width: 90, color: colors.textSecondary, fontSize: fontSize.caption },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderDefault,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  value: {
    width: 28,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
  },
});

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({
  result,
  isRecommended,
}: {
  result: TireBenchmarkResult;
  isRecommended: boolean;
}) {
  const { product, scores, advantages, tradeoffs, verdict } = result;
  return (
    <View style={[cardStyles.card, isRecommended && cardStyles.cardHighlight]}>
      {isRecommended ? (
        <View style={cardStyles.badge}>
          <Ionicons name="star" size={11} color={colors.textOnYellow} />
          <Text style={cardStyles.badgeText}>Recommandé</Text>
        </View>
      ) : null}
      <Text style={cardStyles.range}>{product.range}</Text>
      <Text style={cardStyles.name}>{product.name}</Text>
      {product.size ? (
        <Text style={cardStyles.size}>{product.size}</Text>
      ) : null}

      <View style={cardStyles.overallRow}>
        <Text style={cardStyles.overallLabel}>Score global</Text>
        <View
          style={[
            cardStyles.overallBadge,
            { backgroundColor: scoreColor(scores.overall) },
          ]}
        >
          <Text style={cardStyles.overallValue}>{scores.overall}</Text>
        </View>
      </View>

      <View style={cardStyles.bars}>
        {Object.entries(scores)
          .filter(([k]) => k !== 'overall')
          .map(([k, v]) => (
            <ScoreBar key={k} label={SCORE_LABELS[k] ?? k} value={v} />
          ))}
      </View>

      {verdict ? <Text style={cardStyles.verdict}>{verdict}</Text> : null}

      {advantages.length > 0 ? (
        <View style={cardStyles.list}>
          {advantages.map((a) => (
            <View key={a} style={cardStyles.listItem}>
              <Text style={cardStyles.plus}>+</Text>
              <Text style={cardStyles.listText}>{a}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {tradeoffs.length > 0 ? (
        <View style={cardStyles.list}>
          {tradeoffs.map((t) => (
            <View key={t} style={cardStyles.listItem}>
              <Text style={cardStyles.minus}>−</Text>
              <Text style={cardStyles.listText}>{t}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.xlarge,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.low,
  },
  cardHighlight: {
    borderColor: colors.brandYellow,
    borderWidth: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.brandYellow,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.textOnYellow,
    fontSize: 10,
    fontWeight: fontWeight.black,
  },
  range: {
    color: colors.brandBlue,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    color: colors.textPrimary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.black,
  },
  size: { color: colors.textSecondary, fontSize: fontSize.caption },
  overallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overallLabel: { color: colors.textSecondary, fontSize: fontSize.bodySmall },
  overallBadge: {
    borderRadius: radius.medium,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  overallValue: {
    color: '#fff',
    fontSize: fontSize.body,
    fontWeight: fontWeight.black,
  },
  bars: { gap: spacing[2] },
  verdict: {
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  list: { gap: 4 },
  listItem: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  plus: {
    color: '#2E7D32',
    fontWeight: fontWeight.black,
    fontSize: fontSize.body,
    lineHeight: 20,
  },
  minus: {
    color: '#B3261E',
    fontWeight: fontWeight.black,
    fontSize: fontSize.body,
    lineHeight: 20,
  },
  listText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
    lineHeight: 20,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export function ComparatorScreen() {
  const { token } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [routeSource, setRouteSource] = useState<RouteSource>('manual');
  const [surface, setSurface] = useState<Surface>('road');
  const [distanceKm, setDistanceKm] = useState('');
  const [elevationM, setElevationM] = useState('');
  const [gpxName, setGpxName] = useState<string | null>(null);
  const [gpxParsing, setGpxParsing] = useState(false);
  const [gradientStats, setGradientStats] = useState<GradientStats | null>(
    null,
  );

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductListItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTires, setSelectedTires] = useState<ProductListItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TireComparisonResponse | null>(null);

  if (!token)
    return (
      <AuthGate label="Connectez-vous pour comparer les pneus sur votre parcours." />
    );

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function pickGpx() {
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
      });
      if (picked.canceled || !picked.assets?.[0]) return;
      const asset = picked.assets[0];
      setGpxParsing(true);
      const content = await FileSystem.readAsStringAsync(asset.uri);
      const stats = parseGpxMobile(content);
      if (!stats) {
        toast.error('Fichier GPX invalide ou trop court.');
        return;
      }
      setGpxName(asset.name ?? 'parcours.gpx');
      setDistanceKm(String(stats.distanceKm));
      setElevationM(String(stats.elevationGainM));
      setGradientStats(stats.gradientStats);
    } catch {
      toast.error('Impossible de lire le fichier GPX.');
    } finally {
      setGpxParsing(false);
    }
  }

  function clearGpx() {
    setGpxName(null);
    setDistanceKm('');
    setElevationM('');
    setGradientStats(null);
  }

  async function searchTires(q: string) {
    setQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await comparatorClient.getProducts({
        q,
        sort: 'range',
        page: 1,
      });
      setSearchResults(res.items.slice(0, 8));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function toggleTire(tire: ProductListItem) {
    setSelectedTires((prev) => {
      const already = prev.find((t) => t.id === tire.id);
      if (already) return prev.filter((t) => t.id !== tire.id);
      if (prev.length >= 3) {
        toast.info('Maximum 3 pneus à comparer.');
        return prev;
      }
      return [...prev, tire];
    });
  }

  async function compare() {
    if (selectedTires.length < 2) {
      toast.error('Sélectionnez au moins 2 pneus.');
      return;
    }
    const dist = parseFloat(distanceKm);
    const elev = parseFloat(elevationM) || 0;
    if (!dist) {
      toast.error('Renseignez la distance.');
      return;
    }
    setLoading(true);
    try {
      const data = await comparatorClient.compareTires({
        route: {
          source: routeSource,
          surface,
          distanceKm: dist,
          elevationGainM: elev,
          gradientStats: gradientStats ?? {
            flat: 60,
            rolling: 25,
            hilly: 10,
            steep: 5,
          },
        },
        selectedProductIds: selectedTires.map((t) => t.id),
      });
      setResult(data);
      setStep(3);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Analyse échouée.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(1);
    setRouteSource('manual');
    setSurface('road');
    setDistanceKm('');
    setElevationM('');
    setGpxName(null);
    setGradientStats(null);
    setQuery('');
    setSearchResults([]);
    setSelectedTires([]);
    setResult(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Comparateur</Text>
        <Text style={styles.title}>Analyse de pneus</Text>

        {/* Step pills */}
        <View style={styles.stepRow}>
          {([1, 2, 3] as Step[]).map((s) => (
            <View
              key={s}
              style={[styles.stepDot, step >= s && styles.stepDotActive]}
            />
          ))}
        </View>
      </View>

      {/* ── STEP 1: Route ─────────────────────────────────────────────────── */}
      {step === 1 ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Surface</Text>
          <View style={styles.surfaceGrid}>
            {SURFACES.map((s) => (
              <Pressable
                key={s.value}
                style={[
                  styles.surfaceCard,
                  surface === s.value && styles.surfaceCardActive,
                ]}
                onPress={() => setSurface(s.value)}
              >
                <Ionicons
                  name={s.icon as React.ComponentProps<typeof Ionicons>['name']}
                  size={26}
                  color={
                    surface === s.value
                      ? colors.brandBlue
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.surfaceLabel,
                    surface === s.value && { color: colors.brandBlue },
                  ]}
                >
                  {s.label}
                </Text>
                <Text style={styles.surfaceDesc}>{s.desc}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Source du parcours</Text>
          <View style={styles.sourceRow}>
            <Pressable
              style={[
                styles.sourceBtn,
                routeSource === 'manual' && styles.sourceBtnActive,
              ]}
              onPress={() => {
                setRouteSource('manual');
                clearGpx();
              }}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={
                  routeSource === 'manual'
                    ? colors.brandBlue
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.sourceBtnText,
                  routeSource === 'manual' && { color: colors.brandBlue },
                ]}
              >
                Saisie manuelle
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.sourceBtn,
                routeSource === 'gpx' && styles.sourceBtnActive,
              ]}
              onPress={() => setRouteSource('gpx')}
            >
              <Ionicons
                name="document-outline"
                size={18}
                color={
                  routeSource === 'gpx'
                    ? colors.brandBlue
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.sourceBtnText,
                  routeSource === 'gpx' && { color: colors.brandBlue },
                ]}
              >
                Fichier GPX
              </Text>
            </Pressable>
          </View>

          {routeSource === 'gpx' ? (
            gpxName ? (
              <View style={styles.gpxLoaded}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.stateSuccess}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.gpxName} numberOfLines={1}>
                    {gpxName}
                  </Text>
                  <Text style={styles.gpxStats}>
                    {distanceKm} km · {elevationM} m D+
                  </Text>
                </View>
                <Pressable onPress={clearGpx} hitSlop={8}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.borderStrong}
                  />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.gpxBtn}
                onPress={pickGpx}
                disabled={gpxParsing}
              >
                {gpxParsing ? (
                  <ActivityIndicator size="small" color={colors.brandBlue} />
                ) : (
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={colors.brandBlue}
                  />
                )}
                <Text style={styles.gpxBtnText}>
                  {gpxParsing ? 'Lecture…' : 'Importer un fichier GPX'}
                </Text>
              </Pressable>
            )
          ) : null}

          <Text style={styles.sectionTitle}>Parcours</Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="swap-horizontal-outline"
              size={18}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={distanceKm}
              onChangeText={setDistanceKm}
              keyboardType="numeric"
              placeholder="Distance (km)"
              placeholderTextColor={colors.borderStrong}
              returnKeyType="next"
              editable={routeSource === 'manual'}
            />
          </View>
          <View style={styles.inputRow}>
            <Ionicons
              name="trending-up-outline"
              size={18}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={elevationM}
              onChangeText={setElevationM}
              keyboardType="numeric"
              placeholder="Dénivelé positif (m, optionnel)"
              placeholderTextColor={colors.borderStrong}
              returnKeyType="done"
              editable={routeSource === 'manual'}
            />
          </View>

          <Pressable
            style={[styles.nextBtn, !distanceKm && styles.nextBtnDisabled]}
            disabled={!distanceKm}
            onPress={() => setStep(2)}
          >
            <Text style={styles.nextBtnText}>Choisir les pneus</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
        </ScrollView>
      ) : null}

      {/* ── STEP 2: Tire selection ────────────────────────────────────────── */}
      {step === 2 ? (
        <View style={{ flex: 1 }}>
          {/* Selected tires */}
          {selectedTires.length > 0 ? (
            <View style={styles.selectedBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedScroll}
              >
                {selectedTires.map((t) => (
                  <Pressable
                    key={t.id}
                    style={styles.selectedChip}
                    onPress={() => toggleTire(t)}
                  >
                    <Text style={styles.selectedChipText} numberOfLines={1}>
                      {t.web_product_designation ?? t.designation ?? 'Pneu'}
                    </Text>
                    <Ionicons name="close" size={12} color={colors.brandBlue} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Search */}
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={searchTires}
              placeholder="Rechercher un pneu…"
              placeholderTextColor={colors.borderStrong}
              autoCapitalize="none"
            />
            {searching ? (
              <ActivityIndicator size="small" color={colors.brandBlue} />
            ) : null}
          </View>

          <ScrollView
            contentContainerStyle={styles.tireList}
            showsVerticalScrollIndicator={false}
          >
            {query.length < 2 ? (
              <Text style={styles.searchHint}>
                Tapez au moins 2 caractères pour chercher.
              </Text>
            ) : null}
            {searchResults.map((tire) => {
              const selected = !!selectedTires.find((t) => t.id === tire.id);
              return (
                <Pressable
                  key={tire.id}
                  style={[styles.tireRow, selected && styles.tireRowSelected]}
                  onPress={() => toggleTire(tire)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tireName}>
                      {tire.web_product_designation ??
                        tire.designation ??
                        'Pneu inconnu'}
                    </Text>
                    <Text style={styles.tireMeta}>
                      {tire.segment ?? tire.cycle_type ?? ''}
                    </Text>
                  </View>
                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.brandBlue}
                    />
                  ) : (
                    <Ionicons
                      name="add-circle-outline"
                      size={22}
                      color={colors.borderStrong}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.step2Footer}>
            <Pressable style={styles.backBtn} onPress={() => setStep(1)}>
              <Ionicons name="arrow-back" size={16} color={colors.brandBlue} />
              <Text style={styles.backBtnText}>Retour</Text>
            </Pressable>
            <Pressable
              style={[
                styles.compareBtn,
                (selectedTires.length < 2 || loading) &&
                  styles.compareBtnDisabled,
              ]}
              disabled={selectedTires.length < 2 || loading}
              onPress={compare}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.textOnYellow} />
              ) : (
                <>
                  <Ionicons
                    name="analytics-outline"
                    size={16}
                    color={colors.textOnYellow}
                  />
                  <Text style={styles.compareBtnText}>
                    Comparer {selectedTires.length} pneu
                    {selectedTires.length > 1 ? 's' : ''}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* ── STEP 3: Results ──────────────────────────────────────────────── */}
      {step === 3 && result ? (
        <ScrollView
          contentContainerStyle={styles.results}
          showsVerticalScrollIndicator={false}
        >
          {result.routeSummary?.length > 0 ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Analyse du parcours</Text>
              {result.routeSummary.map((line, i) => (
                <Text key={i} style={styles.summaryLine}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}

          {result.results.map((r) => (
            <ResultCard
              key={r.product.id}
              result={r}
              isRecommended={
                String(r.product.id) === String(result.recommendedProductId)
              }
            />
          ))}

          <Pressable style={styles.resetBtn} onPress={reset}>
            <Ionicons name="refresh" size={16} color={colors.brandBlue} />
            <Text style={styles.resetBtnText}>Nouvelle comparaison</Text>
          </Pressable>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceCanvas },

  header: {
    backgroundColor: colors.brandMidnight,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    gap: spacing[1],
  },
  eyebrow: {
    color: colors.brandYellow,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.base.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: spacing[2],
  },
  stepRow: { flexDirection: 'row', gap: spacing[2] },
  stepDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  stepDotActive: { backgroundColor: colors.brandYellow },

  content: {
    padding: spacing[4],
    paddingBottom: 110,
    gap: spacing[4],
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.bodyLarge,
    fontWeight: fontWeight.black,
  },

  sourceRow: { flexDirection: 'row', gap: spacing[3] },
  sourceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: radius.large,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfaceDefault,
  },
  sourceBtnActive: {
    borderColor: colors.brandBlue,
    backgroundColor: 'rgba(39,80,155,0.06)',
  },
  sourceBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
  },

  gpxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.large,
    borderWidth: 1.5,
    borderColor: colors.brandBlue,
    borderStyle: 'dashed',
  },
  gpxBtnText: {
    color: colors.brandBlue,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
  },
  gpxLoaded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.large,
    backgroundColor: 'rgba(46,125,50,0.08)',
    borderWidth: 1,
    borderColor: colors.stateSuccess,
  },
  gpxName: {
    color: colors.textPrimary,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
  },
  gpxStats: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    marginTop: 2,
  },

  surfaceGrid: { flexDirection: 'row', gap: spacing[3] },
  surfaceCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderRadius: radius.large,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfaceDefault,
    gap: spacing[1],
    ...shadows.low,
  },
  surfaceCardActive: {
    borderColor: colors.brandBlue,
    backgroundColor: 'rgba(39,80,155,0.06)',
  },
  surfaceLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
  },
  surfaceDesc: {
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceDefault,
    paddingHorizontal: spacing[3],
    minHeight: 52,
  },
  inputIcon: { marginRight: spacing[2] },
  input: { flex: 1, fontSize: fontSize.body, color: colors.textPrimary },

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
    color: '#fff',
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
  },

  selectedBar: {
    backgroundColor: colors.surfaceDefault,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    paddingVertical: spacing[2],
  },
  selectedScroll: { paddingHorizontal: spacing[4], gap: spacing[2] },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(39,80,155,0.10)',
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: 'rgba(39,80,155,0.25)',
  },
  selectedChipText: {
    color: colors.brandBlue,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    maxWidth: 120,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    margin: spacing[4],
    paddingHorizontal: spacing[3],
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceDefault,
    minHeight: 48,
  },
  searchInput: { flex: 1, fontSize: fontSize.body, color: colors.textPrimary },
  searchHint: {
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
    textAlign: 'center',
    paddingVertical: spacing[4],
  },

  tireList: {
    paddingHorizontal: spacing[4],
    paddingBottom: 120,
    gap: spacing[2],
  },
  tireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfaceDefault,
  },
  tireRowSelected: {
    borderColor: colors.brandBlue,
    backgroundColor: 'rgba(39,80,155,0.06)',
  },
  tireName: {
    color: colors.textPrimary,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
  },
  tireMeta: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    marginTop: 2,
  },

  step2Footer: {
    position: 'absolute',
    bottom: 90,
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    gap: spacing[3],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: radius.large,
    borderWidth: 1.5,
    borderColor: colors.brandBlue,
    backgroundColor: colors.surfaceDefault,
  },
  backBtnText: {
    color: colors.brandBlue,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
  },
  compareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.large,
    backgroundColor: colors.brandYellow,
  },
  compareBtnDisabled: { opacity: 0.45 },
  compareBtnText: {
    color: colors.textOnYellow,
    fontSize: fontSize.body,
    fontWeight: fontWeight.black,
  },

  results: { padding: spacing[4], paddingBottom: 110, gap: spacing[4] },
  summaryCard: {
    backgroundColor: colors.brandDarkBlue,
    borderRadius: radius.large,
    padding: spacing[4],
    gap: spacing[2],
  },
  summaryTitle: {
    color: colors.brandYellow,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryLine: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.bodySmall,
    lineHeight: 20,
  },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.large,
    borderWidth: 1.5,
    borderColor: colors.brandBlue,
  },
  resetBtnText: {
    color: colors.brandBlue,
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
  },
});
