import { Header } from '@/components/layout/header';
import { UserMenu } from '@/features/auth/components/user-menu';
import { getCurrentUser } from '@/features/auth/services/current-user';

const MAIN_NAVIGATION = [
  { href: '/', label: 'Accueil' },
  { href: '/products', label: 'Catalogue' },
  { href: '/comparateur', label: 'Comparateur' },
  { href: '/reprise', label: 'Reprise' },
];

const AUTH_NAVIGATION = [
  { href: '/login', label: 'Connexion' },
  { href: '/register', label: 'Inscription' },
];

export async function AppHeader() {
  const user = await getCurrentUser();
  const navigation = user
    ? [...MAIN_NAVIGATION]
    : [...MAIN_NAVIGATION, ...AUTH_NAVIGATION];

  if (user?.isAdmin) {
    navigation.push({ href: '/admin/users', label: 'Back Office' });
  }

  return (
    <Header
      actions={user ? <UserMenu isAdmin={user.isAdmin} /> : undefined}
      cta={{ href: '/race-intelligence', label: 'Lancer Race Intelligence' }}
      navigation={navigation}
    />
  );
}
