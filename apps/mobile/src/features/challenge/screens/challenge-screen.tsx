import type { Challenge } from '@michelin/contracts';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { WebView } from 'react-native-webview';

import { colors, radius, spacing, fontSize, fontWeight } from '../../../theme';
import { AuthGate } from '../../../components/auth-gate';
import { useAuth } from '../../auth/context/auth-context';
import { challengeClient } from '../api';
import {
  TOUR_DE_FRANCE_STAGES,
  TOUR_DE_FRANCE_TOTALS,
  type TourDeFranceStage,
  type TourDeFranceStageCategory,
} from '../data/tour-de-france-stages';
import { TDF_ROUTE_COORDS } from '../data/tdf-route-coords';

// ─── Stage route map ──────────────────────────────────────────────────────────

function buildRouteHtml(coords: [number, number][], lineColor: string): string {
  const lats = coords.map((c) => c[0]);
  const lons = coords.map((c) => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const coordsJson = JSON.stringify(coords);
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5,user-scalable=yes"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{margin:0;padding:0;width:100%;height:100%;background:#e8e0d8;}</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map=L.map('map',{zoomControl:false,attributionControl:false,dragging:true,touchZoom:true,scrollWheelZoom:false,doubleClickZoom:true,boxZoom:false,keyboard:false});
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
var coords=${coordsJson};
L.polyline(coords,{color:'${lineColor}',weight:4,opacity:1}).addTo(map);
L.circleMarker(coords[0],{radius:7,fillColor:'#2E7D32',color:'#fff',weight:2,fillOpacity:1}).addTo(map);
L.circleMarker(coords[coords.length-1],{radius:7,fillColor:'#FFC300',color:'#fff',weight:2,fillOpacity:1}).addTo(map);
map.fitBounds([[${minLat},${minLon}],[${maxLat},${maxLon}]],{padding:[18,18]});
</script>
</body></html>`;
}

function StageMap({
  stageId,
  catColor,
}: {
  stageId: string;
  catColor: string;
}) {
  const coords = TDF_ROUTE_COORDS[stageId];
  if (!coords || coords.length < 2) return null;
  const html = buildRouteHtml(coords, catColor);
  return (
    <View style={mapStyles.container}>
      <WebView
        style={{ flex: 1 }}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        scrollEnabled={false}
      />
    </View>
  );
}

const mapStyles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: radius.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
});

// ─── Elevation profile SVG ────────────────────────────────────────────────────

function ElevationProfile({
  profile,
  catColor,
}: {
  profile: [number, number][];
  catColor: string;
}) {
  const W = 300;
  const H = 80;
  const PAD_X = 0;
  const PAD_Y = 6;

  if (profile.length < 2) return null;

  const distVals = profile.map((p) => p[0]);
  const eleVals = profile.map((p) => p[1]);
  const minDist = distVals[0]!;
  const maxDist = distVals[distVals.length - 1]!;
  const minEle = Math.min(...eleVals);
  const maxEle = Math.max(...eleVals);
  const rangeEle = maxEle - minEle || 1;

  const toX = (d: number) =>
    PAD_X + ((d - minDist) / (maxDist - minDist)) * (W - 2 * PAD_X);
  const toY = (e: number) =>
    PAD_Y + (1 - (e - minEle) / rangeEle) * (H - 2 * PAD_Y);

  const pts = profile.map(
    ([d, e]) => `${toX(d).toFixed(1)},${toY(e).toFixed(1)}`,
  );
  const linePath = `M ${pts.join(' L ')}`;
  const fillPath = `${linePath} L ${toX(maxDist).toFixed(1)},${H} L ${toX(minDist).toFixed(1)},${H} Z`;

  return (
    <View style={profileStyles.container}>
      <View style={profileStyles.header}>
        <Ionicons
          name="trending-up-outline"
          size={12}
          color={colors.textSecondary}
        />
        <Text style={profileStyles.label}>Profil altimétrique</Text>
        <Text style={profileStyles.range}>
          {Math.round(minEle)} – {Math.round(maxEle)} m
        </Text>
      </View>
      <Svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={catColor} stopOpacity="0.35" />
            <Stop offset="1" stopColor={catColor} stopOpacity="0.04" />
          </LinearGradient>
        </Defs>
        <Path d={fillPath} fill="url(#grad)" />
        <Path d={linePath} fill="none" stroke={catColor} strokeWidth="1.5" />
      </Svg>
    </View>
  );
}

const profileStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
    paddingBottom: spacing[2],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  label: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  range: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
  },
});

// ─── Gradient stats bars ──────────────────────────────────────────────────────

const GRADIENT_LABELS: Record<string, string> = {
  flat: 'Plat',
  rolling: 'Roulant',
  hilly: 'Vallonné',
  steep: 'Raide',
};
const GRADIENT_COLORS: Record<string, string> = {
  flat: '#27509B',
  rolling: '#84BD00',
  hilly: '#F5A623',
  steep: '#B3261E',
};

function GradientStats({
  stats,
}: {
  stats: { flat: number; rolling: number; hilly: number; steep: number };
}) {
  const entries = (['flat', 'rolling', 'hilly', 'steep'] as const).map((k) => ({
    key: k,
    label: GRADIENT_LABELS[k]!,
    color: GRADIENT_COLORS[k]!,
    value: stats[k],
  }));

  return (
    <View style={gradStyles.container}>
      <Text style={gradStyles.title}>Répartition du terrain</Text>
      <View style={gradStyles.track}>
        {entries.map((e) =>
          e.value > 0 ? (
            <View
              key={e.key}
              style={{ flex: e.value, height: 8, backgroundColor: e.color }}
            />
          ) : null,
        )}
      </View>
      <View style={gradStyles.legend}>
        {entries.map((e) => (
          <View key={e.key} style={gradStyles.legendItem}>
            <View style={[gradStyles.dot, { backgroundColor: e.color }]} />
            <Text style={gradStyles.legendLabel}>{e.label}</Text>
            <Text style={gradStyles.legendValue}>{e.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const gradStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing[3],
    gap: spacing[2],
  },
  title: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  track: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
  },
  legendValue: {
    color: colors.textPrimary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'segment' | 'tour';

interface TireRec {
  name: string;
  fit: string;
  score: number;
  highlights: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TIRES: Record<'allSeason' | 'cup' | 'endurance', TireRec> = {
  allSeason: {
    name: 'MICHELIN Power All Season',
    fit: 'Confiance sur chaussées changeantes',
    score: 88,
    highlights: ['Grip mouillé', 'Protection renforcée', 'Régularité'],
  },
  cup: {
    name: 'MICHELIN Power Cup',
    fit: 'Rendement maximal sur route rapide',
    score: 94,
    highlights: ['Faible résistance', 'Grip compétition', 'Réponse vive'],
  },
  endurance: {
    name: 'MICHELIN Power Endurance',
    fit: 'Fiabilité pour les longues journées',
    score: 91,
    highlights: ['Durabilité', 'Anti-crevaison', 'Confort longue distance'],
  },
};

const CATEGORY_COPY: Record<TourDeFranceStageCategory, string> = {
  flat: 'Étape roulante, relances rapides. Priorité au rendement et à la vitesse de pointe.',
  hilly:
    'Terrain irrégulier, changements de rythme. Grip constant sur revêtements variés.',
  mountain:
    'Journée de grimpe et descente. Tenue, protection, carcasse qui encaisse les longues ascensions.',
  'individual-time-trial':
    'Effort court, trajectoire propre. Chaque watt compte, rendement pur.',
  'team-time-trial':
    'Effort collectif très rapide. Monte vive, stable et lisible dans les relais.',
};

const CATEGORY_COLOR: Record<TourDeFranceStageCategory, string> = {
  flat: '#27509B',
  hilly: '#84BD00',
  mountain: '#B3261E',
  'team-time-trial': '#8A6500',
  'individual-time-trial': '#8A6500',
};

const CATEGORY_ICON: Record<TourDeFranceStageCategory, string> = {
  flat: '→',
  hilly: '∿',
  mountain: '▲',
  'team-time-trial': '⏱',
  'individual-time-trial': '⏱',
};

function tireForStage(stage: TourDeFranceStage): TireRec {
  if (
    stage.category === 'individual-time-trial' ||
    stage.category === 'team-time-trial' ||
    stage.distanceKm < 60
  )
    return TIRES.cup;
  if (stage.category === 'mountain' || stage.distanceKm >= 190)
    return TIRES.endurance;
  if (stage.category === 'hilly') return TIRES.allSeason;
  return TIRES.cup;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatNum(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}h${String(m).padStart(2, '0')}m${String(s).padStart(2, '0')}s`;
  return `${m}m${String(s).padStart(2, '0')}s`;
}

// ─── Stage card (expandable) ──────────────────────────────────────────────────

function StageCard({
  stage,
  isOpen,
  onToggle,
}: {
  stage: TourDeFranceStage;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const tire = tireForStage(stage);
  const catColor = CATEGORY_COLOR[stage.category];
  const catIcon = CATEGORY_ICON[stage.category];

  return (
    <View style={cardStyles.wrapper}>
      {/* Header row — always visible */}
      <Pressable
        style={({ pressed }) => [
          cardStyles.header,
          isOpen && cardStyles.headerOpen,
          pressed && { opacity: 0.85 },
        ]}
        onPress={onToggle}
      >
        {/* Stage number */}
        <View style={[cardStyles.numberBox, { borderLeftColor: catColor }]}>
          <Text style={cardStyles.numberText}>
            {String(stage.number).padStart(2, '0')}
          </Text>
        </View>

        {/* Route + meta */}
        <View style={cardStyles.headerInfo}>
          <Text style={cardStyles.route} numberOfLines={1}>
            {stage.route}
          </Text>
          <View style={cardStyles.metaRow}>
            <View
              style={[
                cardStyles.catBadge,
                { backgroundColor: catColor + '22' },
              ]}
            >
              <Text style={[cardStyles.catBadgeText, { color: catColor }]}>
                {catIcon} {stage.categoryLabel}
              </Text>
            </View>
            <Text style={cardStyles.metaText}>
              {stage.distanceKm} km · {formatNum(stage.elevationGainM)} m
            </Text>
          </View>
          <Text style={cardStyles.dateText}>{formatDate(stage.date)}</Text>
        </View>

        {/* Chevron */}
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textSecondary}
        />
      </Pressable>

      {/* Expanded detail */}
      {isOpen ? (
        <View style={cardStyles.detail}>
          {/* Route map */}
          <StageMap stageId={stage.id} catColor={catColor} />

          {/* Elevation profile */}
          {stage.profile.length >= 2 ? (
            <ElevationProfile profile={stage.profile} catColor={catColor} />
          ) : null}

          {/* Gradient stats */}
          <GradientStats stats={stage.gradientStats} />

          {/* Terrain description */}
          <Text style={cardStyles.terrainText}>
            {CATEGORY_COPY[stage.category]}
          </Text>

          {/* Tire recommendation */}
          <View style={cardStyles.tireRow}>
            <View style={cardStyles.tireInfo}>
              <Text style={cardStyles.tireEyebrow}>Pneu recommandé</Text>
              <Text style={cardStyles.tireName}>{tire.name}</Text>
              <Text style={cardStyles.tireFit}>{tire.fit}</Text>
            </View>
            <View style={cardStyles.scoreBox}>
              <Text style={cardStyles.scoreValue}>{tire.score}</Text>
              <Text style={cardStyles.scoreUnit}>/100</Text>
            </View>
          </View>

          {/* Highlights */}
          <View style={cardStyles.highlights}>
            {tire.highlights.map((h) => (
              <View key={h} style={cardStyles.highlight}>
                <Ionicons
                  name="checkmark-circle"
                  size={13}
                  color={colors.brandBlue}
                />
                <Text style={cardStyles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>

          {/* Source data */}
          <Text style={cardStyles.sourceText}>
            {formatNum(stage.sourcePointCount)} points GPS ·{' '}
            {formatNum(stage.elevationGainM)} m D+
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  headerOpen: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  numberBox: {
    borderLeftWidth: 3,
    paddingLeft: spacing[2],
  },
  numberText: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  route: {
    color: colors.textPrimary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  catBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  catBadgeText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    textTransform: 'capitalize',
  },
  detail: {
    padding: spacing[4],
    gap: spacing[3],
    backgroundColor: colors.surfaceCanvas,
  },
  terrainText: {
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
    lineHeight: 20,
  },
  tireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.large,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  tireInfo: { flex: 1 },
  tireEyebrow: {
    color: colors.brandBlue,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  tireName: {
    color: colors.textPrimary,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
  },
  tireFit: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    marginTop: 2,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: colors.brandYellow,
    borderRadius: radius.large,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  scoreValue: {
    color: colors.textOnYellow,
    fontSize: fontSize.h4,
    fontWeight: '900',
    lineHeight: 24,
  },
  scoreUnit: {
    color: colors.textOnYellow,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  highlightText: {
    color: colors.textPrimary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
  },
  sourceText: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    textAlign: 'center',
    opacity: 0.6,
  },
});

// ─── Tour tab ─────────────────────────────────────────────────────────────────

function TourTab() {
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <ScrollView
      contentContainerStyle={tourStyles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats banner */}
      <View style={tourStyles.banner}>
        <View style={tourStyles.bannerItem}>
          <Text style={tourStyles.bannerValue}>
            {formatNum(TOUR_DE_FRANCE_TOTALS.distanceKm)}
          </Text>
          <Text style={tourStyles.bannerLabel}>km au total</Text>
        </View>
        <View style={tourStyles.bannerDivider} />
        <View style={tourStyles.bannerItem}>
          <Text style={tourStyles.bannerValue}>
            {formatNum(TOUR_DE_FRANCE_TOTALS.elevationGainM)}
          </Text>
          <Text style={tourStyles.bannerLabel}>m de dénivelé</Text>
        </View>
        <View style={tourStyles.bannerDivider} />
        <View style={tourStyles.bannerItem}>
          <Text style={tourStyles.bannerValue}>
            {TOUR_DE_FRANCE_TOTALS.stageCount}
          </Text>
          <Text style={tourStyles.bannerLabel}>étapes</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={tourStyles.legend}>
        {(
          [
            ['mountain', 'Montagne'],
            ['hilly', 'Vallonné'],
            ['flat', 'Plaine'],
            ['individual-time-trial', 'Chrono'],
          ] as [TourDeFranceStageCategory, string][]
        ).map(([cat, label]) => (
          <View key={cat} style={tourStyles.legendItem}>
            <View
              style={[
                tourStyles.legendDot,
                { backgroundColor: CATEGORY_COLOR[cat] },
              ]}
            />
            <Text style={tourStyles.legendText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Stage cards */}
      {TOUR_DE_FRANCE_STAGES.map((stage) => (
        <StageCard
          key={stage.id}
          stage={stage}
          isOpen={openId === stage.id}
          onToggle={() => toggle(stage.id)}
        />
      ))}
    </ScrollView>
  );
}

const tourStyles = StyleSheet.create({
  content: {
    padding: spacing[4],
    paddingBottom: 110,
    gap: spacing[3],
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: colors.brandDarkBlue,
    borderRadius: radius.large,
    padding: spacing[4],
  },
  bannerItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  bannerValue: {
    color: colors.brandYellow,
    fontSize: fontSize.body,
    fontWeight: '900',
  },
  bannerLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.caption,
  },
  bannerDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: spacing[1],
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    paddingHorizontal: spacing[1],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
  },
});

// ─── Segment tab ──────────────────────────────────────────────────────────────

function SegmentTab({ challenge }: { challenge: Challenge | null }) {
  if (!challenge) {
    return (
      <View style={segStyles.empty}>
        <Ionicons
          name="ribbon-outline"
          size={36}
          color={colors.textSecondary}
        />
        <Text style={segStyles.emptyTitle}>Aucun segment en cours.</Text>
        <Text style={segStyles.emptySub}>
          Consultez les étapes Tour de France dans l'onglet ci-dessus.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={segStyles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Info grid */}
      <View style={segStyles.infoGrid}>
        {challenge.location ? (
          <View style={segStyles.infoCard}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.brandBlue}
            />
            <Text style={segStyles.infoLabel}>Lieu</Text>
            <Text style={segStyles.infoValue}>{challenge.location}</Text>
          </View>
        ) : null}
        {challenge.distance_km != null ? (
          <View style={segStyles.infoCard}>
            <Ionicons
              name="speedometer-outline"
              size={16}
              color={colors.brandBlue}
            />
            <Text style={segStyles.infoLabel}>Distance</Text>
            <Text style={segStyles.infoValue}>{challenge.distance_km} km</Text>
          </View>
        ) : null}
        {challenge.elevation_m != null ? (
          <View style={segStyles.infoCard}>
            <Ionicons
              name="trending-up-outline"
              size={16}
              color={colors.brandBlue}
            />
            <Text style={segStyles.infoLabel}>Dénivelé</Text>
            <Text style={segStyles.infoValue}>{challenge.elevation_m} m</Text>
          </View>
        ) : null}
        <View style={segStyles.infoCard}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.brandBlue}
          />
          <Text style={segStyles.infoLabel}>Fin</Text>
          <Text style={segStyles.infoValue}>
            {new Date(challenge.ends_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>
      </View>

      {/* Lot */}
      <View style={segStyles.prizeCard}>
        <View style={segStyles.prizeHeader}>
          <Ionicons name="gift-outline" size={20} color={colors.textOnYellow} />
          <Text style={segStyles.prizeTitle}>{challenge.prize_label}</Text>
        </View>
        {challenge.prize_description ? (
          <Text style={segStyles.prizeDesc}>{challenge.prize_description}</Text>
        ) : null}
      </View>

      {/* Bouton Strava */}
      <Pressable
        style={({ pressed }) => [
          segStyles.stravaBtn,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => Linking.openURL(challenge.strava_segment_url)}
      >
        <Ionicons name="open-outline" size={16} color="#fff" />
        <Text style={segStyles.stravaBtnText}>Voir le segment sur Strava</Text>
      </Pressable>

      {/* Classement natif */}
      {challenge.entries.length > 0 ? (
        <View style={segStyles.leaderboardCard}>
          {/* Header */}
          <View style={segStyles.leaderboardHeader}>
            <Text style={segStyles.leaderboardKicker}>Classement</Text>
            <Text style={segStyles.leaderboardTitle}>
              La référence du mois.
            </Text>
          </View>

          {/* Column headers */}
          <View style={segStyles.colHeader}>
            <Text style={[segStyles.colLabel, { width: 36 }]}>#</Text>
            <Text style={[segStyles.colLabel, { flex: 1 }]}>Athlète</Text>
            <Text
              style={[segStyles.colLabel, { width: 64, textAlign: 'right' }]}
            >
              Temps
            </Text>
            <Text
              style={[segStyles.colLabel, { width: 52, textAlign: 'right' }]}
            >
              Écart
            </Text>
          </View>

          {challenge.entries.map((entry) => {
            const leaderTime = challenge.entries[0]?.time_seconds ?? 0;
            const gapSec = entry.rank > 1 ? entry.time_seconds - leaderTime : 0;
            return (
              <View key={entry.rank} style={segStyles.entryRow}>
                <View
                  style={[
                    segStyles.rankBadge,
                    entry.rank === 1 && segStyles.rankFirst,
                    entry.rank === 2 && segStyles.rankSecond,
                    entry.rank === 3 && segStyles.rankThird,
                  ]}
                >
                  <Text style={segStyles.rankText}>{entry.rank}</Text>
                </View>
                <View style={segStyles.entryInfo}>
                  <Text style={segStyles.entryName} numberOfLines={1}>
                    {entry.athlete_name}
                  </Text>
                  {entry.club ? (
                    <Text style={segStyles.entryClub} numberOfLines={1}>
                      {entry.club}
                    </Text>
                  ) : null}
                </View>
                <View style={segStyles.entryTimes}>
                  <Text style={segStyles.entryTime}>
                    {formatTime(entry.time_seconds)}
                  </Text>
                  {gapSec > 0 ? (
                    <Text style={segStyles.entryGap}>
                      +{formatTime(gapSec)}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}

const segStyles = StyleSheet.create({
  content: {
    padding: spacing[4],
    paddingBottom: 110,
    gap: spacing[4],
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    gap: spacing[3],
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  infoCard: {
    flex: 1,
    minWidth: 110,
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.large,
    padding: spacing[3],
    gap: 2,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
  },
  prizeCard: {
    backgroundColor: colors.brandYellow,
    borderRadius: radius.large,
    padding: spacing[4],
    gap: spacing[2],
  },
  prizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  prizeTitle: {
    color: colors.textOnYellow,
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  prizeDesc: {
    color: colors.brandMidnight,
    fontSize: fontSize.bodySmall,
    opacity: 0.8,
  },
  leaderboardCard: {
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  leaderboardHeader: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    backgroundColor: colors.surfaceCanvas,
    gap: 2,
  },
  leaderboardKicker: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: colors.brandBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  leaderboardTitle: {
    fontSize: fontSize.bodyLarge,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  stravaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: '#FC4C02',
    borderRadius: radius.large,
    paddingVertical: spacing[4],
  },
  stravaBtnText: {
    color: '#fff',
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  colLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceCanvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  rankFirst: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  rankSecond: { backgroundColor: '#C0C0C0', borderColor: '#C0C0C0' },
  rankThird: { backgroundColor: '#CD7F32', borderColor: '#CD7F32' },
  rankText: {
    color: colors.textPrimary,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
  },
  entryInfo: { flex: 1, gap: 2 },
  entryName: {
    color: colors.textPrimary,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.semibold,
  },
  entryClub: { color: colors.textSecondary, fontSize: fontSize.caption },
  entryTimes: {
    alignItems: 'flex-end',
    gap: 2,
  },
  entryTime: {
    color: colors.brandBlue,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
  },
  entryGap: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export function ChallengeScreen() {
  const { token } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('segment');

  useEffect(() => {
    let active = true;
    challengeClient
      .getChallenges()
      .then((list) => {
        if (active) {
          setChallenge(list[0] ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!token)
    return (
      <AuthGate label="Connectez-vous pour accéder au Challenge Michelin et au Tour de France." />
    );

  return (
    <SafeAreaView style={screenStyles.safe} edges={['top']}>
      {/* Header */}
      <View style={screenStyles.header}>
        <Text style={screenStyles.eyebrow}>Challenge Michelin</Text>
        <Text style={screenStyles.title} numberOfLines={2} adjustsFontSizeToFit>
          {!loading && challenge ? challenge.name : 'Tour de France 2026'}
        </Text>

        {/* Tabs */}
        <View style={screenStyles.tabBar}>
          {(['segment', 'tour'] as Tab[]).map((t) => (
            <Pressable
              key={t}
              style={[
                screenStyles.tabBtn,
                tab === t && screenStyles.tabBtnActive,
              ]}
              onPress={() => setTab(t)}
            >
              <Text
                style={[
                  screenStyles.tabLabel,
                  tab === t && screenStyles.tabLabelActive,
                ]}
              >
                {t === 'segment' ? 'Segment du mois' : 'Tour de France'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={screenStyles.loader}>
          <ActivityIndicator size="large" color={colors.brandBlue} />
        </View>
      ) : tab === 'segment' ? (
        <SegmentTab challenge={challenge} />
      ) : (
        <TourTab />
      )}
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfaceCanvas,
  },
  header: {
    backgroundColor: colors.brandMidnight,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
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
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: spacing[3],
  },
  tabBar: {
    flexDirection: 'row',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.brandYellow,
  },
  tabLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.semibold,
  },
  tabLabelActive: {
    color: colors.base.white,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
