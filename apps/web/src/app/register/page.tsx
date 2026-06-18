import { AuthShell } from '@/features/auth/components/auth-shell';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata = { title: 'Inscription — Michelin Race' };

export default function RegisterPage() {
  return (
    <AuthShell>
      <div className="auth-card">
        <h1 className="auth-card-title">Créer un compte</h1>
        <p className="auth-subtitle">
          Rejoins la communauté Michelin Race Intelligence.
        </p>
        <RegisterForm />
      </div>
    </AuthShell>
  );
}
