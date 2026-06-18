import { cookies } from 'next/headers';

import { Header, HeaderIconLink } from '@/components/layout/header';
import { UserMenu } from '@/features/auth/components/user-menu';
import { getCurrentUser } from '@/features/auth/services/current-user';

const MAIN_NAVIGATION = [
  { href: '/', label: 'Accueil' },
  { href: '/products', label: 'Catalogue' },
  { href: '/comparateur', label: 'Comparateur' },
  { href: '/challenge', label: 'Challenge' },
  { href: '/reprise', label: 'Reprise' },
];

export async function AppHeader() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const stravaConnected = !!cookieStore.get('strava_at')?.value;

  const navigation = [...MAIN_NAVIGATION];

  if (user || stravaConnected) {
    navigation.push({ href: '/profil', label: 'Mon Profil' });
  }

  if (user?.isAdmin) {
    navigation.push({ href: '/admin/users', label: 'Back Office' });
  }

  return (
    <Header
      actions={
        user || stravaConnected ? (
          <UserMenu isAdmin={user?.isAdmin ?? false} />
        ) : (
          <HeaderIconLink href="/login" label="Connexion" />
        )
      }
      cta={{ href: '/race-intelligence', label: 'Lancer Race Intelligence' }}
      navigation={navigation}
    />
  );
}
