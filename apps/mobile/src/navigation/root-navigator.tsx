import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import logo from '../../assets/logo-michelin-race.png';

import { useAuth } from '../features/auth/context/auth-context';
import { LoginScreen } from '../features/auth/screens/login-screen';
import { RegisterScreen } from '../features/auth/screens/register-screen';
import { AdminUsersScreen } from '../features/admin/screens/admin-users-screen';
import { ChallengeScreen } from '../features/challenge/screens/challenge-screen';
import { ComparatorScreen } from '../features/comparator/screens/comparator-screen';
import { RepriseScreen } from '../features/buyback/screens/reprise-screen';
import { HomeScreen } from '../features/home/screens/home-screen';
import { ProfileScreen } from '../features/profile/screens/profile-screen';
import { RaceIntelligenceScreen } from '../features/race-intelligence/screens/race-intelligence-screen';
import { CatalogScreen } from '../features/products/components/catalog-screen';
import { ProductDetailScreen } from '../features/products/components/product-detail-screen';
import { colors } from '../theme';
import { FloatingTabBar } from './floating-tab-bar';
import type {
  AppTabParamList,
  AuthStackParamList,
  CatalogStackParamList,
  RootStackParamList,
} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const CatalogStack = createNativeStackNavigator<CatalogStackParamList>();

// ─── Auth screens (modal) — auto-dismisses when token is set ─────────────────

function AuthScreens(
  _props: NativeStackScreenProps<RootStackParamList, 'Auth'>,
) {
  const { token } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (token) navigation.goBack();
  }, [token, navigation]);

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Catalog nested stack ─────────────────────────────────────────────────────

function CatalogMain({
  navigation,
}: NativeStackScreenProps<CatalogStackParamList, 'CatalogMain'>) {
  return (
    <CatalogScreen
      onSelect={(id) => navigation.navigate('ProductDetail', { id })}
    />
  );
}

function ProductDetailWrapper({
  route,
  navigation,
}: NativeStackScreenProps<CatalogStackParamList, 'ProductDetail'>) {
  const tabNav = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
  return (
    <ProductDetailScreen
      id={route.params.id}
      onBack={() => navigation.goBack()}
      onNavigateToComparator={() => tabNav.navigate('Comparateur')}
    />
  );
}

function CatalogNavigator() {
  return (
    <CatalogStack.Navigator screenOptions={{ headerShown: false }}>
      <CatalogStack.Screen name="CatalogMain" component={CatalogMain} />
      <CatalogStack.Screen
        name="ProductDetail"
        component={ProductDetailWrapper}
      />
    </CatalogStack.Navigator>
  );
}

// ─── Tab navigator (always visible, no auth gate) ────────────────────────────

function AppTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Catalog" component={CatalogNavigator} />
      <Tab.Screen name="Race" component={RaceIntelligenceScreen} />
      <Tab.Screen name="Challenge" component={ChallengeScreen} />
      <Tab.Screen name="Comparateur" component={ComparatorScreen} />
      <Tab.Screen name="Reprise" component={RepriseScreen} />
      <Tab.Screen name="Admin" component={AdminUsersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

export function RootNavigator() {
  const { isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingBadge}>
          <Image
            source={logo}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
        </View>
        <ActivityIndicator
          size="small"
          color="rgba(255,255,255,0.5)"
          style={styles.loadingSpinner}
        />
      </View>
    );
  }

  return (
    <>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={AppTabNavigator} />
        <RootStack.Screen name="Auth" component={AuthScreens} />
      </RootStack.Navigator>
      <Toast topOffset={insets.top + 8} />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandMidnight,
  },
  loadingBadge: {
    backgroundColor: colors.surfaceDefault,
    borderRadius: 32,
    padding: 20,
  },
  loadingLogo: {
    width: 200,
    height: 200,
  },
  loadingSpinner: {
    marginTop: 32,
  },
});
