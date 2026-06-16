import { useState } from 'react';

import { useAuth } from '../context/auth-context';

const PASSWORD_RULES = [
  { label: '8 caractères minimum', test: (v: string) => v.length >= 8 },
  { label: 'Une majuscule', test: (v: string) => /[A-Z]/.test(v) },
  {
    label: 'Un caractère spécial',
    test: (v: string) => /[^a-zA-Z0-9]/.test(v),
  },
] as const;

interface Fields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
}

export function useRegisterForm() {
  const { register } = useAuth();
  const [fields, setFields] = useState<Fields>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(key: keyof Fields) {
    return (value: string) => setFields((f) => ({ ...f, [key]: value }));
  }

  const bothFilled = fields.password.length > 0 && fields.confirm.length > 0;
  const passwordsMatch = fields.password === fields.confirm;
  const isDisabled = pending || (bothFilled && !passwordsMatch);

  const passwordRules = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    valid: rule.test(fields.password),
  }));

  async function submit() {
    if (isDisabled) return;
    setPending(true);
    setError(null);
    try {
      const { firstName, lastName, email, password } = fields;
      await register({ firstName, lastName, email, password });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Inscription échouée.');
    } finally {
      setPending(false);
    }
  }

  return {
    fields,
    update,
    error,
    pending,
    submit,
    isDisabled,
    bothFilled,
    passwordsMatch,
    passwordRules,
  };
}
