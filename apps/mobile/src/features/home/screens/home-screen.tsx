import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import heroImage from '../../../../assets/michelin-race-hero.jpg';
import { colors, radius, spacing } from '../../../theme';
import { useAuth } from '../../auth/context/auth-context';
import type { AppTabParamList } from '../../../navigation/types';

type HomeNavProp = BottomTabNavigationProp<AppTabParamList, 'Home'>;

const NEWS = [
  {
    id: '1',
    label: 'Nouveautés 2026',
    title:
      'Les pneus vélo 2026 redéfinissent la performance sur route, gravel et VTT.',
  },
  {
    id: '2',
    label: 'Partenariat',
    title: 'Michelin fait équipe avec Romain Bardet pour la saison 2026.',
  },
  {
    id: '3',
    label: 'Compétition',
    title: 'Partenaire principal des WHOOP UCI MTB World Series.',
  },
];

export function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<HomeNavProp>();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>{greeting},</Text>
          <Text style={styles.userName}>
            {user?.firstName ?? 'Cycliste'} 👋
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Pressable
          onPress={() => navigation.navigate('Race')}
          style={({ pressed }) => [
            styles.heroCard,
            pressed && { opacity: 0.88 },
          ]}
        >
          <ImageBackground
            source={heroImage}
            style={styles.heroBg}
            imageStyle={styles.heroBgImg}
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>RACE INTELLIGENCE</Text>
              </View>
              <Text style={styles.heroTitle}>
                Trouvez le pneu{'\n'}parfait pour{'\n'}votre parcours.
              </Text>
              <View style={styles.heroCta}>
                <Text style={styles.heroCtaText}>Lancer le Race Finder</Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={colors.base.white}
                />
              </View>
            </View>
          </ImageBackground>
        </Pressable>

        <Text style={styles.sectionLabel}>Accès rapide</Text>
        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              styles.actionNavy,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => navigation.navigate('Catalog')}
          >
            <Ionicons
              name="grid-outline"
              size={22}
              color={colors.brandYellow}
            />
            <Text style={styles.actionTitle}>Catalogue</Text>
            <Text style={styles.actionSub}>Tous nos pneus</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              styles.actionBlue,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => navigation.navigate('Reprise')}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={22}
              color={colors.brandYellow}
            />
            <Text style={styles.actionTitle}>Reprise</Text>
            <Text style={styles.actionSub}>Estimer mon vélo</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>L'actu Michelin</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newsStrip}
          decelerationRate="fast"
        >
          {NEWS.map((item) => (
            <View key={item.id} style={styles.newsCard}>
              <Text style={styles.newsLabel}>{item.label}</Text>
              <Text style={styles.newsTitle} numberOfLines={3}>
                {item.title}
              </Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.brandMidnight,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
    paddingBottom: spacing[6],
    backgroundColor: colors.brandMidnight,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    color: colors.base.white,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.surfaceCanvas,
  },
  content: {
    paddingTop: spacing[4],
    paddingHorizontal: spacing[4],
    paddingBottom: 110,
    gap: spacing[4],
  },

  heroCard: {
    borderRadius: radius.xlarge,
    overflow: 'hidden',
    height: 200,
  },
  heroBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroBgImg: {
    borderRadius: radius.xlarge,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,12,52,0.60)',
  },
  heroContent: {
    padding: spacing[6],
    gap: spacing[2],
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brandYellow,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 2,
  },
  heroBadgeText: {
    color: colors.textOnYellow,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    color: colors.base.white,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  heroCtaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },

  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: -spacing[2],
  },

  actionsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionCard: {
    flex: 1,
    borderRadius: radius.xlarge,
    padding: spacing[4],
    minHeight: 112,
    justifyContent: 'flex-end',
    gap: 4,
  },
  actionNavy: {
    backgroundColor: colors.brandDarkBlue,
  },
  actionBlue: {
    backgroundColor: colors.brandBlue,
  },
  actionTitle: {
    color: colors.textOnBrand,
    fontSize: 16,
    fontWeight: '800',
    marginTop: spacing[2],
  },
  actionSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },

  newsStrip: {
    gap: spacing[3],
    paddingRight: spacing[4],
  },
  newsCard: {
    width: 196,
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.large,
    padding: spacing[4],
    justifyContent: 'space-between',
    minHeight: 118,
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  newsLabel: {
    color: colors.brandBlue,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  newsTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
