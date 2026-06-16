import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/app-button';
import { AppTextInput } from '../../../components/app-text-input';
import { ScreenWrapper } from '../../../components/screen-wrapper';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';
import { useLoginForm } from '../hooks/use-login-form';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { fields, update, error, pending, submit } = useLoginForm();

  return (
    <ScreenWrapper>
      <Text style={styles.eyebrow}>MICHELIN</Text>
      <Text style={styles.title}>Connexion</Text>
      <Text style={styles.subtitle}>Content de te revoir.</Text>

      <View style={styles.form}>
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
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    marginBottom: 12,
    color: colors.blue,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    marginBottom: spacing.sm,
    color: colors.dark,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 44,
  },
  subtitle: {
    marginBottom: 40,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  form: { gap: spacing.md },
  errorBox: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.errorBg,
    color: colors.errorDark,
    fontSize: 13,
  },
  switchText: {
    textAlign: 'center',
    color: colors.subtle,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  switchLink: { color: colors.dark, fontWeight: '700' },
});
