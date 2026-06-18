import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { RiderProfile } from '@/features/rider-profile/components/rider-profile';
import { getCurrentUser } from '@/features/auth/services/current-user';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mon Profil — Michelin Race' };

interface StravaProfileCookie {
  id: number;
  firstName: string;
  lastName: string;
  photo: string;
  city: string;
  country: string;
  bikes: Array<{
    id: string;
    name: string;
    distance: number;
    primary: boolean;
  }>;
}

export default async function ProfilPage() {
  const cookieStore = await cookies();
  const stravaAt = cookieStore.get('strava_at')?.value;
  const user = await getCurrentUser();

  if (!stravaAt && !user) redirect('/login');

  const profileRaw = cookieStore.get('strava_profile')?.value;
  let initialProfile: StravaProfileCookie | null = null;

  if (profileRaw) {
    try {
      initialProfile = JSON.parse(
        decodeURIComponent(profileRaw),
      ) as StravaProfileCookie;
    } catch {
      /* cookie invalide */
    }
  }

  return (
    <RiderProfile
      initialProfile={initialProfile}
      authUser={user}
      stravaConnected={!!stravaAt}
    />
  );
}
