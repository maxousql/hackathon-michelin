import type {
  RaceAnalyzeResponse,
  SurfaceType,
  Discipline,
} from '@michelin/contracts';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const ACCESSORY_ID = 'race-no-toolbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseGpxMobile } from '../utils/gpx-parser';
import { toast } from '../../../utils/toast';
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
import { raceClient } from '../api';

const STRAVA_CLIENT_ID = '258523';
const STRAVA_CLIENT_SECRET = '8d7c6659b7cdcced2de8d4c0c7a39bec202adec4';
const STRAVA_REDIRECT_URI = 'michelin-race://localhost';

interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  distance: number;
  total_elevation_gain: number;
  start_date_local: string;
}

function sportTypeLabel(t: string) {
  const map: Record<string, string> = {
    Ride: 'Route',
    GravelRide: 'Gravel',
    MountainBikeRide: 'VTT',
    EMountainBikeRide: 'E-VTT',
    EBikeRide: 'E-Bike',
    VirtualRide: 'Virtuel',
    Run: 'Course',
    TrailRun: 'Trail',
    Hike: 'Randonnée',
  };
  return map[t] ?? t;
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const SURFACES: {
  value: SurfaceType;
  label: string;
  icon: IoniconName;
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
    desc: 'Chemin mixte, gravier',
  },
  {
    value: 'mtb',
    label: 'VTT',
    icon: 'leaf-outline',
    desc: 'Sentier, tout-terrain',
  },
];

const DISCIPLINES: Record<
  SurfaceType,
  { value: Discipline; label: string; icon: IoniconName }[]
> = {
  road: [
    { value: 'competition', label: 'Compétition', icon: 'trophy-outline' },
    { value: 'sportive', label: 'Sportive', icon: 'bicycle-outline' },
    { value: 'training', label: 'Entraînement', icon: 'barbell-outline' },
  ],
  gravel: [
    { value: 'sportive', label: 'Sportive', icon: 'bicycle-outline' },
    { value: 'training', label: 'Randonnée', icon: 'compass-outline' },
    { value: 'enduro', label: 'Enduro', icon: 'flash-outline' },
  ],
  mtb: [
    { value: 'enduro', label: 'Enduro', icon: 'flash-outline' },
    { value: 'all-mountain', label: 'All Mountain', icon: 'triangle-outline' },
    { value: 'gravity', label: 'Gravity', icon: 'speedometer-outline' },
  ],
};

const TOTAL_STEPS = 5;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface FormState {
  surface: SurfaceType | null;
  discipline: Discipline | null;
  distanceKm: string;
  elevationGainM: string;
  locationName: string;
  raceDate: Date | null;
  riderWeightKg: string;
}

const INITIAL_FORM: FormState = {
  surface: null,
  discipline: null,
  distanceKm: '',
  elevationGainM: '',
  locationName: '',
  raceDate: null,
  riderWeightKg: '',
};

interface NominatimResult {
  display_name: string;
  name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    hamlet?: string;
    suburb?: string;
    country?: string;
  };
}

function CityAutocomplete({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (name: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justPicked = useRef(!!value);

  useEffect(() => {
    if (justPicked.current) {
      justPicked.current = false;
      return;
    }
    if (query.length < 3) {
      const id = setTimeout(() => setSuggestions([]), 0);
      return () => clearTimeout(id);
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const url =
          `https://nominatim.openstreetmap.org/search` +
          `?q=${encodeURIComponent(query)}` +
          `&format=json&limit=6&addressdetails=1&accept-language=fr`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'MichelinRaceApp/1.0' },
        });
        const data = (await res.json()) as NominatimResult[];
        const labels = data.map((item) => {
          const a = item.address;
          const place =
            a?.city ??
            a?.town ??
            a?.village ??
            a?.municipality ??
            a?.hamlet ??
            a?.suburb ??
            item.name ??
            item.display_name.split(',')[0]?.trim() ??
            item.display_name;
          return a?.country ? `${place}, ${a.country}` : place;
        });
        setSuggestions([...new Set(labels)]);
      } catch {
        setSuggestions([]);
      }
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  function pick(name: string) {
    justPicked.current = true;
    setQuery(name);
    onSelect(name);
    setSuggestions([]);
  }

  return (
    <View>
      <View style={styles.inputRow}>
        <Ionicons
          name="location-outline"
          size={18}
          color={colors.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.inputWithIcon}
          value={query}
          onChangeText={(v) => {
            setQuery(v);
            if (!v) onSelect('');
          }}
          placeholder="Ex : Alpe d'Huez, France"
          placeholderTextColor={colors.borderStrong}
          returnKeyType="search"
          autoCorrect={false}
          inputAccessoryViewID={
            Platform.OS === 'ios' ? ACCESSORY_ID : undefined
          }
        />
      </View>
      {suggestions.length > 0 && (
        <View style={styles.suggestList}>
          {suggestions.map((s, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.suggestItem,
                pressed && styles.suggestItemPressed,
              ]}
              onPress={() => pick(s)}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.suggestText} numberOfLines={1}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function RaceDatePicker({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const today = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })[0];
  const maxDate = useState(
    () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  )[0];
  const pickerValue = value ?? today;
  const display = value
    ? value.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <View>
      <Pressable
        style={[styles.inputRow, styles.dateBtn]}
        onPress={() => {
          Keyboard.dismiss();
          if (!value) onChange(today);
          setOpen((o) => !o);
        }}
        accessibilityRole="button"
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={colors.textSecondary}
          style={styles.inputIcon}
        />
        <Text style={[styles.dateText, !display && styles.datePlaceholder]}>
          {display ?? 'Choisir une date'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </Pressable>

      {open && (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={today}
          maximumDate={maxDate}
          locale="fr-FR"
          onChange={(_, selected) => {
            setOpen(false);
            if (selected) onChange(selected);
          }}
        />
      )}
    </View>
  );
}

function StepHeader({ step, onBack }: { step: number; onBack?: () => void }) {
  return (
    <View style={styles.stepHeader}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.backBtn} />
      )}
      <View style={styles.progressBar}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i < step && styles.progressDotActive]}
          />
        ))}
      </View>
      <Text style={styles.stepCount}>
        {step}/{TOTAL_STEPS}
      </Text>
    </View>
  );
}

function ChoiceCard({
  icon,
  label,
  desc,
  selected,
  onPress,
}: {
  icon: IoniconName;
  label: string;
  desc?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.choiceCard, selected && styles.choiceCardActive]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Ionicons
        name={icon}
        size={28}
        color={selected ? colors.brandBlue : colors.textSecondary}
      />
      <Text
        style={[styles.choiceLabel, selected && styles.choiceLabelActive]}
        adjustsFontSizeToFit
        numberOfLines={1}
        minimumFontScale={0.7}
      >
        {label}
      </Text>
      {desc ? <Text style={styles.choiceDesc}>{desc}</Text> : null}
    </Pressable>
  );
}

function RecommendationCard({
  result,
  onReset,
  onSave,
  defaultRaceName,
}: {
  result: RaceAnalyzeResponse;
  onReset: () => void;
  onSave?: (raceName: string) => Promise<void>;
  defaultRaceName?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!onSave || saving || saved) return;
    setSaving(true);
    try {
      await onSave(defaultRaceName || 'Ma course');
      setSaved(true);
      toast.success(
        defaultRaceName ?? 'Ma course',
        'Course sauvegardée dans ton profil',
      );
    } catch {
      toast.error('Impossible de sauvegarder. Réessaie.');
    } finally {
      setSaving(false);
    }
  }

  const { tire, pressure, weatherSummary, justification, confidenceScore } =
    result;
  return (
    <ScrollView
      contentContainerStyle={styles.resultContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.resultEyebrow}>{tire.line.toUpperCase()}</Text>
        <Text style={styles.resultTireName}>{tire.name}</Text>
        <Text style={styles.resultDesc}>{tire.description}</Text>
        <View style={styles.resultBadges}>
          <View style={styles.weatherBadge}>
            <Text style={styles.weatherText}>🌤️ {weatherSummary}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{confidenceScore}% Match</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pression recommandée</Text>
        <View style={styles.pressureRow}>
          <View style={styles.pressureBlock}>
            <Text style={styles.pressureValue}>{pressure.frontBar} bar</Text>
            <Text style={styles.pressureLabel}>Avant</Text>
          </View>
          <View style={styles.pressureDivider} />
          <View style={styles.pressureBlock}>
            <Text style={styles.pressureValue}>{pressure.rearBar} bar</Text>
            <Text style={styles.pressureLabel}>Arrière</Text>
          </View>
        </View>
        <Text style={styles.pressureNote}>{pressure.note}</Text>
      </View>

      {tire.highlights.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Points forts</Text>
          {tire.highlights.map((h) => (
            <View key={h} style={styles.highlightRow}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.brandBlue}
              />
              <Text style={styles.highlightText}>{h}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.card, styles.cardBlue]}>
        <Text style={styles.justifTitle}>Conseil du Bibendum</Text>
        <Text style={styles.justifText}>{justification}</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Prix indicatif</Text>
        <Text style={styles.priceValue}>{tire.priceEur.toFixed(2)} €</Text>
      </View>

      {onSave && (
        <Pressable
          style={[styles.saveBtn, (saving || saved) && styles.saveBtnDisabled]}
          onPress={() => void handleSave()}
          disabled={saving || saved}
        >
          <Ionicons
            name={saved ? 'checkmark-circle' : 'bookmark-outline'}
            size={16}
            color={colors.textOnBrand}
          />
          <Text style={styles.saveBtnText}>
            {saved
              ? 'Course sauvegardée'
              : saving
                ? 'Sauvegarde…'
                : 'Sauvegarder dans mon profil'}
          </Text>
        </Pressable>
      )}

      <Pressable style={styles.resetBtn} onPress={onReset}>
        <Ionicons name="refresh" size={16} color={colors.brandBlue} />
        <Text style={styles.resetBtnText}>Nouvelle analyse</Text>
      </Pressable>
    </ScrollView>
  );
}

function buildLeafletHtml(
  points: { latitude: number; longitude: number }[],
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
): string {
  const coordsJson = JSON.stringify(
    points.map((p) => [p.latitude, p.longitude]),
  );
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{margin:0;padding:0;width:100%;height:100%;background:#f0f0f0;}</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map = L.map('map', {zoomControl:false,attributionControl:false,dragging:true,touchZoom:true,scrollWheelZoom:false,doubleClickZoom:true});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
var coords = ${coordsJson};
var poly = L.polyline(coords, {color:'#27509B',weight:4,opacity:0.9}).addTo(map);
L.circleMarker(coords[0], {radius:7,fillColor:'#2E7D32',color:'#fff',weight:2,fillOpacity:1}).addTo(map);
L.circleMarker(coords[coords.length-1], {radius:7,fillColor:'#FFC300',color:'#fff',weight:2,fillOpacity:1}).addTo(map);
map.fitBounds([[${bounds.minLat},${bounds.minLon}],[${bounds.maxLat},${bounds.maxLon}]], {padding:[20,20]});
</script>
</body></html>`;
}

type DataSource = 'manual' | 'gpx' | 'strava';

export function RaceIntelligenceScreen() {
  const { token, stravaToken: authStravaToken } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RaceAnalyzeResponse | null>(null);

  const [dataSource, setDataSource] = useState<DataSource>('manual');
  const [gpxLoading, setGpxLoading] = useState(false);
  const [gpxFileName, setGpxFileName] = useState<string | null>(null);
  const [routePoints, setRoutePoints] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [routeBounds, setRouteBounds] = useState<{
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  } | null>(null);
  // localStravaToken is used when the user connects Strava from within this screen
  // (email/password users who want Strava data without switching accounts)
  const [localStravaToken, setLocalStravaToken] = useState<string | null>(null);
  const effectiveStravaToken = authStravaToken ?? localStravaToken;
  const [stravaActivities, setStravaActivities] = useState<StravaActivity[]>(
    [],
  );
  const [stravaLoading, setStravaLoading] = useState(false);
  const [stravaConnecting, setStravaConnecting] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null,
  );

  // Auto-load Strava activities when source switches to 'strava' and token is available
  useEffect(() => {
    if (
      dataSource === 'strava' &&
      effectiveStravaToken &&
      stravaActivities.length === 0
    ) {
      void fetchStravaActivities(effectiveStravaToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, effectiveStravaToken]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function pickGpx() {
    try {
      setGpxLoading(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0]!;
      const response = await fetch(asset.uri);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const content = await response.text();
      if (!content.includes('trkpt') && !content.includes('trkseg')) {
        toast.error(
          'Ce fichier ne contient aucun point de trace.',
          'Fichier invalide',
        );
        return;
      }
      const stats = parseGpxMobile(content);
      if (!stats) {
        toast.error('Impossible de lire ce fichier GPX.', 'Fichier invalide');
        return;
      }
      setGpxFileName(asset.name ?? 'fichier.gpx');
      update('distanceKm', String(stats.distanceKm));
      update('elevationGainM', String(stats.elevationGainM));
      setRoutePoints(stats.points);
      setRouteBounds(stats.bounds);

      const firstPoint = stats.points[0];
      if (firstPoint) {
        try {
          const revUrl =
            `https://nominatim.openstreetmap.org/reverse` +
            `?lat=${firstPoint.latitude}&lon=${firstPoint.longitude}` +
            `&format=json&addressdetails=1&accept-language=fr`;
          const revRes = await fetch(revUrl, {
            headers: { 'User-Agent': 'MichelinRaceApp/1.0' },
          });
          if (revRes.ok) {
            const geoData = (await revRes.json()) as NominatimResult;
            const a = geoData.address;
            const place =
              a?.city ??
              a?.town ??
              a?.village ??
              a?.municipality ??
              a?.hamlet ??
              a?.suburb ??
              geoData.name ??
              geoData.display_name.split(',')[0]?.trim() ??
              geoData.display_name;
            const cityName = a?.country ? `${place}, ${a.country}` : place;
            if (cityName) update('locationName', cityName);
          }
        } catch {
          // geocoding optionnel, on ignore les erreurs
        }
      }

      toast.success(
        `${stats.distanceKm} km · ↑ ${stats.elevationGainM} m`,
        'Parcours importé',
      );
      setTimeout(() => setStep(4), 400);
    } catch {
      toast.error("Impossible d'ouvrir le fichier.");
    } finally {
      setGpxLoading(false);
    }
  }

  async function connectStrava() {
    setStravaConnecting(true);
    try {
      const authUrl =
        `https://www.strava.com/oauth/authorize` +
        `?client_id=${STRAVA_CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}` +
        `&scope=activity:read` +
        `&approval_prompt=auto`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'michelin-race://',
      );
      if (result.type !== 'success') return;

      const code = new URL(result.url).searchParams.get('code');
      if (!code) {
        toast.error('Code Strava non reçu.');
        return;
      }

      const tokenRes = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      });
      if (!tokenRes.ok) {
        toast.error('Échange de token Strava échoué.');
        return;
      }
      const { access_token } = (await tokenRes.json()) as {
        access_token: string;
      };
      setLocalStravaToken(access_token);
      toast.success('Tes activités sont prêtes.', 'Strava connecté');
      await fetchStravaActivities(access_token);
    } catch {
      toast.error('Connexion Strava échouée.');
    } finally {
      setStravaConnecting(false);
    }
  }

  async function fetchStravaActivities(tkn: string) {
    setStravaLoading(true);
    try {
      const res = await fetch(
        'https://www.strava.com/api/v3/athlete/activities?per_page=30&page=1',
        { headers: { Authorization: `Bearer ${tkn}` } },
      );
      if (!res.ok) return;
      const data = (await res.json()) as StravaActivity[];
      setStravaActivities(Array.isArray(data) ? data : []);
    } finally {
      setStravaLoading(false);
    }
  }

  async function selectStravaActivity(act: StravaActivity) {
    if (!effectiveStravaToken) return;
    setSelectedActivityId(act.id);
    try {
      const url =
        `https://www.strava.com/api/v3/activities/${act.id}/streams` +
        `?keys=latlng,altitude,distance&key_by_type=true`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${effectiveStravaToken}` },
      });
      if (!res.ok) return;
      const streams = (await res.json()) as {
        latlng?: { data: [number, number][] };
        altitude?: { data: number[] };
        distance?: { data: number[] };
      };
      const distM = streams.distance?.data?.at(-1) ?? 0;
      const distKm = Math.round(distM / 1000);
      const alts = streams.altitude?.data ?? [];
      let elevGain = 0;
      for (let i = 1; i < alts.length; i++) {
        const d = (alts[i] ?? 0) - (alts[i - 1] ?? 0);
        if (d > 0) elevGain += d;
      }
      update('distanceKm', String(distKm || Math.round(act.distance / 1000)));
      update(
        'elevationGainM',
        String(Math.round(distM > 0 ? elevGain : act.total_elevation_gain)),
      );
      const latlngData = streams.latlng?.data ?? [];
      if (latlngData.length >= 2) {
        const step = Math.max(1, Math.floor(latlngData.length / 500));
        const pts = latlngData
          .filter((_, i) => i % step === 0)
          .map(([lat, lon]) => ({ latitude: lat, longitude: lon }));
        setRoutePoints(pts);
        const lats = pts.map((p) => p.latitude);
        const lons = pts.map((p) => p.longitude);
        setRouteBounds({
          minLat: Math.min(...lats),
          maxLat: Math.max(...lats),
          minLon: Math.min(...lons),
          maxLon: Math.max(...lons),
        });
      }
      setTimeout(() => setStep(4), 400);
    } catch {
      update('distanceKm', String(Math.round(act.distance / 1000)));
      update('elevationGainM', String(Math.round(act.total_elevation_gain)));
      setTimeout(() => setStep(4), 400);
    }
  }

  async function analyze() {
    if (!form.surface || !form.discipline || !form.raceDate) return;
    const distanceKm = parseFloat(form.distanceKm);
    const elevationGainM = parseFloat(form.elevationGainM);
    const riderWeightKg = parseFloat(form.riderWeightKg);
    if (!distanceKm || !form.locationName || !riderWeightKg) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    try {
      const data = await raceClient.analyzeRace({
        surface: form.surface,
        discipline: form.discipline,
        distanceKm,
        elevationGainM: elevationGainM || 0,
        riderWeightKg,
        locationName: form.locationName,
        raceDate: form.raceDate.toISOString().split('T')[0]!,
      });
      setResult(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setForm(INITIAL_FORM);
    setResult(null);
    setStep(1);
    setRoutePoints([]);
    setRouteBounds(null);
    setGpxFileName(null);
    setSelectedActivityId(null);
    setLocalStravaToken(null);
    setStravaActivities([]);
    setDataSource('manual');
  }

  async function handleSaveRace(raceName: string) {
    if (
      !token ||
      !result ||
      !form.surface ||
      !form.discipline ||
      !form.raceDate
    )
      throw new Error('missing data');
    await raceClient.createSavedRace(token, {
      raceName: raceName || form.locationName || 'Ma course',
      raceDate: form.raceDate.toISOString().split('T')[0]!,
      locationName: form.locationName,
      surface: form.surface,
      discipline: form.discipline,
      distanceKm: parseFloat(form.distanceKm) || 0,
      elevationGainM: parseFloat(form.elevationGainM) || 0,
      riderWeightKg: parseFloat(form.riderWeightKg) || 0,
      result,
    });
  }

  if (!token)
    return (
      <AuthGate label="Connectez-vous pour analyser votre parcours et obtenir votre recommandation pneu." />
    );

  if (result) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar style="dark" />
        <RecommendationCard
          result={result}
          onReset={reset}
          onSave={handleSaveRace}
          defaultRaceName={form.locationName || undefined}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      {Platform.OS === 'ios' && <InputAccessoryView nativeID={ACCESSORY_ID} />}

      <StepHeader
        step={step}
        onBack={step > 1 ? () => setStep((s) => s - 1) : undefined}
      />

      {step === 4 && (
        <View style={styles.mapStepContainer}>
          <View style={styles.mapStepHeader}>
            <Text style={styles.eyebrow}>ÉTAPE 4</Text>
            <Text style={styles.stepTitle}>Ton parcours</Text>
          </View>

          {routePoints.length >= 2 && routeBounds ? (
            <View style={styles.mapFull}>
              <WebView
                style={{ flex: 1 }}
                originWhitelist={['*']}
                source={{ html: buildLeafletHtml(routePoints, routeBounds) }}
                javaScriptEnabled
                scrollEnabled={false}
              />
            </View>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Ionicons
                name="map-outline"
                size={40}
                color={colors.borderStrong}
              />
              <Text style={styles.mapPlaceholderText}>
                {form.distanceKm} km · ↑ {form.elevationGainM} m
              </Text>
              <Text style={styles.mapPlaceholderSub}>
                Saisie manuelle — pas de tracé GPS
              </Text>
            </View>
          )}

          <View style={styles.mapStepFooter}>
            {routePoints.length >= 2 && (
              <View style={styles.mapStats}>
                <View style={styles.mapStat}>
                  <Ionicons
                    name="swap-horizontal-outline"
                    size={16}
                    color={colors.brandBlue}
                  />
                  <Text style={styles.mapStatValue}>{form.distanceKm} km</Text>
                </View>
                <View style={styles.mapStatDivider} />
                <View style={styles.mapStat}>
                  <Ionicons
                    name="trending-up-outline"
                    size={16}
                    color={colors.brandBlue}
                  />
                  <Text style={styles.mapStatValue}>
                    ↑ {form.elevationGainM} m
                  </Text>
                </View>
              </View>
            )}
            <Pressable style={styles.nextBtn} onPress={() => setStep(5)}>
              <Text style={styles.nextBtnText}>Suivant</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={colors.textOnBrand}
              />
            </Pressable>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={step === 4 ? { display: 'none' } : undefined}
        >
          {step === 1 && (
            <View style={styles.stepBody}>
              <Text style={styles.eyebrow}>ÉTAPE 1</Text>
              <Text style={styles.stepTitle}>Quelle est ta surface ?</Text>
              <View style={styles.choiceGrid}>
                {SURFACES.map((s) => (
                  <ChoiceCard
                    key={s.value}
                    icon={s.icon}
                    label={s.label}
                    desc={s.desc}
                    selected={form.surface === s.value}
                    onPress={() => {
                      update('surface', s.value);
                      update('discipline', null);
                      setStep(2);
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {step === 2 && form.surface && (
            <View style={styles.stepBody}>
              <Text style={styles.eyebrow}>ÉTAPE 2</Text>
              <Text style={styles.stepTitle}>Quelle est ta discipline ?</Text>
              <View style={styles.choiceGrid}>
                {DISCIPLINES[form.surface].map((d) => (
                  <ChoiceCard
                    key={d.value}
                    icon={d.icon}
                    label={d.label}
                    selected={form.discipline === d.value}
                    onPress={() => {
                      update('discipline', d.value);
                      setStep(3);
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepBody}>
              <Text style={styles.eyebrow}>ÉTAPE 3</Text>
              <Text style={styles.stepTitle}>Ton parcours</Text>

              <View style={styles.sourceGrid}>
                {(
                  [
                    {
                      src: 'manual',
                      icon: 'create-outline' as IoniconName,
                      label: 'Manuel',
                    },
                    {
                      src: 'gpx',
                      icon: 'document-outline' as IoniconName,
                      label: 'GPX',
                    },
                  ] as { src: DataSource; icon: IoniconName; label: string }[]
                ).map(({ src, icon, label }) => (
                  <Pressable
                    key={src}
                    style={[
                      styles.sourceCard,
                      dataSource === src && styles.sourceCardActive,
                    ]}
                    onPress={() => setDataSource(src)}
                  >
                    <Ionicons
                      name={icon}
                      size={22}
                      color={
                        dataSource === src
                          ? colors.brandBlue
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.sourceLabel,
                        dataSource === src && styles.sourceLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  style={[
                    styles.sourceCard,
                    dataSource === 'strava' && styles.sourceCardActive,
                  ]}
                  onPress={() => setDataSource('strava')}
                >
                  <Text
                    style={[
                      styles.stravaS,
                      dataSource === 'strava' && styles.stravaSActive,
                    ]}
                  >
                    S
                  </Text>
                  <Text
                    style={[
                      styles.sourceLabel,
                      dataSource === 'strava' && styles.sourceLabelActive,
                    ]}
                  >
                    Strava
                  </Text>
                </Pressable>
              </View>

              {dataSource === 'manual' && (
                <>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Distance</Text>
                    <View style={styles.inputRow}>
                      <Ionicons
                        name="swap-horizontal-outline"
                        size={18}
                        color={colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.inputWithIcon}
                        value={form.distanceKm}
                        onChangeText={(v) => update('distanceKm', v)}
                        keyboardType="numeric"
                        placeholder="80"
                        placeholderTextColor={colors.borderStrong}
                        returnKeyType="done"
                        inputAccessoryViewID={
                          Platform.OS === 'ios' ? ACCESSORY_ID : undefined
                        }
                      />
                      <Text style={styles.inputUnit}>km</Text>
                    </View>
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Dénivelé positif</Text>
                    <View style={styles.inputRow}>
                      <Ionicons
                        name="trending-up-outline"
                        size={18}
                        color={colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.inputWithIcon}
                        value={form.elevationGainM}
                        onChangeText={(v) => update('elevationGainM', v)}
                        keyboardType="numeric"
                        placeholder="1200"
                        placeholderTextColor={colors.borderStrong}
                        returnKeyType="done"
                        inputAccessoryViewID={
                          Platform.OS === 'ios' ? ACCESSORY_ID : undefined
                        }
                      />
                      <Text style={styles.inputUnit}>m</Text>
                    </View>
                  </View>
                </>
              )}

              {dataSource === 'gpx' && (
                <View style={styles.field}>
                  <Pressable
                    style={[
                      styles.importBtn,
                      gpxLoading && styles.importBtnLoading,
                    ]}
                    onPress={pickGpx}
                    disabled={gpxLoading}
                  >
                    {gpxLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.brandBlue}
                      />
                    ) : (
                      <Ionicons
                        name="cloud-upload-outline"
                        size={20}
                        color={colors.brandBlue}
                      />
                    )}
                    <Text style={styles.importBtnText}>
                      {gpxLoading
                        ? 'Lecture…'
                        : gpxFileName
                          ? 'Changer de fichier'
                          : 'Importer un fichier GPX'}
                    </Text>
                  </Pressable>
                  {gpxFileName && (
                    <View style={styles.gpxResult}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.stateSuccess}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.gpxFileName} numberOfLines={1}>
                          {gpxFileName}
                        </Text>
                        <Text style={styles.gpxStats}>
                          {form.distanceKm} km · ↑ {form.elevationGainM} m
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {dataSource === 'strava' && (
                <View style={styles.field}>
                  {!effectiveStravaToken ? (
                    <Pressable
                      style={[
                        styles.stravaBtn,
                        stravaConnecting && styles.importBtnLoading,
                      ]}
                      onPress={connectStrava}
                      disabled={stravaConnecting}
                    >
                      {stravaConnecting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.stravaBtnIcon}>S</Text>
                      )}
                      <Text style={styles.stravaBtnText}>
                        {stravaConnecting
                          ? 'Connexion…'
                          : 'Se connecter avec Strava'}
                      </Text>
                    </Pressable>
                  ) : (
                    <View style={styles.stravaList}>
                      {stravaLoading && (
                        <ActivityIndicator
                          size="small"
                          color={colors.brandBlue}
                          style={{
                            alignSelf: 'center',
                            marginVertical: spacing[4],
                          }}
                        />
                      )}
                      {!stravaLoading && stravaActivities.length === 0 && (
                        <Text style={styles.stravaEmpty}>
                          Aucune activité trouvée sur Strava.
                        </Text>
                      )}
                      {stravaActivities.map((act) => {
                        const distKm = Math.round(act.distance / 1000);
                        const elevM = Math.round(act.total_elevation_gain);
                        const date = new Date(
                          act.start_date_local,
                        ).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        });
                        const isSelected = selectedActivityId === act.id;
                        return (
                          <Pressable
                            key={act.id}
                            style={[
                              styles.stravaItem,
                              isSelected && styles.stravaItemSelected,
                            ]}
                            onPress={() => selectStravaActivity(act)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text
                                style={styles.stravaItemName}
                                numberOfLines={1}
                              >
                                {act.name}
                              </Text>
                              <Text style={styles.stravaItemMeta}>
                                {sportTypeLabel(act.sport_type)} · {distKm} km ·
                                ↑ {elevM} m · {date}
                              </Text>
                            </View>
                            {isSelected && (
                              <Ionicons
                                name="checkmark-circle"
                                size={18}
                                color={colors.brandBlue}
                              />
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              <Pressable
                style={[
                  styles.nextBtn,
                  !form.distanceKm && styles.nextBtnDisabled,
                ]}
                disabled={!form.distanceKm}
                onPress={() => setStep(4)}
              >
                <Text style={styles.nextBtnText}>Suivant</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={colors.textOnBrand}
                />
              </Pressable>
            </View>
          )}

          {step === 5 && (
            <View style={styles.stepBody}>
              <Text style={styles.eyebrow}>ÉTAPE 5</Text>
              <Text style={styles.stepTitle}>Les derniers détails</Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Lieu de départ</Text>
                <CityAutocomplete
                  value={form.locationName}
                  onSelect={(name) => update('locationName', name)}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Date de course</Text>
                <RaceDatePicker
                  value={form.raceDate}
                  onChange={(d) => update('raceDate', d)}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Ton poids</Text>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputWithIcon}
                    value={form.riderWeightKg}
                    onChangeText={(v) => update('riderWeightKg', v)}
                    keyboardType="numeric"
                    placeholder="72"
                    placeholderTextColor={colors.borderStrong}
                    returnKeyType="done"
                    onSubmitEditing={analyze}
                    inputAccessoryViewID={
                      Platform.OS === 'ios' ? ACCESSORY_ID : undefined
                    }
                  />
                  <Text style={styles.inputUnit}>kg</Text>
                </View>
              </View>

              <Pressable
                style={[styles.analyzeBtn, loading && styles.analyzeBtnLoading]}
                onPress={analyze}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textOnYellow} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="analytics"
                      size={18}
                      color={colors.textOnYellow}
                    />
                    <Text style={styles.analyzeBtnText}>
                      Analyser ma course
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceCanvas },

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
  progressBar: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing[2],
  },
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
    paddingBottom: 130,
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
    backgroundColor: colors.surfaceDefault,
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
    backgroundColor: colors.surfaceDefault,
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

  suggestList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceDefault,
    overflow: 'hidden',
    ...shadows.low,
  },
  suggestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  suggestItemPressed: { backgroundColor: colors.surfaceCanvas },
  suggestText: {
    flex: 1,
    fontSize: fontSize.bodySmall,
    color: colors.textPrimary,
  },

  dateBtn: { justifyContent: 'space-between' },
  dateText: { flex: 1, fontSize: fontSize.body, color: colors.textPrimary },
  datePlaceholder: { color: colors.borderStrong },

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

  errorBox: {
    padding: spacing[4],
    borderRadius: radius.medium,
    backgroundColor: 'rgba(179,38,30,0.10)',
    color: colors.stateError,
    fontSize: fontSize.bodySmall,
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.large,
    backgroundColor: colors.brandYellow,
    marginTop: spacing[2],
  },
  analyzeBtnLoading: { opacity: 0.7 },
  analyzeBtnText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.black,
    color: colors.textOnYellow,
  },

  resultContent: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: 130,
    gap: spacing[4],
  },
  resultHeader: {
    padding: spacing[6],
    borderRadius: radius.xlarge,
    backgroundColor: colors.surfaceBrand,
    gap: spacing[2],
  },
  resultEyebrow: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    color: colors.brandYellow,
  },
  resultTireName: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.black,
    color: colors.textOnBrand,
    letterSpacing: -0.5,
  },
  resultDesc: {
    fontSize: fontSize.body,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
  },
  resultBadges: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
    flexWrap: 'wrap',
  },
  weatherBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  weatherText: { fontSize: fontSize.caption, color: colors.textOnBrand },
  scoreBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.brandYellow,
  },
  scoreText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    color: colors.textOnYellow,
  },

  card: {
    padding: spacing[6],
    borderRadius: radius.xlarge,
    backgroundColor: colors.surfaceDefault,
    gap: spacing[3],
    ...shadows.low,
  },
  cardBlue: {
    backgroundColor: 'rgba(39,80,155,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(39,80,155,0.15)',
  },
  cardTitle: {
    fontSize: fontSize.h4,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },

  pressureRow: { flexDirection: 'row', alignItems: 'center' },
  pressureBlock: { flex: 1, alignItems: 'center', gap: 4 },
  pressureDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderDefault,
  },
  pressureValue: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.black,
    color: colors.brandBlue,
  },
  pressureLabel: { fontSize: fontSize.caption, color: colors.textSecondary },
  pressureNote: {
    fontSize: fontSize.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  highlightText: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    flex: 1,
  },

  justifTitle: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.black,
    color: colors.brandBlue,
    letterSpacing: 0.5,
  },
  justifText: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: radius.large,
    backgroundColor: colors.surfaceDefault,
    ...shadows.low,
  },
  priceLabel: { fontSize: fontSize.body, color: colors.textSecondary },
  priceValue: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
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
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.brandBlue,
  },

  mapStepContainer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
    gap: spacing[4],
  },
  mapStepHeader: { gap: spacing[1] },
  mapFull: {
    height: 360,
    borderRadius: radius.xlarge,
    overflow: 'hidden',
  },
  mapStepFooter: { gap: spacing[3] },

  mapContainer: {
    borderRadius: radius.xlarge,
    overflow: 'hidden',
    ...shadows.medium,
  },
  map: {
    width: '100%',
    height: SCREEN_WIDTH - spacing[6] * 2,
  },
  mapStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    backgroundColor: colors.surfaceDefault,
    gap: spacing[4],
  },
  mapStat: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  mapStatValue: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  mapStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.borderDefault,
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    paddingVertical: spacing[10],
    borderRadius: radius.xlarge,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  mapPlaceholderSub: {
    fontSize: fontSize.bodySmall,
    color: colors.textSecondary,
  },

  sourceGrid: { flexDirection: 'row', gap: spacing[3] },
  sourceCard: {
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
  sourceCardActive: {
    borderColor: colors.brandBlue,
    backgroundColor: 'rgba(39,80,155,0.06)',
  },
  sourceLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  sourceLabelActive: { color: colors.brandBlue },
  stravaS: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: '#FC4C02',
    lineHeight: 24,
  },
  stravaSActive: { color: '#FC4C02' },

  importBtn: {
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
  importBtnLoading: { opacity: 0.6 },
  importBtnText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.brandBlue,
  },
  gpxResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.medium,
    backgroundColor: 'rgba(39,80,155,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(39,80,155,0.15)',
    marginTop: spacing[2],
  },
  gpxFileName: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  gpxStats: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  stravaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.large,
    backgroundColor: '#FC4C02',
  },
  stravaBtnText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.black,
    color: '#fff',
  },
  stravaBtnIcon: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: '#fff',
    lineHeight: 22,
  },
  stravaList: {
    borderRadius: radius.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    maxHeight: 300,
  },
  stravaEmpty: {
    padding: spacing[4],
    textAlign: 'center',
    fontSize: fontSize.bodySmall,
    color: colors.textSecondary,
  },
  stravaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    backgroundColor: colors.surfaceDefault,
  },
  stravaItemSelected: { backgroundColor: 'rgba(39,80,155,0.06)' },
  stravaItemName: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  stravaItemMeta: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  saveSection: {
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.xlarge,
    backgroundColor: colors.surfaceDefault,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    ...shadows.low,
  },
  saveLabel: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  saveInput: {
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    borderRadius: radius.medium,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: fontSize.body,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceCanvas,
  },
  saveError: {
    fontSize: fontSize.caption,
    color: colors.stateError,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.large,
    backgroundColor: colors.brandBlue,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.black,
    color: colors.textOnBrand,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
  },
  savedText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.stateSuccess,
  },
});
