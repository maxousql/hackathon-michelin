import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { colors, radius } from '../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  hintVariant?: 'error' | 'success';
}

export const AppTextInput = forwardRef<TextInput, Props>(
  (
    {
      label,
      error,
      hint,
      hintVariant = 'error',
      style,
      secureTextEntry,
      ...props
    },
    ref,
  ) => {
    const [hidden, setHidden] = useState(secureTextEntry ?? false);

    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputWrap}>
          <TextInput
            ref={ref}
            style={[
              styles.input,
              secureTextEntry && styles.inputWithEye,
              error ? styles.inputError : null,
              style,
            ]}
            secureTextEntry={hidden}
            placeholderTextColor={colors.borderStrong}
            accessibilityLabel={label}
            accessibilityHint={error ?? hint}
            {...props}
          />
          {secureTextEntry && (
            <Pressable
              style={styles.eyeBtn}
              onPress={() => setHidden((h) => !h)}
              accessibilityLabel={
                hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'
              }
              accessibilityRole="button"
              hitSlop={8}
            >
              <Ionicons
                name={hidden ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>
        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : hint ? (
          <Text
            style={[
              styles.hint,
              hintVariant === 'success' && styles.hintSuccess,
            ]}
            accessibilityLiveRegion="polite"
          >
            {hint}
          </Text>
        ) : null}
      </View>
    );
  },
);

AppTextInput.displayName = 'AppTextInput';

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: colors.textPrimary,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceDefault,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputWithEye: {
    paddingRight: 48,
  },
  inputError: { borderColor: colors.stateError },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  error: { fontSize: 12, color: colors.stateError },
  hint: { fontSize: 12, color: colors.textSecondary },
  hintSuccess: { color: colors.stateSuccess },
});
