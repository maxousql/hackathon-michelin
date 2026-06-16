import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/app-button';
import { AppTextInput } from '../../../components/app-text-input';
import { ScreenWrapper } from '../../../components/screen-wrapper';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';
import { useRegisterForm } from '../hooks/use-register-form';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const {
    fields,
    update,
    error,
    pending,
    submit,
    isDisabled,
    bothFilled,
    passwordsMatch,
    passwordRules,
  } = useRegisterForm();

  return (
    <ScreenWrapper>
      <Text style={styles.eyebrow}>MICHELIN</Text>
      <Text style={styles.title}>Inscription</Text>
      <Text style={styles.subtitle}>Crée ton compte en quelques secondes.</Text>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppTextInput
              label="Prénom"
              value={fields.firstName}
              onChangeText={update('firstName')}
              autoComplete="given-name"
              autoCapitalize="words"
              placeholder="Jane"
              returnKeyType="next"
            />
          </View>
          <View style={styles.flex}>
            <AppTextInput
              label="Nom"
              value={fields.lastName}
              onChangeText={update('lastName')}
              autoComplete="family-name"
              autoCapitalize="words"
              placeholder="Doe"
              returnKeyType="next"
            />
          </View>
        </View>

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

        <View>
          <AppTextInput
            label="Mot de passe"
            value={fields.password}
            onChangeText={update('password')}
            secureTextEntry
            autoComplete="new-password"
            placeholder="••••••••"
            returnKeyType="next"
          />
          {fields.password.length > 0 && (
            <View style={styles.rules}>
              {passwordRules.map((rule) => (
                <Text
                  key={rule.label}
                  style={[styles.rule, rule.valid && styles.ruleValid]}
                  accessibilityLabel={`${rule.label} : ${rule.valid ? 'validé' : 'non validé'}`}
                >
                  {rule.valid ? '● ' : '○ '}
                  {rule.label}
                </Text>
              ))}
            </View>
          )}
        </View>

        <AppTextInput
          label="Confirmer le mot de passe"
          value={fields.confirm}
          onChangeText={update('confirm')}
          secureTextEntry
          autoComplete="new-password"
          placeholder="••••••••"
          returnKeyType="done"
          onSubmitEditing={submit}
          hint={
            bothFilled
              ? passwordsMatch
                ? 'Les mots de passe correspondent.'
                : 'Les mots de passe ne correspondent pas.'
              : undefined
          }
          hintVariant={bothFilled && passwordsMatch ? 'success' : 'error'}
        />

        {error ? <Text style={styles.errorBox}>{error}</Text> : null}

        <AppButton
          title="Créer mon compte"
          loadingTitle="Inscription…"
          onPress={submit}
          loading={pending}
          disabled={isDisabled}
        />

        <Text
          style={styles.switchText}
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="link"
        >
          Déjà un compte ? <Text style={styles.switchLink}>Se connecter</Text>
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    marginBottom: 12,
    color: colors.brandBlue,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    marginBottom: spacing[2],
    color: colors.textPrimary,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 44,
  },
  subtitle: {
    marginBottom: 40,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  form: { gap: spacing[4] },
  row: { flexDirection: 'row', gap: spacing[3] },
  flex: { flex: 1 },
  rules: { gap: 3, marginTop: spacing[1] },
  rule: { fontSize: 12, color: colors.textSecondary },
  ruleValid: { color: colors.stateSuccess },
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
