import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../features/auth/context/auth-context';
import { LoginScreen } from '../features/auth/screens/login-screen';
import { RegisterScreen } from '../features/auth/screens/register-screen';
import { AdminUsersScreen } from '../features/admin/screens/admin-users-screen';
import { RepriseScreen } from '../features/buyback/screens/reprise-screen';
import { HomeScreen } from '../features/home/screens/home-screen';
import { LandingScreen } from '../features/landing/components/landing-screen';
import { CatalogScreen } from '../features/products/components/catalog-screen';
import { ProductDetailScreen } from '../features/products/components/product-detail-screen';
import { colors } from '../theme';
import type { AppStackParamList, AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function CatalogScreenWrapper({
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'Catalog'>) {
  return (
    <CatalogScreen
      onSelect={(id) => navigation.navigate('ProductDetail', { id })}
    />
  );
}

function ProductDetailScreenWrapper({
  route,
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'ProductDetail'>) {
  return (
    <ProductDetailScreen
      id={route.params.id}
      onBack={() => navigation.goBack()}
    />
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Landing" component={LandingScreen} />
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen name="Catalog" component={CatalogScreenWrapper} />
      <AppStack.Screen
        name="ProductDetail"
        component={ProductDetailScreenWrapper}
      />
      <AppStack.Screen name="Reprise" component={RepriseScreen} />
      <AppStack.Screen name="AdminUsers" component={AdminUsersScreen} />
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.brandBlue} />
      </View>
    );
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCanvas,
  },
});
