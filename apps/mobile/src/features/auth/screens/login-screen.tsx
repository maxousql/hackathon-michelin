import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { AppButton } from '../../../components/app-button';
import { AppTextInput } from '../../../components/app-text-input';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';
import { AuthScreenShell } from '../components/auth-screen-shell';
import { useLoginForm } from '../hooks/use-login-form';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { fields, update, error, pending, submit } = useLoginForm();

  return (
    <AuthScreenShell title="Connexion" subtitle="Content de te revoir.">
      <AppTextInput
        label="Adresse email"
        value={fields.email}
        onChangeText={update('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholder="jane@example.com"
        returnKeyType="next"
      />

      <AppTextInput
        label="Mot de passe"
        value={fields.password}
        onChangeText={update('password')}
        secureTextEntry
        autoComplete="current-password"
        placeholder="••••••••"
        returnKeyType="done"
        onSubmitEditing={submit}
      />

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
        onPress={() => navigation.navigate('Register')}
        accessibilityRole="link"
      >
        Pas encore de compte ?{' '}
        <Text style={styles.switchLink}>Créer un compte</Text>
      </Text>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
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
