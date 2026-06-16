import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata = { title: 'Inscription — Michelin Race' };

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Créer un compte</h1>
        <p className="auth-subtitle">
          Rejoins la communauté Michelin Race Intelligence.
        </p>
        <RegisterForm />
      </div>
    </main>
  );
}
