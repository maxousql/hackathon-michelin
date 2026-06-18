import { redirect } from 'next/navigation';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/components/login-form';
import { getCurrentUser } from '@/features/auth/services/current-user';

export const metadata = { title: 'Connexion — Michelin Race' };

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

const STRAVA_ERROR_MESSAGE =
  "La connexion Strava a échoué. Vérifiez que vous avez bien autorisé l'accès et réessayez.";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) redirect('/');

  const { error } = await searchParams;

  return (
    <AuthShell
      eyebrow="Espace membre"
      title="Connexion"
      subtitle="Accédez à votre espace Michelin Race et reprenez votre analyse."
    >
      <LoginForm
        errorMessage={error === 'strava' ? STRAVA_ERROR_MESSAGE : undefined}
      />
    </AuthShell>
  );
}
