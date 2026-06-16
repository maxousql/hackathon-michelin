import { LoginForm } from '@/features/auth/components/login-form';

export const metadata = { title: 'Connexion — Michelin Race' };

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Connexion</h1>
        <p className="auth-subtitle">
          Accède à ta Race Intelligence personnalisée.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
