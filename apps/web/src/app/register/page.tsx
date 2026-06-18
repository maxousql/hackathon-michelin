import { redirect } from 'next/navigation';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { RegisterForm } from '@/features/auth/components/register-form';
import { getCurrentUser } from '@/features/auth/services/current-user';

export const metadata = { title: 'Inscription — Michelin Race' };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');

  return (
    <AuthShell
      eyebrow="Nouveau profil"
      title="Créer un compte"
      subtitle="Centralisez vos recommandations Michelin et vos services vélo."
    >
      <RegisterForm />
    </AuthShell>
  );
}
