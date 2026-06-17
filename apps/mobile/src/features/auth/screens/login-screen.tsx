import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef } from 'react';
import { type TextInput, Keyboard, StyleSheet, Text } from 'react-native';
import { toast } from '../../../utils/toast';

import { AppButton } from '../../../components/app-button';
import { AppTextInput } from '../../../components/app-text-input';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';
import { AuthScreenShell } from '../components/auth-screen-shell';
import { useLoginForm } from '../hooks/use-login-form';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ navigation }: Props) {
  const { fields, update, error, pending, submit } = useLoginForm();
  const passwordRef = useRef<TextInput>(null);

  const emailValid = fields.email.length > 0 && EMAIL_RE.test(fields.email);

  function forgotPassword() {
    toast.info(
      'Contacte un administrateur pour réinitialiser ton mot de passe.',
      'Mot de passe oublié',
    );
  }

  return (
    <AuthScreenShell title="Connexion" subtitle="Content de te revoir.">
      <AppTextInput
        label="Adresse email"
        value={fields.email}
        onChangeText={update('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        placeholder="jane@example.com"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        hint={emailValid ? '✓ Format valide' : undefined}
        hintVariant="success"
      />

      <AppTextInput
        ref={passwordRef}
        label="Mot de passe"
        value={fields.password}
        onChangeText={update('password')}
        secureTextEntry
        autoComplete="current-password"
        placeholder="••••••••"
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <Text
        style={styles.forgot}
        onPress={forgotPassword}
        accessibilityRole="link"
      >
        Mot de passe oublié ?
      </Text>

      {error ? <Text style={styles.errorBox}>{error}</Text> : null}

      <AppButton
        title="Se connecter"
        loadingTitle="Connexion…"
        onPress={submit}
        loading={pending}
        disabled={!fields.email || !fields.password}
      />

      <Text
        style={styles.switchText}
        onPress={() => {
          Keyboard.dismiss();
          navigation.navigate('Register');
        }}
        accessibilityRole="link"
      >
        Pas encore de compte ?{' '}
        <Text style={styles.switchLink}>Créer un compte</Text>
      </Text>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'flex-end',
    color: colors.brandBlue,
    fontSize: 13,
    fontWeight: '600',
    marginTop: -spacing[2],
  },
  errorBox: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(179,38,30,0.10)',
    color: colors.stateError,
    fontSize: 13,
  },
  switchText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing[2],
  },
  switchLink: { color: colors.textPrimary, fontWeight: '700' },
});
