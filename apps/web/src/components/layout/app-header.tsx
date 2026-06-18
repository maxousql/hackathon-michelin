import { cookies } from 'next/headers';

import { Header } from '@/components/layout/header';
import { UserMenu } from '@/features/auth/components/user-menu';
import { getCurrentUser } from '@/features/auth/services/current-user';

const MAIN_NAVIGATION = [
  { href: '/', label: 'Accueil' },
  { href: '/products', label: 'Catalogue' },
  { href: '/comparateur', label: 'Comparateur' },
  { href: '/challenge', label: 'Challenge' },
  { href: '/reprise', label: 'Reprise' },
];

const AUTH_NAVIGATION = [
  { href: '/login', label: 'Connexion' },
  { href: '/register', label: 'Inscription' },
];

export async function AppHeader() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const stravaConnected = !!cookieStore.get('strava_at')?.value;

  const navigation = [...MAIN_NAVIGATION];

  if (stravaConnected) {
    navigation.push({ href: '/profil', label: 'Mon Profil' });
  }

  if (!user && !stravaConnected) {
    navigation.push(...AUTH_NAVIGATION);
  }

  if (user?.isAdmin) {
    navigation.push({ href: '/admin/users', label: 'Back Office' });
  }

  const actions =
    !stravaConnected && user ? (
      <UserMenu isAdmin={user.isAdmin} stravaConnected={false} />
    ) : undefined;

  return (
    <Header
      actions={actions}
      cta={{ href: '/race-intelligence', label: 'Lancer Race Intelligence' }}
      navigation={navigation}
    />
  );
}
