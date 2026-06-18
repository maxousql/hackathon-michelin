import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef } from 'react';
import {
  type TextInput,
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { toast } from '../../../utils/toast';

import { AppButton } from '../../../components/app-button';
import { AppTextInput } from '../../../components/app-text-input';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors, radius, spacing } from '../../../theme';
import { AuthScreenShell } from '../components/auth-screen-shell';
import { useLoginForm } from '../hooks/use-login-form';
import { useStravaLogin } from '../hooks/use-strava-login';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ navigation }: Props) {
  const { fields, update, error, pending, submit } = useLoginForm();
  const { connect: stravaConnect, loading: stravaLoading } = useStravaLogin();
  const passwordRef = useRef<TextInput>(null);

  const emailValid = fields.email.length > 0 && EMAIL_RE.test(fields.email);

  function forgotPassword() {
    toast.info(
      'Contacte un administrateur pour réinitialiser ton mot de passe.',
      'Mot de passe oublié',
    );
  }

  const switchFooter = (
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
  );

  return (
    <AuthScreenShell
      title="Connexion"
      subtitle="Content de te revoir."
      onBack={() => navigation.getParent()?.goBack()}
      footer={switchFooter}
    >
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

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.stravaBtn,
          pressed && { opacity: 0.85 },
          stravaLoading && { opacity: 0.7 },
        ]}
        onPress={stravaConnect}
        disabled={stravaLoading}
      >
        {stravaLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.stravaBtnIcon}>S</Text>
        )}
        <Text style={styles.stravaBtnText}>
          {stravaLoading ? 'Connexion…' : 'Continuer avec Strava'}
        </Text>
      </Pressable>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginVertical: spacing[2],
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderDefault },
  dividerText: { color: colors.textSecondary, fontSize: 12 },
  stravaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.large,
    backgroundColor: '#FC4C02',
  },
  stravaBtnIcon: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: '#fff',
    lineHeight: 22,
  },
  stravaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' as const },
  switchText: {
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 13,
    marginTop: spacing[2],
  },
  switchLink: {
    color: colors.brandBlue,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
