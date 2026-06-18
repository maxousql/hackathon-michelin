import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata = { title: 'Connexion — Michelin Race' };

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <AuthShell>
      <div className="auth-card">
        <h1 className="auth-card-title">Connexion</h1>
        <p className="auth-subtitle">
          Accède à ta Race Intelligence personnalisée.
        </p>
        {error === 'strava' && (
          <p className="form-error" style={{ marginBottom: '1rem' }}>
            La connexion Strava a échoué. Vérifie que tu as bien autorisé
            l&apos;accès et réessaie.
          </p>
        )}
        <LoginForm />
      </div>
    </AuthShell>
  );
}
