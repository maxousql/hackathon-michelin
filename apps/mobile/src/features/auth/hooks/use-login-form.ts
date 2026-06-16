import { useState } from 'react';

import { useAuth } from '../context/auth-context';

interface Fields {
  email: string;
  password: string;
}

export function useLoginForm() {
  const { login } = useAuth();
  const [fields, setFields] = useState<Fields>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(key: keyof Fields) {
    return (value: string) => setFields((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!fields.email || !fields.password || pending) return;
    setPending(true);
    setError(null);
    try {
      await login(fields);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Connexion échouée.');
    } finally {
      setPending(false);
    }
  }

  return { fields, update, error, pending, submit };
}
