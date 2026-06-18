import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { type TextInput, Keyboard, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/app-button';
import { AppTextInput } from '../../../components/app-text-input';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors, radius, spacing } from '../../../theme';
import { AuthScreenShell } from '../components/auth-screen-shell';
import { useRegisterForm } from '../hooks/use-register-form';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.steps}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i + 1 <= current && styles.dotActive]}
        />
      ))}
    </View>
  );
}

export function RegisterScreen({ navigation }: Props) {
  const {
    fields,
    update,
    error,
    pending,
    submit,
    bothFilled,
    passwordsMatch,
    passwordRules,
  } = useRegisterForm();

  const [step, setStep] = useState<1 | 2>(1);

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const emailValid = fields.email.length > 0 && EMAIL_RE.test(fields.email);
  const step1Valid =
    fields.firstName.trim().length > 0 &&
    fields.lastName.trim().length > 0 &&
    emailValid;
  const allRulesValid = passwordRules.every((r) => r.valid);
  const step2Disabled =
    pending || !allRulesValid || !bothFilled || !passwordsMatch;

  if (step === 1) {
    return (
      <AuthScreenShell
        title="Inscription"
        subtitle="Renseigne tes informations."
        onBack={() => navigation.goBack()}
      >
        <StepIndicator current={1} total={2} />

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
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />
          </View>
          <View style={styles.flex}>
            <AppTextInput
              ref={lastNameRef}
              label="Nom"
              value={fields.lastName}
              onChangeText={update('lastName')}
              autoComplete="family-name"
              autoCapitalize="words"
              placeholder="Doe"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>
        </View>

        <AppTextInput
          ref={emailRef}
          label="Adresse email"
          value={fields.email}
          onChangeText={update('email')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          placeholder="jane@example.com"
          returnKeyType="done"
          onSubmitEditing={() => {
            if (step1Valid) setStep(2);
          }}
          hint={emailValid ? '✓ Format valide' : undefined}
          hintVariant="success"
        />

        <AppButton
          title="Suivant"
          onPress={() => setStep(2)}
          disabled={!step1Valid}
        />

        <Text
          style={styles.switchText}
          onPress={() => {
            Keyboard.dismiss();
            navigation.goBack();
          }}
          accessibilityRole="link"
        >
          Déjà un compte ? <Text style={styles.switchLink}>Se connecter</Text>
        </Text>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell
      title="Mot de passe"
      subtitle="Choisis un mot de passe sécurisé."
    >
      <StepIndicator current={2} total={2} />

      <View>
        <AppTextInput
          label="Mot de passe"
          value={fields.password}
          onChangeText={update('password')}
          secureTextEntry
          autoComplete="new-password"
          placeholder="••••••••"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
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
        ref={confirmRef}
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
        disabled={step2Disabled}
      />

      <Text
        style={styles.switchText}
        onPress={() => {
          Keyboard.dismiss();
          setStep(1);
        }}
        accessibilityRole="button"
      >
        ← <Text style={styles.switchLink}>Étape précédente</Text>
      </Text>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  steps: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderDefault,
  },
  dotActive: {
    backgroundColor: colors.brandBlue,
  },
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
