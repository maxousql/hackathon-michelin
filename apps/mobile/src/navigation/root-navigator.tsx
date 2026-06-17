import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import logo from '../../assets/logo-michelin-race.png';

import { useAuth } from '../features/auth/context/auth-context';
import { LoginScreen } from '../features/auth/screens/login-screen';
import { RegisterScreen } from '../features/auth/screens/register-screen';
import { AdminUsersScreen } from '../features/admin/screens/admin-users-screen';
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
} from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const CatalogStack = createNativeStackNavigator<CatalogStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

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
  return (
    <ProductDetailScreen
      id={route.params.id}
      onBack={() => navigation.goBack()}
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

function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Catalog" component={CatalogNavigator} />
      <Tab.Screen name="Race" component={RaceIntelligenceScreen} />
      <Tab.Screen name="Reprise" component={RepriseScreen} />
      <Tab.Screen name="Admin" component={AdminUsersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { token, isLoading } = useAuth();
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
      {token ? <AppNavigator /> : <AuthNavigator />}
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
