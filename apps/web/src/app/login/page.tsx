import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata = { title: 'Connexion — Michelin Race' };

export default function LoginPage() {
  return (
    <AuthShell>
      <div className="auth-card">
        <h1 className="auth-card-title">Connexion</h1>
        <p className="auth-subtitle">
          Accède à ta Race Intelligence personnalisée.
        </p>
        <LoginForm />
      </div>
    </AuthShell>
  );
}
